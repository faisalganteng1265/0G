"use client";

import { useState, type FormEvent } from "react";
import { useAccount, usePublicClient, useReadContracts, useSendTransaction, useWriteContract } from "wagmi";

import { useTxToast } from "@/components/ToastProvider";
import { api } from "@/lib/api";
import { LIVE_REFETCH_INTERVAL_MS, formatOg, useMentors, usePendingCuratorRewards, useShareBalance, useSharePrice } from "@/hooks/useMarketplace";
import { hasMarketplaceAddress, MARKETPLACE_ADDRESS, marketplaceAbi } from "@/lib/contracts";

// 0.001 ETH base + 0.000002 ETH per share sold (from AccessSharesMarket.sol)
const BASE_PRICE = BigInt("1000000000000000");
const PRICE_SLOPE = BigInt("2000000000000");
const CURATOR_POOL = 500;

const ALLOCATION_COLORS = ["#14b8a6", "#facc15", "#6d5bd0", "#f97316", "#ec4899"];

import { subtleButtonClass, accentButtonClass, solidAccentBtn } from "./shared";

const panelClass = "border border-[rgba(96,165,250,0.24)] bg-black";

export default function SharesView() {
  const { address } = useAccount();
  const { data: mentors = [], isLoading: mentorsLoading } = useMentors();
  const mentorImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDmEXNoAf-cmrKUiwhuPOpaf-1mlPbR4cehM2rReUiOo2pR5YTe2Y_fOieBJYQw_jjpObE2rUSUeNDpZXLLkfqIKq9eDx6Fq3naaIJ6NOUdh6TvXdSpR1mBGR9lbNuKz4l-ipSme9cTTlN69LdjblpvS-GdoEpVRO9MKyUXZf-pgQ2gP1ewqG9FgLo7t-LG4nmGXSCJbKBwUhTzVhejUHG9tF_1qCcdCRUc30KxL-C4qKOU2qD6qXSfUOcieWVkEwOxSK5b6CoRPc0",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDwHax8-ONwCEu5RCRFNZaHEf3vFl3ZmHbQAdSZaM4Elv2YyMCoTOc0FZznxMitJ7LYmW39c3plK3Z8ehgMMV-ZK1-gKG21Qvd88ybTMVAgcJNZ61EUyP1Rzts6Af1PoKNP3L2pCYv1dXU_CpwzBY0H7T9WSL1UOwc4J795T3fNLfTee_C1ACovI8R5NBnWJ869DYe0pPkbhyIkST18eVEFU5SXJdxPbakmqDidBwNJorTZNOftAcjn4GlJ0zGc6U-ZcNNl5BltlBc",
  ];
  // Batch-fetch balance + price + rewards for every mentor
  const batchContracts = address && mentors.length > 0
    ? mentors.flatMap((mentor) => [
        { address: MARKETPLACE_ADDRESS, abi: marketplaceAbi, functionName: "getShareBalance" as const, args: [BigInt(mentor.tokenId), address] },
        { address: MARKETPLACE_ADDRESS, abi: marketplaceAbi, functionName: "getSharePrice" as const, args: [BigInt(mentor.tokenId)] },
        { address: MARKETPLACE_ADDRESS, abi: marketplaceAbi, functionName: "getPendingCuratorRewards" as const, args: [BigInt(mentor.tokenId), address] },
      ])
    : [];

  const { data: batchResults } = useReadContracts({
    contracts: batchContracts,
    query: {
      enabled: Boolean(address && mentors.length > 0 && hasMarketplaceAddress),
      refetchInterval: LIVE_REFETCH_INTERVAL_MS,
      refetchIntervalInBackground: false,
      staleTime: 4_000,
    },
  });

  const portfolioItems = mentors.map((mentor, i) => {
    const balance = Number(batchResults?.[i * 3]?.result ?? 0);
    const price = (batchResults?.[i * 3 + 1]?.result as bigint | undefined) ?? BigInt(0);
    const rewards = (batchResults?.[i * 3 + 2]?.result as bigint | undefined) ?? BigInt(0);
    const value = BigInt(balance) * price;
    return { mentor, balance, price, rewards, value, image: mentorImages[i % mentorImages.length] };
  });
  const ownedPortfolioItems = portfolioItems.filter((item) => item.balance > 0);
  const ownedSharePositions = ownedPortfolioItems.map((item) => ({
    mentor: item.mentor.name,
    shares: `${item.balance} shares`,
    portfolio: `Mentor #${item.mentor.tokenId}`,
    price: formatOg(item.price),
    change: "+0.0%",
    rewards: formatOg(item.rewards),
    tokenId: item.mentor.tokenId,
    image: item.image,
  }));

  const totalValue = portfolioItems.reduce((sum, item) => sum + item.value, BigInt(0));
  const totalRewards = portfolioItems.reduce((sum, item) => sum + item.rewards, BigInt(0));
  const activeMentorCount = ownedPortfolioItems.length;

  const allocationItems = portfolioItems
    .filter((item) => item.balance > 0)
    .reduce<{
      accumulated: number;
      items: Array<{
        color: string;
        name: string;
        tokenId: number;
        value: string;
        pct: string;
        start: number;
        end: number;
      }>;
    }>((state, item, i) => {
      const pct = totalValue > BigInt(0)
        ? Number((item.value * BigInt(10000)) / totalValue) / 100
        : 0;
      const start = state.accumulated;
      const end = start + pct;
      return {
        accumulated: end,
        items: [
          ...state.items,
          {
            color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
            name: item.mentor.name,
            tokenId: item.mentor.tokenId,
            value: formatOg(item.value),
            pct: `${pct.toFixed(1)}%`,
            start,
            end,
          },
        ],
      };
    }, { accumulated: 0, items: [] }).items;

  const conicGradient = allocationItems.length > 0
    ? `conic-gradient(${allocationItems.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(",")})`
    : "conic-gradient(#1f2937 0% 100%)";

  const statCards = [
    { label: "Portfolio Value", value: formatOg(totalValue), detail: "Total share value", icon: "stack", stroke: "#2dd4bf" },
    { label: "Usage Rewards", value: formatOg(totalRewards), detail: "Unclaimed rewards", icon: "shield", stroke: "#2dd4bf" },
    { label: "Active Mentors", value: String(activeMentorCount), detail: "Mentors with exposure", icon: "users", stroke: "#2dd4bf" },
    { label: "Avg Yield", value: "—", detail: "Weekly yield trend", icon: "percent", stroke: "#2dd4bf" },
  ];

  return (
    <div className="shares-reference">
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`${panelClass} rounded-[7px] p-4`}>
            <div className="flex items-start gap-4">
              <div className="mt-0.5 shrink-0">
                {stat.icon === "stack" && (
                  <svg width="44" height="44" viewBox="0 0 20 20" fill="none">
                    <ellipse cx="10" cy="5" rx="6" ry="2.5" stroke={stat.stroke} strokeWidth="1.4" />
                    <path d="M4 5V10C4 11.4 6.7 12.5 10 12.5C13.3 12.5 16 11.4 16 10V5" stroke={stat.stroke} strokeWidth="1.4" />
                    <path d="M4 10V15C4 16.4 6.7 17.5 10 17.5C13.3 17.5 16 16.4 16 15V10" stroke={stat.stroke} strokeWidth="1.4" />
                  </svg>
                )}
                {stat.icon === "shield" && (
                  <svg width="44" height="44" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2.5L16 5V9.5C16 13.2 13.6 16 10 17.5C6.4 16 4 13.2 4 9.5V5L10 2.5Z" stroke={stat.stroke} strokeWidth="1.4" />
                    <path d="M7.4 9.7L9.2 11.4L12.8 7.6" stroke={stat.stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {stat.icon === "users" && (
                  <svg width="44" height="44" viewBox="0 0 20 20" fill="none">
                    <circle cx="7.5" cy="7" r="2.5" stroke={stat.stroke} strokeWidth="1.4" />
                    <circle cx="13.5" cy="8" r="2" stroke={stat.stroke} strokeWidth="1.4" />
                    <path d="M3.5 16C4 13.5 5.5 12.2 7.5 12.2C9.5 12.2 11 13.5 11.5 16" stroke={stat.stroke} strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M11.5 13.2C13.8 13 15.5 14 16.2 16" stroke={stat.stroke} strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
                {stat.icon === "percent" && (
                  <svg width="44" height="44" viewBox="0 0 20 20" fill="none">
                    <path d="M5 15L15 5" stroke={stat.stroke} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="6.5" cy="6.5" r="2" stroke={stat.stroke} strokeWidth="1.3" />
                    <circle cx="13.5" cy="13.5" r="2" stroke={stat.stroke} strokeWidth="1.3" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b95a3]">{stat.label}</p>
                {mentorsLoading
                  ? <div className="h-7 w-14 animate-pulse rounded bg-[#1f2937]" />
                  : <p className="text-[22px] font-bold leading-none text-white">{stat.value}</p>
                }
                <div className="mt-1 flex items-center justify-between gap-4">
                  <p className="shrink-0 text-[10px] text-[#707b89]">{stat.detail}</p>
                  <svg viewBox="0 0 120 24" className="h-6 w-[82px] shrink-0" fill="none">
                    <path d="M0 18L8 17L14 10L20 16L27 13L33 15L40 9L48 13L55 7L62 12L70 10L78 5L86 17L94 12L101 14L110 8L120 10" stroke="#2dd4bf" strokeWidth="1.4" />
                    <path d="M0 24L0 18L8 17L14 10L20 16L27 13L33 15L40 9L48 13L55 7L62 12L70 10L78 5L86 17L94 12L101 14L110 8L120 10L120 24Z" fill="url(#shareSpark)" opacity="0.18" />
                    <defs>
                      <linearGradient id="shareSpark" x1="60" x2="60" y1="5" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2dd4bf" />
                        <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_1fr]">
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#2dd4bf]">▥</span>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Portfolio Performance</h2>
                <span className="rounded border border-[#1f2937] bg-[#0d1114] px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] text-[#374151]">ILLUSTRATIVE</span>
              </div>
              <p className="mt-1 pl-6 text-[10px] text-[#707b89]">Total portfolio value over time (OG)</p>
            </div>
            <div className="grid grid-cols-4 overflow-hidden rounded border border-[rgba(96,165,250,0.16)] text-[9px] font-bold">
              {["1W", "1M", "3M", "ALL"].map((range) => (
                <button key={range} className={`px-3 py-1.5 ${range === "1M" ? "bg-[rgba(45,212,191,0.1)] text-[#2dd4bf]" : "text-[#6b7280]"}`}>
                  {range}
                </button>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 720 210" className="h-[210px] w-full" fill="none" preserveAspectRatio="none">
            {[30, 68, 106, 144, 182].map((y) => (
              <line key={y} x1="44" x2="705" y1={y} y2={y} stroke="rgba(96,165,250,0.12)" />
            ))}
            {["720K", "660K", "600K", "540K", "480K"].map((label, index) => (
              <text key={label} x="0" y={34 + index * 38} fill="#707b89" fontSize="11">{label}</text>
            ))}
            <path d="M45 172L66 158L78 128L92 144L110 139L126 132L142 141L162 126L180 121L196 103L214 98L232 78L252 101L272 113L292 99L312 90L334 91L352 116L374 111L394 94L414 99L432 88L452 84L470 74L490 88L508 70L528 39L548 22L568 30L586 16L608 22L628 16L650 7L672 3L690 12" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" />
            <path d="M45 210L45 172L66 158L78 128L92 144L110 139L126 132L142 141L162 126L180 121L196 103L214 98L232 78L252 101L272 113L292 99L312 90L334 91L352 116L374 111L394 94L414 99L432 88L452 84L470 74L490 88L508 70L528 39L548 22L568 30L586 16L608 22L628 16L650 7L672 3L690 12L690 210Z" fill="url(#portfolioArea)" />
            <line x1="650" x2="650" y1="8" y2="187" stroke="#2dd4bf" strokeDasharray="3 3" opacity="0.5" />
            <circle cx="650" cy="7" r="5" fill="#2dd4bf" />
            <rect x="672" y="0" width="56" height="18" rx="4" fill="#2dd4bf" />
            <text x="681" y="13" fill="#06221f" fontSize="10" fontWeight="700">684K OG</text>
            {["Apr 22", "Apr 29", "May 6", "May 13", "May 20"].map((label, index) => (
              <text key={label} x={48 + index * 150} y="205" fill="#707b89" fontSize="11">{label}</text>
            ))}
            <defs>
              <linearGradient id="portfolioArea" x1="360" x2="360" y1="5" y2="210" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2dd4bf" stopOpacity="0.38" />
                <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[#2dd4bf]">◈</span>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Allocation</h2>
          </div>
          <div className="grid items-center gap-5 md:grid-cols-[170px_1fr]">
            <div>
              <div
                className="relative mx-auto h-[160px] w-[160px] rounded-full p-[22px] shadow-[0_0_34px_rgba(45,212,191,0.1)]"
                style={{ background: conicGradient }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-[rgba(96,165,250,0.18)] bg-[#071014] text-center">
                  <span className="text-[14px] font-bold text-white">{formatOg(totalValue)}</span>
                  <span className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#6b7280]">Total</span>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-[#707b89]">Allocation by share value</p>
            </div>
            <div className="overflow-hidden rounded border border-[rgba(96,165,250,0.2)]">
              {allocationItems.length === 0 ? (
                <div className="px-4 py-6 text-center text-[11px] text-[#4b5563]">Buy shares to see allocation.</div>
              ) : allocationItems.map(({ color, name, tokenId, value, pct }) => (
                <div key={tokenId} className="grid grid-cols-[14px_1fr_auto] items-center gap-3 border-b border-[rgba(96,165,250,0.15)] px-4 py-3 last:border-b-0">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span>
                    <span className="block text-[11px] font-bold text-white">{name}</span>
                    <span className="text-[10px] text-[#707b89]">{value}</span>
                  </span>
                  <span className="text-[12px] font-bold text-white">{pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.78fr]">
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[#2dd4bf]">◇</span>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Share Positions</h2>
          </div>
          <div className="overflow-x-auto">
          <div className="min-w-[520px]">
          <div className="grid grid-cols-[1.35fr_0.9fr_0.8fr_0.75fr_0.8fr_1fr] gap-3 border-b border-[rgba(96,165,250,0.16)] pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#586474]">
            <span>Mentor</span><span>Position</span><span>Share Price</span><span>Weekly Change</span><span>Rewards</span><span>Action</span>
          </div>
          {!address ? (
            <div className="py-8 text-center text-[11px] text-[#4b5563]">Connect wallet to view your share positions.</div>
          ) : ownedSharePositions.length === 0 ? (
            <div className="py-8 text-center text-[11px] text-[#4b5563]">No share positions for this wallet yet. Buy shares from the table below.</div>
          ) : ownedSharePositions.map((row) => (
            <SharePositionRow key={row.tokenId} row={row} user={address} />
          ))}
          </div>
          </div>
          <p className="mt-3 text-[10px] text-[#707b89]">
            Showing {ownedSharePositions.length} position{ownedSharePositions.length !== 1 ? "s" : ""} for connected wallet
          </p>
        </div>

        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#2dd4bf]">◷</span>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Recent Reward Activity</h2>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2dd4bf]">View all</button>
          </div>
          <div className="mb-4 flex flex-col gap-3">
            {portfolioItems.filter((item) => item.balance > 0).length === 0 ? (
              <div className="py-6 text-center text-[11px] text-[#4b5563]">No reward activity yet.</div>
            ) : portfolioItems.filter((item) => item.balance > 0).map((item) => (
              <div key={item.mentor.tokenId} className="grid grid-cols-[36px_1fr_auto] items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-[rgba(45,212,191,0.32)] bg-[rgba(45,212,191,0.08)] text-[#2dd4bf]">♙</div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-white">{item.mentor.name}</p>
                  <p className="truncate text-[10px] text-[#707b89]">Pending curator rewards</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-[#2dd4bf]">{formatOg(item.rewards)}</p>
                </div>
              </div>
            ))}
          </div>
          <button className={`flex w-full items-center justify-center gap-2 py-2.5 text-[10px] ${accentButtonClass}`}>
            VIEW ALL ACTIVITY <span className="text-base leading-none">→</span>
          </button>
        </div>
      </div>

      {/* Buy Shares */}
      <div className="mt-4">
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#2dd4bf]">⊕</span>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Buy Shares</h2>
              <span className="ml-1 rounded border border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] px-1.5 py-0.5 text-[9px] font-bold text-[#2dd4bf]">BONDING CURVE</span>
            </div>
            <div className="flex items-center gap-3">
              <button className={`${subtleButtonClass} px-3 py-1.5 text-[10px]`}>Sort: Trending ⌄</button>
            </div>
          </div>

          <div className="overflow-x-auto">
          <div className="min-w-[560px] overflow-hidden rounded border border-[rgba(96,165,250,0.14)]">
            <div className="grid grid-cols-[1.4fr_0.8fr_1fr_0.6fr_0.6fr_1fr] gap-3 bg-[rgba(255,255,255,0.025)] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.12em] text-[#586474]">
              <span>Mentor</span><span>Share Price</span><span>Shares Sold</span><span>Status</span><span>Confidence</span><span>Action</span>
            </div>
            {portfolioItems.length === 0 ? (
              <div className="px-3 py-8 text-center text-[11px] text-[#4b5563]">No mentors on-chain yet.</div>
            ) : portfolioItems.map((item) => {
              const sold = item.price > BASE_PRICE ? Number((item.price - BASE_PRICE) / PRICE_SLOPE) : 0;
              const soldPct = Math.min(100, Math.round((sold / CURATOR_POOL) * 100));
              return (
                <div key={item.mentor.tokenId} className="grid grid-cols-[1.4fr_0.8fr_1fr_0.6fr_0.6fr_1fr] items-center gap-3 border-t border-[rgba(96,165,250,0.12)] px-3 py-3 text-[11px]">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] text-[#2dd4bf]">⬡</div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{item.mentor.name}</p>
                      <p className="text-[9px] text-[#707b89]">{item.mentor.category}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-white">{formatOg(item.price)}</p>
                    <p className="text-[9px] text-[#707b89]">per share</p>
                  </div>
                  <div>
                    <p className="mb-1 font-bold text-white">{sold} / {CURATOR_POOL}</p>
                    <div className="h-[3px] w-full rounded-full bg-[rgba(96,165,250,0.14)]">
                      <div className="h-[3px] rounded-full bg-[#2dd4bf]" style={{ width: `${soldPct}%` }} />
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold ${item.mentor.status === 2 ? "text-[#2dd4bf]" : "text-[#fbbf24]"}`}>
                    {item.mentor.status === 2 ? "READY" : item.mentor.status === 1 ? "REVIEW" : "DRAFT"}
                  </span>
                  <span className="font-bold text-[#d1d5db]">{item.mentor.confidenceScore}%</span>
                  <div className="flex items-center justify-end gap-2">
                    <BuySharesButton tokenId={item.mentor.tokenId} className={`px-3 py-1.5 text-[9px] ${solidAccentBtn}`} />
                  </div>
                </div>
              );
            })}
          </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-[#707b89]">
            <span>Showing {portfolioItems.length} mentor{portfolioItems.length !== 1 ? "s" : ""} on-chain</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuySharesButton({ tokenId, className }: { tokenId: number; className: string }) {
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();
  const txToast = useTxToast();
  const [busy, setBusy] = useState(false);

  async function handleBuy() {
    setBusy(true);
    try {
      await txToast("Buy share", async () => {
        const result = await api.buildBuySharesTx({ tokenId, amount: 1 });
        const hash = await sendTransactionAsync({
          to: result.tx.to,
          data: result.tx.data,
          value: BigInt(result.tx.value),
        });
        await publicClient?.waitForTransactionReceipt({ hash });
        return hash;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className={className} disabled={busy} onClick={handleBuy} type="button">
      {busy ? "PENDING..." : "BUY"}
    </button>
  );
}

type SharePosition = {
  mentor: string;
  shares: string;
  portfolio: string;
  price: string;
  change: string;
  rewards: string;
  image: string;
  tokenId?: number;
};

function SharePositionRow({ row, user }: { row: SharePosition; user?: `0x${string}` }) {
  const { writeContractAsync } = useWriteContract();
  const txToast = useTxToast();
  const [sellModal, setSellModal] = useState(false);
  const [sellAmount, setSellAmount] = useState("1");
  const balance = useShareBalance(row.tokenId, user);
  const price = useSharePrice(row.tokenId);
  const pendingRewards = usePendingCuratorRewards(row.tokenId, user);
  const liveShares = row.tokenId !== undefined && balance.data !== undefined ? `${Number(balance.data)} shares` : row.shares;
  const livePrice = row.tokenId !== undefined && price.data !== undefined ? formatOg(price.data as bigint) : row.price;
  const liveRewards = row.tokenId !== undefined && pendingRewards.data !== undefined ? formatOg(pendingRewards.data as bigint) : row.rewards;

  async function claimRewards() {
    if (row.tokenId === undefined) return;
    const tokenId = row.tokenId;
    await txToast("Claim rewards", () =>
      writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: marketplaceAbi,
        functionName: "claimCuratorRewards",
        args: [BigInt(tokenId)],
      }),
    );
    await pendingRewards.refetch();
  }

  async function sellShares(e: FormEvent) {
    e.preventDefault();
    if (row.tokenId === undefined) return;
    const tokenId = row.tokenId;
    const amount = Number(sellAmount);
    if (!amount || amount < 1) return;
    setSellModal(false);
    await txToast("Sell shares", () =>
      writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: marketplaceAbi,
        functionName: "sellShares",
        args: [BigInt(tokenId), amount],
      }),
    );
    await balance.refetch();
  }

  return (
    <>
      <div className="grid grid-cols-[1.35fr_0.9fr_0.8fr_0.75fr_0.8fr_1fr] items-center gap-3 border-b border-[rgba(96,165,250,0.12)] py-3 text-[11px]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded border border-[rgba(96,165,250,0.25)] bg-cover bg-center" style={{ backgroundImage: `url(${row.image})` }} />
          <div className="min-w-0">
            <p className="truncate font-bold text-white">{row.mentor}</p>
            <span className="mt-1 inline-flex rounded border border-[rgba(45,212,191,0.35)] bg-[rgba(45,212,191,0.08)] px-1.5 py-0.5 text-[8px] font-bold text-[#2dd4bf]">ACTIVE</span>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">{liveShares}</p>
          <p className="text-[10px] text-[#707b89]">{row.portfolio}</p>
        </div>
        <p className="font-bold text-white">{livePrice}</p>
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#2dd4bf]">{row.change}</span>
          <svg viewBox="0 0 60 18" className="h-4 w-11" fill="none">
            <path d="M0 9L6 12L12 10L18 13L24 8L30 10L36 7L42 8L48 4L54 5L60 2" stroke="#2dd4bf" strokeWidth="1.3" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-white">{liveRewards}</p>
          <p className="text-[10px] text-[#707b89]">Available</p>
        </div>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-1.5 text-[9px] ${accentButtonClass}`} disabled={row.tokenId === undefined} onClick={claimRewards} type="button">CLAIM</button>
          <button className={`px-3 py-1.5 text-[9px] ${subtleButtonClass}`} disabled={row.tokenId === undefined} onClick={() => setSellModal(true)} type="button">MANAGE</button>
          <span className="text-[#586474]">⋮</span>
        </div>
      </div>

      {sellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={sellShares}
            className="w-full max-w-[320px] rounded border border-[rgba(96,165,250,0.24)] bg-black p-5 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-white">Sell Shares</h3>
              <button type="button" onClick={() => setSellModal(false)} className="text-[#6b7280] hover:text-white">×</button>
            </div>
            <p className="mb-4 text-[10px] leading-[1.5] text-[#707b89]">
              Position: <span className="text-white">{liveShares}</span> of <span className="text-white">{row.mentor}</span>
            </p>
            <input
              type="number"
              min="1"
              required
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="mb-4 w-full rounded border border-[#26333d] bg-[#050607] px-3 py-2 text-xs text-white outline-none placeholder:text-[#586474]"
              placeholder="Amount to sell"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSellModal(false)}
                className="flex-1 rounded border border-[#374151] bg-transparent py-2.5 font-mono text-[10px] font-bold tracking-[0.1em] text-[#9ca3af] hover:border-[#4b5563] hover:text-white transition-colors"
              >CANCEL</button>
              <button
                type="submit"
                disabled={!sellAmount || Number(sellAmount) < 1}
                className="flex-1 rounded border border-[rgba(45,212,191,0.5)] bg-[rgba(45,212,191,0.08)] py-2.5 font-mono text-[10px] font-bold tracking-[0.1em] text-[#2dd4bf] hover:bg-[rgba(45,212,191,0.14)] disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >SELL</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

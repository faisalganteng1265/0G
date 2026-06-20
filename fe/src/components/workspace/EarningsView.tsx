"use client";

import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";

import { useTxToast } from "@/components/ToastProvider";
import {
  formatSui,
  shortAddress,
  useMentorRoyaltyClaimableBatch,
  useMentorRoyaltyClaimedEvents,
  useMentors,
  useVestingClaimable,
  useVestingProgress,
} from "@/hooks/useMarketplace";
import { CONFIG_ID, PACKAGE_ID } from "@/lib/contracts";

import { subtleButtonClass, solidAccentBtn } from "./shared";

const panelClass = "border border-[rgba(96,165,250,0.24)] bg-black";

// Mirror of revenue.move's MENTOR_BPS/CURATOR_BPS/BPS_DENOM constants
const MENTOR_BPS = 6000;
const CURATOR_BPS = 2500;
const BPS_DENOM = 10000;
const PLATFORM_BPS = BPS_DENOM - MENTOR_BPS - CURATOR_BPS;
const mentorPct = Math.round((MENTOR_BPS / BPS_DENOM) * 100);
const curatorPct = Math.round((CURATOR_BPS / BPS_DENOM) * 100);
const platformPct = Math.round((PLATFORM_BPS / BPS_DENOM) * 100);
const curatorBoundary = mentorPct + curatorPct;

export default function EarningsView() {
  const account = useCurrentAccount();
  const address = account?.address;
  const { data: mentors = [], isLoading: mentorsLoading } = useMentors();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const txToast = useTxToast();
  const myMentors = address ? mentors.filter((mentor) => mentor.creator.toLowerCase() === address.toLowerCase()) : [];

  const { data: claimableByPool = {} } = useMentorRoyaltyClaimableBatch(myMentors.map((mentor) => mentor.revenuePoolId));

  const totalClaimableMist = myMentors.reduce((sum, mentor) => sum + (claimableByPool[mentor.revenuePoolId] ?? 0), 0);
  const claimableMentors = myMentors.filter((mentor) => (claimableByPool[mentor.revenuePoolId] ?? 0) > 0);

  const totalQueries = myMentors.reduce((sum, m) => sum + m.totalQueries, 0);

  const { data: allRoyaltyEvents = [] } = useMentorRoyaltyClaimedEvents();
  const payoutEvents = address
    ? allRoyaltyEvents.filter((event) => event.mentor.toLowerCase() === address.toLowerCase())
    : [];

  const statCards = [
    ["◎", "Total Queries", String(totalQueries), "Across all my mentors", "on-chain"],
    ["♕", "Mentor Royalty", formatSui(totalClaimableMist), "Claimable now", "from contract"],
    ["♣", "Payout Events", String(payoutEvents.length), "Historical claims", "on-chain logs"],
    ["▱", "Active Mentors", String(myMentors.length), "Mentors I own", "registered"],
  ];

  const vestingRows = myMentors.map((mentor) => ({
    name: mentor.name,
    category: mentor.category,
    nftId: mentor.nftId,
    stateId: mentor.stateId,
    revenuePoolId: mentor.revenuePoolId,
    vestingScheduleId: mentor.vestingScheduleId,
  }));

  async function claimAllRoyalties() {
    for (const mentor of claimableMentors) {
      await txToast(`Claim ${mentor.name}`, async () => {
        const tx = new Transaction();
        tx.moveCall({
          target: `${PACKAGE_ID}::marketplace::claim_mentor_royalty`,
          arguments: [tx.object(mentor.nftId), tx.object(mentor.revenuePoolId)],
        });
        return (await signAndExecute({ transaction: tx })).digest;
      });
    }
  }

  return (
    <div className="earnings-reference">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(([icon, label, value, detail, trend]) => (
          <div key={label} className={`${panelClass} rounded-[7px] p-4`}>
            <div className="flex items-start gap-4">
              <span className="mt-0.5 shrink-0 text-[56px] leading-none text-[#2dd4bf]">{icon}</span>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b95a3]">{label}</p>
                {mentorsLoading
                  ? <div className="h-7 w-14 animate-pulse rounded bg-[#1f2937]" />
                  : <p className="text-[22px] font-bold leading-none text-white">{value}</p>
                }
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-[#707b89]">{detail}</p>
                    <p className="mt-1 text-[9px] font-bold text-[#2dd4bf]">{trend}</p>
                  </div>
                  <svg viewBox="0 0 120 44" className="h-11 w-[88px] shrink-0" fill="none">
                    <path d="M0 30L8 26L16 34L24 31L32 22L40 18L48 12L56 16L64 28L72 20L80 17L88 7L96 3L104 12L112 24L120 15" stroke="#2dd4bf" strokeWidth="2" />
                    <path d="M0 44L0 30L8 26L16 34L24 31L32 22L40 18L48 12L56 16L64 28L72 20L80 17L88 7L96 3L104 12L112 24L120 15L120 44Z" fill="#2dd4bf" opacity="0.18" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.86fr_0.42fr]">
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#8b95a3]">↯</span>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Revenue Overview</h2>
              <span className="rounded border border-[#1f2937] bg-[#0d1114] px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] text-[#374151]">ILLUSTRATIVE</span>
            </div>
            <div className="flex items-center gap-2">
              {["1W", "1M", "3M", "ALL"].map((range) => (
                <button key={range} className={`rounded border border-[rgba(96,165,250,0.14)] px-2.5 py-1.5 text-[9px] font-bold ${range === "1M" ? "bg-[#2dd4bf]/10 text-[#2dd4bf]" : "text-[#707b89]"}`}>
                  {range}
                </button>
              ))}
              <button className={`${subtleButtonClass} px-2 py-1 text-[10px]`}>▣</button>
            </div>
          </div>
          <svg viewBox="0 0 700 260" className="h-[260px] w-full" fill="none" preserveAspectRatio="none">
            {[42, 84, 126, 168, 210].map((y) => (
              <line key={y} x1="42" x2="602" y1={y} y2={y} stroke="rgba(96,165,250,0.12)" />
            ))}
            {["SUI", "1.6K", "1.2K", "800", "400", "0"].map((label, i) => (
              <text key={label} x="0" y={28 + i * 42} fill="#707b89" fontSize="11">{label}</text>
            ))}
            <path d="M42 190L60 150L78 142L96 160L116 176L136 184L156 178L176 190L196 154L216 104L236 122L256 98L276 91L296 80L316 42L336 24L356 52L376 39L396 31L416 18L436 62L456 106L476 129L496 151L516 132L536 115L556 108L576 98L596 135L616 101L636 87L656 76L676 113L696 42" stroke="#2dd4bf" strokeWidth="3" />
            <path d="M42 232L42 190L60 150L78 142L96 160L116 176L136 184L156 178L176 190L196 154L216 104L236 122L256 98L276 91L296 80L316 42L336 24L356 52L376 39L396 31L416 18L436 62L456 106L476 129L496 151L516 132L536 115L556 108L576 98L596 135L616 101L636 87L656 76L676 113L696 42L696 232Z" fill="url(#earningArea)" />
            <circle cx="696" cy="42" r="5" fill="#2dd4bf" />
            <text x="616" y="38" fill="#2dd4bf" fontSize="11" fontWeight="700">CURRENT</text>
            <text x="616" y="62" fill="white" fontSize="13" fontWeight="700">12,840 SUI</text>
            <text x="616" y="84" fill="#2dd4bf" fontSize="11" fontWeight="700">▲ 12.4%</text>
            {["Apr 27", "May 4", "May 11", "May 18", "May 25", "May 31"].map((label, index) => (
              <text key={label} x={46 + index * 112} y="252" fill="#707b89" fontSize="11">{label}</text>
            ))}
            <defs>
              <linearGradient id="earningArea" x1="360" x2="360" y1="18" y2="232" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2dd4bf" stopOpacity="0.32" />
                <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-5 flex items-center gap-2">
            <span className="text-[#8b95a3]">◔</span>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Revenue Split</h2>
          </div>
          <div className="grid items-center gap-5 md:grid-cols-[170px_1fr]">
            <div
              className="relative h-[170px] w-[170px] rounded-full p-[28px]"
              style={{ background: `conic-gradient(#2dd4bf 0 ${mentorPct}%, #67e8f9 ${mentorPct}% ${curatorBoundary}%, #475569 ${curatorBoundary}% 100%)` }}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#071014] text-center">
                <span className="text-[13px] font-bold text-white">{formatSui(totalClaimableMist)}</span>
                <span className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#707b89]">Claimable</span>
              </div>
            </div>
            <div>
              {[
                ["#2dd4bf", "Mentor royalty", `${mentorPct}%`],
                ["#67e8f9", "Curator rewards", `${curatorPct}%`],
                ["#64748b", "Platform fee", `${platformPct}%`],
              ].map(([color, label, pct]) => (
                <div key={label} className="grid grid-cols-[14px_1fr_auto] items-center gap-3 border-b border-[rgba(96,165,250,0.14)] py-3 last:border-b-0">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span>
                    <span className="block text-[11px] text-[#d1d5db]">{label}</span>
                    <span className="text-[10px] text-[#707b89]">Protocol constant</span>
                  </span>
                  <span className="text-[12px] font-bold text-white">{pct}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 text-[10px] text-[#707b89]">Distribution based on protocol rules and usage.</p>

          <div className="mt-5 border-t border-[rgba(96,165,250,0.12)] pt-4">
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.12em] text-[#586474]">MY MENTORS</p>
            {myMentors.length === 0 ? (
              <p className="text-[11px] text-[#4b5563]">No mentors registered yet.</p>
            ) : myMentors.map((mentor) => (
              <div key={mentor.stateId} className="mb-3 last:mb-0">
                <div className="mb-1.5 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
                    <span className="text-[#d1d5db]">{mentor.name}</span>
                  </div>
                  <span className="font-bold text-white">{mentor.totalQueries} queries</span>
                </div>
                <div className="h-[4px] rounded-full bg-[rgba(96,165,250,0.14)]">
                  <div className="h-[4px] rounded-full bg-[#2dd4bf]" style={{ width: `${mentor.confidenceScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${panelClass} overflow-hidden rounded-[7px]`}>
          <div className="border-b border-[#2dd4bf]/30 bg-[rgba(45,212,191,0.035)] p-4">
            <div className="mb-8 flex items-center gap-2 text-[#2dd4bf]">
              <span className="text-[18px]">▣</span>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.12em]">Claimable Rewards</h2>
            </div>
            <p className="text-center text-[26px] font-bold text-white">{formatSui(totalClaimableMist)}</p>
            <p className="mt-3 text-center text-[11px] text-[#d1d5db]">Available to claim</p>
          </div>
          <div className="p-4">
            <p className="mb-5 text-center text-[11px] leading-[1.6] text-[#8b95a3]">Claims every mentor with available royalties. One wallet confirmation per mentor.</p>
            <button className={`flex w-full items-center justify-center gap-2 py-2.5 text-[10px] ${solidAccentBtn}`} disabled={claimableMentors.length === 0} onClick={claimAllRoyalties} type="button">CLAIM ALL REWARDS <span className="text-base leading-none">›</span></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[#8b95a3]">▢</span>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Vesting Queue</h2>
          </div>
          <div className="overflow-x-auto">
          <div className="min-w-[500px]">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.45fr] gap-3 border-b border-[rgba(96,165,250,0.14)] pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#586474]">
            <span>Mentor / Package</span><span>Unlocks In</span><span>Amount</span><span>Progress</span><span>Claim Date</span>
          </div>
          {vestingRows.length === 0 ? (
            <div className="py-8 text-center text-[11px] text-[#4b5563]">No mentors found. Register a mentor first.</div>
          ) : vestingRows.map((row, index) => (
            <VestingRow key={row.stateId} row={row} index={index} />
          ))}
          </div>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2dd4bf]">VIEW ALL VESTING <span>›</span></button>
        </div>

        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[#8b95a3]">⌁</span>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Recent Payout Activity</h2>
          </div>
          <div className="overflow-x-auto">
          <div className="min-w-[440px]">
          <div className="grid grid-cols-[1fr_1fr_0.6fr_0.7fr] gap-3 border-b border-[rgba(96,165,250,0.14)] pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#586474]">
            <span>Event</span><span>Source</span><span>Time</span><span className="text-right">Amount</span>
          </div>
          {payoutEvents.length === 0 ? (
            <div className="py-8 text-center text-[11px] text-[#4b5563]">No payout events yet. Claim royalties to see activity here.</div>
          ) : payoutEvents.slice(0, 5).map((event) => {
            const mentor = myMentors.find((m) => m.revenuePoolId === event.poolId);
            return (
              <div key={event.txDigest} className="grid grid-cols-[1fr_1fr_0.6fr_0.7fr] items-center gap-3 border-b border-[rgba(96,165,250,0.12)] py-3 text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 text-[#2dd4bf]">♕</span>
                  <span className="text-[#d1d5db]">Mentor Royalty</span>
                </div>
                <span className="text-[#8b95a3]">{mentor?.name ?? shortAddress(event.poolId)}</span>
                <span className="text-[#8b95a3]">{event.timestampMs ? new Date(event.timestampMs).toLocaleDateString() : "-"}</span>
                <span className="text-right font-bold text-[#2dd4bf]">+{formatSui(event.amountMist)}</span>
              </div>
            );
          })}
          </div>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2dd4bf]">VIEW ALL ACTIVITY <span>›</span></button>
        </div>
      </div>
    </div>
  );
}

function VestingRow({
  row,
  index,
}: {
  row: {
    name: string;
    category: string;
    nftId: string;
    stateId: string;
    revenuePoolId: string;
    vestingScheduleId: string;
  };
  index: number;
}) {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const txToast = useTxToast();
  const [showModal, setShowModal] = useState(false);
  const claimable = useVestingClaimable(row.vestingScheduleId);
  const vestingProgress = useVestingProgress(row.vestingScheduleId);
  const liveAmount = claimable.data !== undefined ? formatSui(claimable.data) : "-";
  const liveProgress = vestingProgress.data !== undefined ? `${Math.min(100, vestingProgress.data / 100)}%` : "0%";

  async function vest() {
    setShowModal(false);
    await txToast("Vest earnings", async () => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::vest_earnings`,
        arguments: [
          tx.object(row.nftId),
          tx.object(row.stateId),
          tx.object(row.revenuePoolId),
          tx.object(row.vestingScheduleId),
          tx.object.clock(),
        ],
      });
      return (await signAndExecute({ transaction: tx })).digest;
    });
  }

  async function claim() {
    setShowModal(false);
    await txToast("Claim vested", async () => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::claim_vested`,
        arguments: [tx.object(row.nftId), tx.object(row.vestingScheduleId), tx.object(CONFIG_ID), tx.object.clock()],
      });
      return (await signAndExecute({ transaction: tx })).digest;
    });
  }

  return (
    <>
      <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.45fr] items-center gap-3 border-b border-[rgba(96,165,250,0.12)] py-3 text-[11px] min-w-[500px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-[#2dd4bf]">{["◈", "⬢", "⬡", "⛨"][index % 4]}</div>
          <div>
            <p className="font-bold text-white">{row.name}</p>
            <p className="text-[10px] text-[#707b89]">{row.category}</p>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">vesting</p>
          <p className="text-[10px] text-[#707b89]">on-chain</p>
        </div>
        <p className="font-bold text-white">{liveAmount}</p>
        <div className="flex items-center gap-3">
          <div className="h-[6px] flex-1 rounded-full bg-[rgba(96,165,250,0.14)]">
            <div className="h-[6px] rounded-full bg-[#2dd4bf]" style={{ width: liveProgress }} />
          </div>
          <span className="text-[10px] text-[#d1d5db]">{liveProgress}</span>
        </div>
        <button
          className="text-center text-[#2dd4bf]"
          onClick={() => setShowModal(true)}
          type="button"
        >›</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[340px] rounded border border-[rgba(45,212,191,0.3)] bg-black p-5 shadow-[0_0_40px_rgba(45,212,191,0.1)]">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-white">{row.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#6b7280] hover:text-white" type="button">×</button>
            </div>
            <p className="mb-5 text-[10px] text-[#707b89]">Choose an action for this vesting position.</p>
            <div className="flex gap-2">
              <button
                onClick={vest}
                className="flex-1 rounded border border-[#374151] bg-transparent py-2.5 font-mono text-[10px] font-bold tracking-[0.1em] text-[#9ca3af] hover:border-[#4b5563] hover:text-white transition-colors"
                type="button"
              >VEST EARNINGS</button>
              <button
                onClick={claim}
                className="flex-1 rounded border border-[rgba(45,212,191,0.5)] bg-[rgba(45,212,191,0.08)] py-2.5 font-mono text-[10px] font-bold tracking-[0.1em] text-[#2dd4bf] hover:bg-[rgba(45,212,191,0.14)] transition-colors"
                type="button"
              >CLAIM VESTED</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient, useReadContracts, useWriteContract } from "wagmi";

import { formatOg, useMentorClaimable, useMentors, useVestingProgress } from "@/hooks/useMarketplace";
import { hasMarketplaceAddress, MARKETPLACE_ADDRESS, marketplaceAbi } from "@/lib/contracts";

import { subtleButtonClass, solidAccentBtn } from "./shared";

const panelClass = "border border-[rgba(96,165,250,0.24)] bg-black";

export default function EarningsView() {
  const { address } = useAccount();
  const { data: mentors = [] } = useMentors();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const myMentors = address ? mentors.filter((mentor) => mentor.creator.toLowerCase() === address.toLowerCase()) : [];

  // Batch fetch claimable royalty for all mentors I own
  const { data: claimableResults } = useReadContracts({
    contracts: myMentors.map((mentor) => ({
      address: MARKETPLACE_ADDRESS,
      abi: marketplaceAbi,
      functionName: "getMentorClaimable" as const,
      args: [BigInt(mentor.tokenId)],
    })),
    query: { enabled: myMentors.length > 0 && hasMarketplaceAddress },
  });

  const totalClaimable = claimableResults
    ? claimableResults.reduce((sum, r) => sum + ((r.result as bigint | undefined) ?? BigInt(0)), BigInt(0))
    : BigInt(0);

  // Total queries across all my mentors → estimate of revenue generated
  const totalQueries = myMentors.reduce((sum, m) => sum + m.totalQueries, 0);

  // Read MentorRoyaltyClaimed events for current user's mentors
  const { data: payoutEvents = [] } = useQuery({
    queryKey: ["payout-events", address, MARKETPLACE_ADDRESS],
    enabled: Boolean(publicClient && address && hasMarketplaceAddress),
    queryFn: async () => {
      if (!publicClient || !address) return [];
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > BigInt(100_000) ? currentBlock - BigInt(100_000) : BigInt(0);
      const logs = await publicClient.getLogs({
        address: MARKETPLACE_ADDRESS,
        event: marketplaceAbi[2] as never, // MentorRoyaltyClaimed event
        fromBlock,
        toBlock: "latest",
      });
      return logs
        .filter((log: any) => log.args?.mentor?.toLowerCase() === address.toLowerCase())
        .map((log: any) => ({
          mentorId: Number(log.args?.mentorId ?? 0),
          amount: (log.args?.amount as bigint) ?? BigInt(0),
          txHash: log.transactionHash as string,
          blockNumber: log.blockNumber as bigint,
        }))
        .sort((a: any, b: any) => Number(b.blockNumber - a.blockNumber));
    },
  });

  const statCards = [
    ["◎", "Total Queries", String(totalQueries), "Across all my mentors", "on-chain"],
    ["♕", "Mentor Royalty", formatOg(totalClaimable), "Claimable now", "from contract"],
    ["♣", "Payout Events", String(payoutEvents.length), "Historical claims", "on-chain logs"],
    ["▱", "Active Mentors", String(myMentors.length), "Mentors I own", "registered"],
  ];

  const vestingRows = myMentors.map((mentor) => [
    mentor.name,
    mentor.category,
    "30 days",
    mentor.lastUpdatedAt ? new Date((mentor.lastUpdatedAt + 30 * 24 * 60 * 60) * 1000).toLocaleDateString() : "-",
    "On-chain",
    "0%",
    String(mentor.tokenId),
  ]);

  async function claimFirstRoyalty() {
    const tokenId = myMentors[0]?.tokenId;
    if (tokenId === undefined) return;
    await writeContractAsync({
      address: MARKETPLACE_ADDRESS,
      abi: marketplaceAbi,
      functionName: "claimMentorRoyalty",
      args: [BigInt(tokenId)],
    });
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
                <p className="text-[22px] font-bold leading-none text-white">{value}</p>
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
            {["0G", "1.6K", "1.2K", "800", "400", "0"].map((label, i) => (
              <text key={label} x="0" y={28 + i * 42} fill="#707b89" fontSize="11">{label}</text>
            ))}
            <path d="M42 190L60 150L78 142L96 160L116 176L136 184L156 178L176 190L196 154L216 104L236 122L256 98L276 91L296 80L316 42L336 24L356 52L376 39L396 31L416 18L436 62L456 106L476 129L496 151L516 132L536 115L556 108L576 98L596 135L616 101L636 87L656 76L676 113L696 42" stroke="#2dd4bf" strokeWidth="3" />
            <path d="M42 232L42 190L60 150L78 142L96 160L116 176L136 184L156 178L176 190L196 154L216 104L236 122L256 98L276 91L296 80L316 42L336 24L356 52L376 39L396 31L416 18L436 62L456 106L476 129L496 151L516 132L536 115L556 108L576 98L596 135L616 101L636 87L656 76L676 113L696 42L696 232Z" fill="url(#earningArea)" />
            <circle cx="696" cy="42" r="5" fill="#2dd4bf" />
            <text x="616" y="38" fill="#2dd4bf" fontSize="11" fontWeight="700">CURRENT</text>
            <text x="616" y="62" fill="white" fontSize="13" fontWeight="700">12,840 OG</text>
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
            <div className="relative h-[170px] w-[170px] rounded-full bg-[conic-gradient(#2dd4bf_0_60%,#67e8f9_60%_85%,#475569_85%_100%)] p-[28px]">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#071014] text-center">
                <span className="text-[13px] font-bold text-white">{formatOg(totalClaimable)}</span>
                <span className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#707b89]">Claimable</span>
              </div>
            </div>
            <div>
              {[
                ["#2dd4bf", "Mentor royalty", "60%", "60%"],
                ["#67e8f9", "Curator rewards", "25%", "25%"],
                ["#64748b", "Platform fee", "15%", "15%"],
              ].map(([color, label, value, pct]) => (
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
              <div key={mentor.tokenId} className="mb-3 last:mb-0">
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
            <p className="text-center text-[26px] font-bold text-white">{formatOg(totalClaimable)}</p>
            <p className="mt-3 text-center text-[11px] text-[#d1d5db]">Available to claim</p>
          </div>
          <div className="p-4">
            <p className="mb-5 text-center text-[11px] leading-[1.6] text-[#8b95a3]">Includes vested allocations ready for withdrawal.</p>
            <button className={`flex w-full items-center justify-center gap-2 py-2.5 text-[10px] ${solidAccentBtn}`} disabled={myMentors.length === 0} onClick={claimFirstRoyalty} type="button">CLAIM REWARDS <span className="text-base leading-none">›</span></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[#8b95a3]">▢</span>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Vesting Queue</h2>
          </div>
          <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.45fr] gap-3 border-b border-[rgba(96,165,250,0.14)] pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#586474]">
            <span>Mentor / Package</span><span>Unlocks In</span><span>Amount</span><span>Progress</span><span>Claim Date</span>
          </div>
          {vestingRows.length === 0 ? (
            <div className="py-8 text-center text-[11px] text-[#4b5563]">No mentors found. Register a mentor first.</div>
          ) : vestingRows.map(([mentor, subtitle, unlock, date, amount, progress, tokenId], index) => (
            <VestingRow key={tokenId} row={{ mentor, subtitle, unlock, date, amount, progress, tokenId }} index={index} />
          ))}
          <button className="mt-4 flex w-full items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2dd4bf]">VIEW ALL VESTING <span>›</span></button>
        </div>

        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[#8b95a3]">⌁</span>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Recent Payout Activity</h2>
          </div>
          <div className="grid grid-cols-[1fr_1fr_0.6fr_0.7fr] gap-3 border-b border-[rgba(96,165,250,0.14)] pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#586474]">
            <span>Event</span><span>Source</span><span>Time</span><span className="text-right">Amount</span>
          </div>
          {payoutEvents.length === 0 ? (
            <div className="py-8 text-center text-[11px] text-[#4b5563]">No payout events yet. Claim royalties to see activity here.</div>
          ) : payoutEvents.slice(0, 5).map((event) => {
            const mentor = mentors.find((m) => m.tokenId === event.mentorId);
            return (
              <div key={event.txHash} className="grid grid-cols-[1fr_1fr_0.6fr_0.7fr] items-center gap-3 border-b border-[rgba(96,165,250,0.12)] py-3 text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 text-[#2dd4bf]">♕</span>
                  <span className="text-[#d1d5db]">Mentor Royalty</span>
                </div>
                <span className="text-[#8b95a3]">{mentor?.name ?? `Mentor #${event.mentorId}`}</span>
                <span className="text-[#8b95a3]">Block {event.blockNumber.toString()}</span>
                <span className="text-right font-bold text-[#2dd4bf]">+{formatOg(event.amount)}</span>
              </div>
            );
          })}
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
    mentor: string;
    subtitle: string;
    unlock: string;
    date: string;
    amount: string;
    progress: string;
    tokenId?: string;
  };
  index: number;
}) {
  const { writeContractAsync } = useWriteContract();
  const tokenId = row.tokenId ? Number(row.tokenId) : undefined;
  const claimable = useMentorClaimable(tokenId);
  const vestingProgress = useVestingProgress(tokenId);
  const liveAmount = tokenId !== undefined && claimable.data !== undefined ? formatOg(claimable.data as bigint) : row.amount;
  const liveProgress =
    tokenId !== undefined && vestingProgress.data !== undefined
      ? `${Math.min(100, Number(vestingProgress.data) / 100)}%`
      : row.progress;

  async function vestOrClaim() {
    if (tokenId === undefined) return;
    const claim = window.confirm("OK = claim vested, Cancel = vest earnings");
    await writeContractAsync({
      address: MARKETPLACE_ADDRESS,
      abi: marketplaceAbi,
      functionName: claim ? "claimVested" : "vestEarnings",
      args: [BigInt(tokenId)],
    });
  }

  return (
    <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.45fr] items-center gap-3 border-b border-[rgba(96,165,250,0.12)] py-3 text-[11px]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-[#2dd4bf]">{["◈", "⬢", "⬡", "⛨"][index % 4]}</div>
        <div>
          <p className="font-bold text-white">{row.mentor}</p>
          <p className="text-[10px] text-[#707b89]">{row.subtitle}</p>
        </div>
      </div>
      <div>
        <p className="font-bold text-white">{row.unlock}</p>
        <p className="text-[10px] text-[#707b89]">{row.date}</p>
      </div>
      <p className="font-bold text-white">{liveAmount}</p>
      <div className="flex items-center gap-3">
        <div className="h-[6px] flex-1 rounded-full bg-[rgba(96,165,250,0.14)]">
          <div className="h-[6px] rounded-full bg-[#2dd4bf]" style={{ width: liveProgress }} />
        </div>
        <span className="text-[10px] text-[#d1d5db]">{liveProgress}</span>
      </div>
      <button className="text-center text-[#2dd4bf]" disabled={tokenId === undefined} onClick={vestOrClaim} type="button">›</button>
    </div>
  );
}

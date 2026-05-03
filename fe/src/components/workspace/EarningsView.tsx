import { panelClass, subtleButtonClass, solidAccentBtn } from "./shared";

export default function EarningsView() {
  const statCards = [
    ["◎", "Gross Revenue", "12,840 OG", "Subscription + pay-per-query", "▲ 12.4% vs last 30 days"],
    ["♕", "Mentor Royalty", "7,704 OG", "Lifetime royalty share", "▲ 9.8% vs last 30 days"],
    ["♣", "Curator Pool", "3,210 OG", "Pro-rata usage rewards", "▲ 7.2% vs last 30 days"],
    ["▱", "Platform Fee", "1,926 OG", "Operational fee allocation", "▲ 5.4% vs last 30 days"],
  ];

  const vestingRows = [
    ["IndoRegulator_01", "Regulatory Watchdog", "18 days", "Jun 18, 2026", "2,910 OG", "65%"],
    ["ExportOps_APAC", "APAC Trade Intelligence", "24 days", "Jun 24, 2026", "1,108 OG", "42%"],
    ["DeFiTax_Advisor", "Defi Tax Optimizer", "7 days", "Jun 7, 2026", "842 OG", "83%"],
    ["AuditGuardian_Pro", "Onchain Audit Monitor", "36 days", "Jul 6, 2026", "654 OG", "28%"],
  ];

  return (
    <div className="earnings-reference">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(([icon, label, value, detail, trend]) => (
          <div key={label} className={`${panelClass} rounded-[7px] p-4`}>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-[22px] text-[#2dd4bf] shadow-[0_0_24px_rgba(45,212,191,0.16)]">
                {icon}
              </div>
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
                <span className="text-[18px] font-bold text-white">12,840</span>
                <span className="text-[13px] font-bold text-white">OG</span>
                <span className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#707b89]">Total</span>
              </div>
            </div>
            <div>
              {[
                ["#2dd4bf", "Mentor royalty", "7,704 OG", "60%"],
                ["#67e8f9", "Curator rewards", "3,210 OG", "25%"],
                ["#64748b", "Platform fee", "1,926 OG", "15%"],
              ].map(([color, label, value, pct]) => (
                <div key={label} className="grid grid-cols-[14px_1fr_auto] items-center gap-3 border-b border-[rgba(96,165,250,0.14)] py-3 last:border-b-0">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span>
                    <span className="block text-[11px] text-[#d1d5db]">{label}</span>
                    <span className="text-[10px] text-[#707b89]">{value}</span>
                  </span>
                  <span className="text-[12px] font-bold text-white">{pct}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 text-[10px] text-[#707b89]">Distribution based on protocol rules and usage.</p>
        </div>

        <div className={`${panelClass} overflow-hidden rounded-[7px]`}>
          <div className="border-b border-[#2dd4bf]/30 bg-[rgba(45,212,191,0.035)] p-4">
            <div className="mb-8 flex items-center gap-2 text-[#2dd4bf]">
              <span className="text-[18px]">▣</span>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.12em]">Claimable Rewards</h2>
            </div>
            <p className="text-center text-[26px] font-bold text-white">842 OG</p>
            <p className="mt-3 text-center text-[11px] text-[#d1d5db]">Available to claim</p>
          </div>
          <div className="p-4">
            <p className="mb-5 text-center text-[11px] leading-[1.6] text-[#8b95a3]">Includes vested allocations ready for withdrawal.</p>
            <button className={`flex w-full items-center justify-center gap-2 py-2.5 text-[10px] ${solidAccentBtn}`}>CLAIM REWARDS <span className="text-base leading-none">›</span></button>
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
          {vestingRows.map(([mentor, subtitle, unlock, date, amount, progress], index) => (
            <div key={mentor} className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.45fr] items-center gap-3 border-b border-[rgba(96,165,250,0.12)] py-3 text-[11px]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-[#2dd4bf]">{["◈", "⬢", "⬡", "⛨"][index]}</div>
                <div>
                  <p className="font-bold text-white">{mentor}</p>
                  <p className="text-[10px] text-[#707b89]">{subtitle}</p>
                </div>
              </div>
              <div>
                <p className="font-bold text-white">{unlock}</p>
                <p className="text-[10px] text-[#707b89]">{date}</p>
              </div>
              <p className="font-bold text-white">{amount}</p>
              <div className="flex items-center gap-3">
                <div className="h-[6px] flex-1 rounded-full bg-[rgba(96,165,250,0.14)]">
                  <div className="h-[6px] rounded-full bg-[#2dd4bf]" style={{ width: progress }} />
                </div>
                <span className="text-[10px] text-[#d1d5db]">{progress}</span>
              </div>
              <span className="text-center text-[#707b89]">-</span>
            </div>
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
          {[
            ["♕", "Mentor Royalty", "IndoRegulator_01", "2h ago", "+412 OG"],
            ["♧", "Curator Reward", "ExportOps_APAC", "5h ago", "+231 OG"],
            ["♕", "Mentor Royalty", "DeFiTax_Advisor", "1d ago", "+318 OG"],
            ["◎", "Platform Fee Allocation", "Protocol", "1d ago", "+147 OG"],
            ["♧", "Curator Reward", "AuditGuardian_Pro", "2d ago", "+164 OG"],
          ].map(([icon, event, source, time, amount]) => (
            <div key={`${event}-${source}-${time}`} className="grid grid-cols-[1fr_1fr_0.6fr_0.7fr] items-center gap-3 border-b border-[rgba(96,165,250,0.12)] py-3 text-[11px]">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 text-[#2dd4bf]">{icon}</span>
                <span className="text-[#d1d5db]">{event}</span>
              </div>
              <span className="text-[#8b95a3]">{source}</span>
              <span className="text-[#8b95a3]">{time}</span>
              <span className="text-right font-bold text-[#2dd4bf]">{amount}</span>
            </div>
          ))}
          <button className="mt-4 flex w-full items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2dd4bf]">VIEW ALL ACTIVITY <span>›</span></button>
        </div>
      </div>
    </div>
  );
}

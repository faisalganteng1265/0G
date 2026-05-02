type PageKind = "mentors" | "shares" | "gaps" | "earnings" | "security";

interface MentorWorkspaceMockProps {
  kind: PageKind;
}

const panelClass = "border border-[#2a2d32] bg-[#15171a]";
const cardClass = `${panelClass} rounded-lg p-4`;
const subtleButtonClass =
  "cursor-pointer rounded border border-[#374151] bg-transparent font-mono font-bold tracking-[0.1em] text-[#9ca3af]";
const accentButtonClass =
  "cursor-pointer rounded border border-[rgba(45,212,191,0.5)] bg-[rgba(45,212,191,0.08)] font-mono font-bold tracking-[0.1em] text-[#2dd4bf]";

const pageCopy = {
  mentors: {
    title: "Mentor Studio",
    description:
      "Draft, package, and maintain private expert playbooks before the 0G Storage and TEE integration is connected.",
    eyebrow: "EXPERT WORKSPACE",
  },
  shares: {
    title: "My Access Shares",
    description:
      "Mock portfolio view for curator stakes, usage rewards, and access share performance across AI Mentors.",
    eyebrow: "CURATOR PORTFOLIO",
  },
  gaps: {
    title: "Gap Reports",
    description:
      "Blind spots generated from low-confidence mentor answers, ready for review, prioritization, and knowledge updates.",
    eyebrow: "CONFIDENCE ORACLE",
  },
  earnings: {
    title: "Earnings",
    description:
      "Royalty, curator reward, vesting, and platform fee mock data based on the README revenue flow.",
    eyebrow: "REVENUE FLOW",
  },
  security: {
    title: "Security Logs",
    description:
      "Mock audit trail for encrypted storage, enclave inference, access checks, and e-sign attestation references.",
    eyebrow: "TEE AUDIT TRAIL",
  },
} satisfies Record<PageKind, { title: string; description: string; eyebrow: string }>;

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className={cardClass}>
      <p className="mb-2 text-[9px] uppercase tracking-[0.14em] text-[#4b5563]">{label}</p>
      <p className="mb-1 text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] leading-[1.5] text-[#6b7280]">{detail}</p>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-[#6b7280]">{icon}</span>
      <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">{title}</h2>
    </div>
  );
}

function StatusPill({ children, tone = "accent" }: { children: string; tone?: "accent" | "muted" | "warn" }) {
  const classes = {
    accent: "border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] text-[#2dd4bf]",
    muted: "border-[#343840] bg-[#111317] text-[#9ca3af]",
    warn: "border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.08)] text-[#fbbf24]",
  };

  return (
    <span className={`rounded-[3px] border px-1.5 py-0.5 text-[9px] font-bold tracking-[0.1em] ${classes[tone]}`}>
      {children}
    </span>
  );
}

function MentorsView() {
  const mentors = [
    ["IndoRegulator_01", "Regulatory playbook", "78 docs staged", "12 gaps", "DRAFT"],
    ["ExportOps_APAC", "Cross-border ops", "31 docs staged", "4 gaps", "REVIEW"],
    ["DeFiTax_Advisor", "Crypto tax tactics", "19 docs staged", "0 gaps", "READY"],
  ];

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <StatCard label="Knowledge Vault" value="128 files" detail="Encrypted upload mock queue for 0G Storage KV and Log layers." />
        <StatCard label="Avg Confidence" value="91.6%" detail="Preview confidence before on-chain oracle wiring." />
        <StatCard label="Pending E-Sign" value="3 attestations" detail="Marketplace-style e-sign consent package references." />
      </div>

      <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
        <div className={cardClass}>
          <SectionTitle icon="⬡" title="Mentor Knowledge Packages" />
          <div className="flex flex-col gap-3">
            {mentors.map(([name, type, docs, gaps, status]) => (
              <div key={name} className="flex items-center justify-between gap-4 rounded border border-[#242830] bg-[#101215] p-3">
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{name}</p>
                    <StatusPill tone={status === "READY" ? "accent" : status === "REVIEW" ? "warn" : "muted"}>
                      {status}
                    </StatusPill>
                  </div>
                  <p className="text-[10px] text-[#6b7280]">{type} • {docs} • {gaps}</p>
                </div>
                <button className={`px-3 py-1.5 text-[9px] ${accentButtonClass}`}>OPEN STUDIO</button>
              </div>
            ))}
          </div>
        </div>

        <div className={cardClass}>
          <SectionTitle icon="◫" title="Mint New Mentor" />
          <div className="mb-4 rounded border border-[#242830] bg-[#101215] p-3">
            <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-[#2dd4bf]">INFT DRAFT #004</p>
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <p className="text-[#4b5563]">MENTOR SHARE</p>
              <p className="text-right font-bold text-white">50%</p>
              <p className="text-[#4b5563]">CURATOR POOL</p>
              <p className="text-right font-bold text-white">50%</p>
              <p className="text-[#4b5563]">TEE MODE</p>
              <p className="text-right font-bold text-[#2dd4bf]">ENFORCED</p>
            </div>
          </div>
          <button className={`mb-2 w-full py-2 text-[10px] ${accentButtonClass}`}>PREVIEW MINT FLOW</button>
          <button className={`w-full py-2 text-[10px] ${subtleButtonClass}`}>UPLOAD KNOWLEDGE</button>
        </div>
      </div>
    </>
  );
}

function SharesView() {
  const rows = [
    ["IndoRegulator_01", "184 shares", "1,240 0G", "+14.2%", "42.8 0G"],
    ["QuantAlpha_7", "61 shares", "3,890 0G", "+9.5%", "36.4 0G"],
    ["CyberSec_V2", "24 shares", "8,105 0G", "+4.1%", "28.7 0G"],
  ];

  return (
    <>
      <div className="mb-4 grid grid-cols-4 gap-4">
        <StatCard label="Portfolio Value" value="684K 0G" detail="Mock access share mark-to-market." />
        <StatCard label="Usage Rewards" value="107.9 0G" detail="Unclaimed curator reward estimate." />
        <StatCard label="Active Mentors" value="3" detail="Mentors with share exposure." />
        <StatCard label="Avg Yield" value="11.4%" detail="Weekly usage reward trend." />
      </div>
      <div className={cardClass}>
        <SectionTitle icon="◈" title="Share Positions" />
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_0.8fr_0.7fr] gap-3 border-b border-[#242830] pb-2 text-[9px] font-bold tracking-[0.12em] text-[#4b5563]">
          <span>MENTOR</span><span>POSITION</span><span>PRICE</span><span>CHANGE</span><span>REWARDS</span><span />
        </div>
        {rows.map(([mentor, shares, price, change, rewards]) => (
          <div key={mentor} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_0.8fr_0.7fr] items-center gap-3 border-b border-[#1f2937] py-3 text-[11px]">
            <span className="font-bold text-white">{mentor}</span>
            <span className="text-[#d1d5db]">{shares}</span>
            <span className="text-[#d1d5db]">{price}</span>
            <span className="font-bold text-[#2dd4bf]">{change}</span>
            <span className="font-bold text-white">{rewards}</span>
            <button className={`py-1.5 text-[9px] ${subtleButtonClass}`}>CLAIM</button>
          </div>
        ))}
      </div>
    </>
  );
}

function GapsView() {
  const gaps = [
    ["OSS licensing for foreign-owned PMA", "IndoRegulator_01", "High", "21 queries", "Needs new checklist"],
    ["MiCA stablecoin reserve carve-out", "QuantAlpha_7", "Medium", "9 queries", "Source match weak"],
    ["Proxy upgrade incident pattern", "CyberSec_V2", "Low", "5 queries", "Awaiting mentor review"],
  ];

  return (
    <div className="grid grid-cols-[1fr_320px] gap-4">
      <div className={cardClass}>
        <SectionTitle icon="⚠" title="Blind Spot Queue" />
        <div className="flex flex-col gap-3">
          {gaps.map(([title, mentor, priority, count, note]) => (
            <div key={title} className="rounded border border-[#242830] bg-[#101215] p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="mb-1 text-xs font-bold text-white">{title}</p>
                  <p className="text-[10px] text-[#6b7280]">{mentor} • {count} • {note}</p>
                </div>
                <StatusPill tone={priority === "High" ? "warn" : "muted"}>{priority.toUpperCase()}</StatusPill>
              </div>
              <div className="h-2 rounded bg-[#0b0d0f]">
                <div className="h-2 rounded bg-[#2dd4bf]" style={{ width: priority === "High" ? "78%" : priority === "Medium" ? "48%" : "24%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <SectionTitle icon="◎" title="Oracle Signals" />
        {[
          ["Retrieval match", "64%"],
          ["Self-eval confidence", "71%"],
          ["Source freshness", "39%"],
          ["Mentor response SLA", "18h"],
        ].map(([label, value]) => (
          <div key={label} className="mb-3 flex items-center justify-between border-b border-[#1f2937] pb-2 text-[11px]">
            <span className="text-[#6b7280]">{label}</span>
            <span className="font-bold text-white">{value}</span>
          </div>
        ))}
        <button className={`mt-2 w-full py-2 text-[10px] ${accentButtonClass}`}>REQUEST UPDATE</button>
      </div>
    </div>
  );
}

function EarningsView() {
  return (
    <>
      <div className="mb-4 grid grid-cols-4 gap-4">
        <StatCard label="Gross Revenue" value="12,840 0G" detail="Subscription plus pay-per-query mock revenue." />
        <StatCard label="Mentor Royalty" value="7,704 0G" detail="Lifetime royalty share before vesting." />
        <StatCard label="Curator Pool" value="3,210 0G" detail="Pro-rata usage reward distribution." />
        <StatCard label="Platform Fee" value="1,926 0G" detail="Operational fee mock allocation." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className={cardClass}>
          <SectionTitle icon="◎" title="Vesting Queue" />
          {[
            ["IndoRegulator_01", "2,910 0G", "18 days"],
            ["ExportOps_APAC", "1,108 0G", "24 days"],
            ["DeFiTax_Advisor", "842 0G", "7 days"],
          ].map(([name, amount, lock]) => (
            <div key={name} className="mb-3 flex items-center justify-between rounded border border-[#242830] bg-[#101215] p-3">
              <div>
                <p className="text-xs font-bold text-white">{name}</p>
                <p className="text-[10px] text-[#6b7280]">vesting unlock in {lock}</p>
              </div>
              <p className="text-xs font-bold text-[#2dd4bf]">{amount}</p>
            </div>
          ))}
        </div>
        <div className={cardClass}>
          <SectionTitle icon="↯" title="Revenue Split" />
          {[
            ["Mentor royalty", "60%"],
            ["Curator rewards", "25%"],
            ["Platform fee", "15%"],
          ].map(([label, value]) => (
            <div key={label} className="mb-4">
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-[#6b7280]">{label}</span>
                <span className="font-bold text-white">{value}</span>
              </div>
              <div className="h-2 rounded bg-[#0b0d0f]">
                <div className="h-2 rounded bg-[#2dd4bf]" style={{ width: value }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SecurityView() {
  const logs = [
    ["TEE_ATTESTED", "IndoRegulator_01 query session", "0x7F...91A2", "2 min ago"],
    ["E_SIGN_REF", "Mentor consent package attached", "ESG-4491", "18 min ago"],
    ["STORAGE_COMMIT", "0G Log archival hash pinned", "0xA1...CC04", "41 min ago"],
    ["ACCESS_CHECK", "Subscriber pass validated", "0x09...88FE", "1 hr ago"],
    ["INFT_TRANSFER_DRYRUN", "Ownership handoff proof simulated", "0x44...D902", "3 hr ago"],
  ];

  return (
    <div className={cardClass}>
      <SectionTitle icon="⛨" title="Audit Event Stream" />
      <div className="grid grid-cols-[0.8fr_1.3fr_0.8fr_0.6fr] gap-3 border-b border-[#242830] pb-2 text-[9px] font-bold tracking-[0.12em] text-[#4b5563]">
        <span>EVENT</span><span>DETAIL</span><span>PROOF</span><span>TIME</span>
      </div>
      {logs.map(([event, detail, proof, time]) => (
        <div key={`${event}-${time}`} className="grid grid-cols-[0.8fr_1.3fr_0.8fr_0.6fr] items-center gap-3 border-b border-[#1f2937] py-3 text-[11px]">
          <span className="font-bold text-[#2dd4bf]">{event}</span>
          <span className="text-white">{detail}</span>
          <span className="text-[#9ca3af]">{proof}</span>
          <span className="text-[#6b7280]">{time}</span>
        </div>
      ))}
    </div>
  );
}

export default function MentorWorkspaceMock({ kind }: MentorWorkspaceMockProps) {
  const copy = pageCopy[kind];

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-[#2dd4bf]">{copy.eyebrow}</p>
          <h1 className="mb-1.5 text-2xl font-bold text-white">{copy.title}</h1>
          <p className="max-w-[600px] text-xs leading-[1.6] text-[#6b7280]">{copy.description}</p>
        </div>
        <button className={`shrink-0 px-3 py-1.5 text-[10px] ${subtleButtonClass}`}>MOCK DATA</button>
      </div>
      <div className="mb-4 h-px w-full bg-[#1f2937]" />

      {kind === "mentors" && <MentorsView />}
      {kind === "shares" && <SharesView />}
      {kind === "gaps" && <GapsView />}
      {kind === "earnings" && <EarningsView />}
      {kind === "security" && <SecurityView />}
    </>
  );
}

type PageKind = "mentors" | "shares" | "gaps" | "earnings" | "security";

interface MentorWorkspaceMockProps {
  kind: PageKind;
}

const panelClass =
  "border border-[rgba(96,165,250,0.24)] bg-[rgba(5,12,15,0.78)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_26px_rgba(45,212,191,0.06)]";
const cardClass = `${panelClass} rounded-lg p-4`;
const subtleButtonClass =
  "cursor-pointer rounded border border-[rgba(96,165,250,0.28)] bg-[rgba(5,12,15,0.58)] font-mono font-bold tracking-[0.1em] text-[#8f9cac]";
const accentButtonClass =
  "cursor-pointer rounded border border-[rgba(45,212,191,0.62)] bg-[rgba(45,212,191,0.08)] font-mono font-bold tracking-[0.1em] text-[#2dd4bf] shadow-[0_0_16px_rgba(45,212,191,0.08)]";

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
      "Track your curator stakes, earnings, and performance across AI Mentors. Monitor rewards, yield, and portfolio growth in real time.",
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

function StatCard({
  label,
  value,
  detail,
  boxed = true,
}: {
  label: string;
  value: string;
  detail: string;
  boxed?: boolean;
}) {
  return (
    <div className={boxed ? cardClass : ""}>
      <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
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
    {
      name: "IndoRegulator_01",
      status: "DRAFT" as const,
      category: "Regulatory Playbook",
      categoryColor: "#4ade80",
      description: "Cross-border regulatory frameworks, licensing paths, and compliance models.",
      docs: 78,
      gaps: 12,
      confidence: 88,
      updatedAgo: "2h ago",
      version: "v0.3.2",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDmEXNoAf-cmrKUiwhuPOpaf-1mlPbR4cehM2rReUiOo2pR5YTe2Y_fOieBJYQw_jjpObE2rUSUeNDpZXLLkfqIKq9eDx6Fq3naaIJ6NOUdh6TvXdSpR1mBGR9lbNuKz4l-ipSme9cTTlN69LdjblpvS-GdoEpVRO9MKyUXZf-pgQ2gP1ewqG9FgLo7t-LG4nmGXSCJbKBwUhTzVhejUHG9tF_1qCcdCRUc30KxL-C4qKOU2qD6qXSfUOcieWVkEwOxSK5b6CoRPc0",
    },
    {
      name: "ExportOps_APAC",
      status: "REVIEW" as const,
      category: "Cross-border Operations",
      categoryColor: "#2dd4bf",
      description: "Export compliance, customs, and logistics operations across APAC.",
      docs: 31,
      gaps: 4,
      confidence: 76,
      updatedAgo: "1d ago",
      version: "v0.2.1",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDwHax8-ONwCEu5RCRFNZaHEf3vFl3ZmHbQAdSZaM4Elv2YyMCoTOc0FZznxMitJ7LYmW39c3plK3Z8ehgMMV-ZK1-gKG21Qvd88ybTMVAgcJNZ61EUyP1Rzts6Af1PoKNP3L2pCYv1dXU_CpwzBY0H7T9WSL1UOwc4J795T3fNLfTee_C1ACovI8R5NBnWJ869DYe0pPkbhyIkST18eVEFU5SXJdxPbakmqDidBwNJorTZNOftAcjn4GlJ0zGc6U-ZcNNl5BltlBc",
    },
    {
      name: "DeFiTax_Advisor",
      status: "READY" as const,
      category: "Crypto Tax Tactics",
      categoryColor: "#2dd4bf",
      description: "On-chain tax strategies, reporting frameworks, and audit defenses.",
      docs: 19,
      gaps: 0,
      confidence: 96,
      updatedAgo: "3d ago",
      version: "v1.0.0",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDwHax8-ONwCEu5RCRFNZaHEf3vFl3ZmHbQAdSZaM4Elv2YyMCoTOc0FZznxMitJ7LYmW39c3plK3Z8ehgMMV-ZK1-gKG21Qvd88ybTMVAgcJNZ61EUyP1Rzts6Af1PoKNP3L2pCYv1dXU_CpwzBY0H7T9WSL1UOwc4J795T3fNLfTee_C1ACovI8R5NBnWJ869DYe0pPkbhyIkST18eVEFU5SXJdxPbakmqDidBwNJorTZNOftAcjn4GlJ0zGc6U-ZcNNl5BltlBc",
    },
  ];

  const statusBadge: Record<"DRAFT" | "REVIEW" | "READY", string> = {
    DRAFT: "border-[#374151] bg-[#111317] text-[#9ca3af]",
    REVIEW: "border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.08)] text-[#fbbf24]",
    READY: "border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] text-[#2dd4bf]",
  };

  const solidAccentBtn =
    "cursor-pointer rounded bg-[linear-gradient(90deg,#2dd4bf,#22d3ee)] font-mono font-bold tracking-[0.14em] text-[#021011] shadow-[0_0_22px_rgba(45,212,191,0.26)]";

  const tagPill =
    "flex items-center gap-1 rounded border border-[rgba(96,165,250,0.12)] bg-[rgba(255,255,255,0.035)] px-2 py-0.5 text-[9px] text-[#66717f]";

  const mintSteps = [
    { n: 1, label: "PACKAGE", value: "Select a knowledge package", valueClass: "text-[#4b5563]", dropdown: true },
    { n: 2, label: "MENTOR SHARE", value: "50%", valueClass: "text-white" },
    { n: 3, label: "CURATOR POOL", value: "50%", valueClass: "text-white" },
    { n: 4, label: "TEE MODE", value: "ENFORCED", valueClass: "text-[#2dd4bf]", checkmark: true },
    { n: 5, label: "ATTESTATION STATUS", value: "⚠ 3 pending", valueClass: "text-[#fbbf24]", link: true },
  ];

  const recentActivity = [
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="1" width="8" height="11" rx="1" stroke="#6b7280" strokeWidth="1.1" />
          <line x1="4" y1="5" x2="8" y2="5" stroke="#6b7280" strokeWidth="0.9" />
          <line x1="4" y1="7" x2="8" y2="7" stroke="#6b7280" strokeWidth="0.9" />
          <line x1="4" y1="9" x2="6.5" y2="9" stroke="#6b7280" strokeWidth="0.9" />
        </svg>
      ),
      title: "IndoRegulator_01 updated",
      detail: "12 files added • 3 gaps remaining",
      time: "2h ago",
    },
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2.5L11.5 5L5 11.5H2.5V9L9 2.5Z" stroke="#6b7280" strokeWidth="1.1" fill="none" />
          <path d="M7.5 4L10 6.5" stroke="#6b7280" strokeWidth="0.9" />
        </svg>
      ),
      title: "ExportOps_APAC e-sign requested",
      detail: "Awaiting 2 curator attestations",
      time: "1d ago",
    },
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5L8.5 5.5H12.5L9.5 7.8L10.5 12L7 9.8L3.5 12L4.5 7.8L1.5 5.5H5.5Z" stroke="#6b7280" strokeWidth="1.1" fill="none" />
        </svg>
      ),
      title: "DeFiTax_Advisor passed preview",
      detail: "Confidence improved to 96%",
      time: "3d ago",
    },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* Knowledge Vault Files */}
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] border border-[rgba(45,212,191,0.18)] bg-[rgba(45,212,191,0.12)] shadow-[0_0_18px_rgba(45,212,191,0.14)]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3.5" y="2" width="9" height="13" rx="1.2" stroke="#2dd4bf" strokeWidth="1.2" />
                <line x1="5.5" y1="6" x2="10.5" y2="6" stroke="#2dd4bf" strokeWidth="1" />
                <line x1="5.5" y1="8.5" x2="10.5" y2="8.5" stroke="#2dd4bf" strokeWidth="1" />
                <line x1="5.5" y1="11" x2="8.5" y2="11" stroke="#2dd4bf" strokeWidth="1" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b95a3]">Knowledge Vault Files</p>
              <p className="text-[22px] font-bold leading-none text-white">128</p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <p className="shrink-0 text-[10px] text-[#707b89]">Encrypted &amp; stored</p>
                <svg viewBox="0 0 120 18" className="h-[14px] w-[72px] shrink-0" fill="none">
                  <path d="M0,13 C12,13 18,7 28,7 C38,7 43,15 53,15 C63,15 68,5 78,5 C88,5 93,11 103,11 C111,11 116,7 120,7" stroke="#2dd4bf" strokeWidth="1.4" strokeOpacity="0.45" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Avg Confidence */}
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] border border-[rgba(45,212,191,0.18)] bg-[rgba(45,212,191,0.12)] shadow-[0_0_18px_rgba(45,212,191,0.14)]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2.5C9 2.5 3 5 3 9.5C3 12.5 5.5 14.5 9 15.5C12.5 14.5 15 12.5 15 9.5C15 5 9 2.5 9 2.5Z" stroke="#2dd4bf" strokeWidth="1.2" fill="none" />
                <path d="M6.5 9L8.2 10.8L11.5 7" stroke="#2dd4bf" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b95a3]">Avg Confidence</p>
              <p className="text-[22px] font-bold leading-none text-white">91.6%</p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <p className="shrink-0 text-[10px] text-[#707b89]">Preview confidence</p>
                <div className="h-[3px] w-[86px] shrink-0 rounded-full bg-[#1f2937]">
                  <div className="h-[3px] rounded-full bg-[linear-gradient(90deg,#22d3ee,#2dd4bf)]" style={{ width: "91.6%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending E-Sign */}
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] border border-[rgba(45,212,191,0.18)] bg-[rgba(45,212,191,0.12)] shadow-[0_0_18px_rgba(45,212,191,0.14)]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11.5 3L15 6.5L7 14.5L3.5 14.5L3.5 11L11.5 3Z" stroke="#2dd4bf" strokeWidth="1.2" fill="none" />
                <path d="M9.5 5L13 8.5" stroke="#2dd4bf" strokeWidth="1" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b95a3]">Pending E-Sign</p>
              <p className="text-[22px] font-bold leading-none text-white">3</p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <p className="shrink-0 text-[10px] text-[#707b89]">Attestations pending</p>
                <svg viewBox="0 0 120 18" className="h-[14px] w-[72px] shrink-0" fill="none">
                  <path d="M0,9 C15,9 20,15 30,15 C40,15 45,4 55,4 C65,4 70,12 80,12 C90,12 96,7 106,7 C111,7 115,9 120,9" stroke="#fbbf24" strokeWidth="1.4" strokeOpacity="0.45" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Drafts */}
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] border border-[rgba(45,212,191,0.18)] bg-[rgba(45,212,191,0.12)] shadow-[0_0_18px_rgba(45,212,191,0.14)]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="12" width="12" height="2.5" rx="1" stroke="#2dd4bf" strokeWidth="1.1" />
                <rect x="3" y="7.5" width="12" height="2.5" rx="1" stroke="#2dd4bf" strokeWidth="1.1" />
                <rect x="3" y="3" width="12" height="2.5" rx="1" stroke="#2dd4bf" strokeWidth="1.1" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b95a3]">Active Drafts</p>
              <p className="text-[22px] font-bold leading-none text-white">5</p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <p className="shrink-0 text-[10px] text-[#707b89]">In progress</p>
                <svg viewBox="0 0 120 18" className="h-[14px] w-[72px] shrink-0" fill="none">
                  <path d="M0,11 C10,11 16,5 26,5 C36,5 41,13 51,13 C61,13 66,7 76,7 C86,7 91,13 101,13 C111,13 115,9 120,9" stroke="#2dd4bf" strokeWidth="1.4" strokeOpacity="0.45" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: packages left, mint+activity right */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.36fr_1fr]">
        {/* Left: Knowledge Packages */}
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#8b95a3]">⬡</span>
              <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">Mentor Knowledge Packages</h2>
            </div>
            <button className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] ${subtleButtonClass}`}>
              All Packages <span className="text-[10px]">▾</span>
            </button>
          </div>

          <div className="overflow-hidden rounded border border-[rgba(96,165,250,0.12)] bg-[rgba(3,8,10,0.36)]">
            {mentors.map((mentor) => (
              <div key={mentor.name} className="border-b border-[rgba(96,165,250,0.13)] p-3 last:border-b-0">
                <div className="grid gap-3 md:grid-cols-[72px_minmax(0,1fr)_270px]">
                  {/* Thumbnail */}
                  <div
                    className="h-[78px] w-full shrink-0 rounded border border-[rgba(96,165,250,0.25)] bg-[#071014] bg-cover bg-center shadow-[0_0_18px_rgba(45,212,191,0.08)]"
                    style={{ backgroundImage: `url(${mentor.image})` }}
                  />

                  {/* Text content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{mentor.name}</span>
                      <span
                        className={`rounded-[3px] border px-1.5 py-0.5 text-[9px] font-bold tracking-[0.1em] ${statusBadge[mentor.status]}`}
                      >
                        {mentor.status}
                      </span>
                    </div>
                    <p className="mb-1 text-[10px] font-semibold" style={{ color: mentor.categoryColor }}>
                      {mentor.category}
                    </p>
                    <p className="mb-2 line-clamp-2 max-w-[390px] text-[10px] leading-[1.5] text-[#707b89]">
                      {mentor.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={tagPill}>Updated {mentor.updatedAgo}</span>
                      <span className={tagPill}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                        {mentor.version}
                      </span>
                      <span className={tagPill}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <rect x="2" y="4" width="5" height="4" rx="0.6" stroke="#6b7280" strokeWidth="0.9" />
                          <path d="M3 4V3C3 1.9 6 1.9 6 3V4" stroke="#6b7280" strokeWidth="0.9" />
                        </svg>
                        Private
                      </span>
                    </div>
                  </div>

                  {/* Right: stats + button + menu */}
                  <div className="flex shrink-0 items-center justify-end gap-4">
                    <div className="grid grid-cols-[44px_44px_92px] items-center gap-4">
                      <div className="text-center">
                        <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#586474]">DOCS</p>
                        <p className="text-[18px] font-bold text-white">{mentor.docs}</p>
                      </div>
                      <div className="text-center">
                        <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#586474]">GAPS</p>
                        <p className="text-[18px] font-bold text-white">{mentor.gaps}</p>
                      </div>
                      <div className="w-[62px]">
                        <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#586474]">CONFIDENCE</p>
                        <p className="mb-1 text-[18px] font-bold text-white">{mentor.confidence}%</p>
                        <div className="h-[3px] rounded-full bg-[#1f2937]">
                          <div className="h-[3px] rounded-full bg-[linear-gradient(90deg,#22d3ee,#2dd4bf)]" style={{ width: `${mentor.confidence}%` }} />
                        </div>
                      </div>
                    </div>
                    <button className={`whitespace-nowrap px-3 py-1.5 text-[9px] ${accentButtonClass}`}>
                      OPEN STUDIO
                    </button>
                    <span className="cursor-pointer text-base text-[#586474] hover:text-[#8b95a3]">⋮</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <button className="text-[11px] font-semibold text-[#2dd4bf] hover:opacity-80">
              View all packages →
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Mint New Mentor */}
          <div className={`${panelClass} rounded-[7px] p-4`}>
            <div className="mb-1 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#6b7280" strokeWidth="1.1" />
                <circle cx="7" cy="7" r="2" stroke="#6b7280" strokeWidth="1" />
                <line x1="7" y1="1" x2="7" y2="2.5" stroke="#6b7280" strokeWidth="1" />
                <line x1="7" y1="11.5" x2="7" y2="13" stroke="#6b7280" strokeWidth="1" />
                <line x1="1" y1="7" x2="2.5" y2="7" stroke="#6b7280" strokeWidth="1" />
                <line x1="11.5" y1="7" x2="13" y2="7" stroke="#6b7280" strokeWidth="1" />
              </svg>
              <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">Mint New Mentor</h2>
            </div>
            <p className="mb-4 text-[10px] text-[#6b7280]">
              Finalize your package and mint it as an on-chain mentor.
            </p>

            <div className="mb-4">
              {mintSteps.map((step) => (
                <div key={step.n} className="flex items-center gap-2.5 border-b border-[rgba(96,165,250,0.13)] py-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[rgba(45,212,191,0.45)] bg-[rgba(45,212,191,0.09)] text-[9px] font-bold text-[#2dd4bf]">
                    {step.n}
                  </div>
                  <span className="flex-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#4b5563]">
                    {step.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold ${step.valueClass}`}>{step.value}</span>
                    {step.checkmark && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke="#2dd4bf" strokeWidth="1" />
                        <path d="M3.5 6L5.2 7.7L8.5 4" stroke="#2dd4bf" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                    )}
                    {step.dropdown && <span className="text-[10px] text-[#4b5563]">▾</span>}
                    {step.link && (
                      <button className="text-[10px] font-semibold text-[#2dd4bf]">View</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className={`mb-2 flex w-full items-center justify-center gap-2 py-2.5 text-[10px] ${solidAccentBtn}`}>
              PREVIEW MINT FLOW <span className="text-base leading-none">›</span>
            </button>
            <button className={`flex w-full items-center justify-center gap-2 py-2.5 text-[10px] ${subtleButtonClass}`}>
              UPLOAD KNOWLEDGE
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M5.5 7.5V2.5M5.5 2.5L3 5M5.5 2.5L8 5" stroke="#9ca3af" strokeWidth="1.1" strokeLinecap="round" />
                <line x1="2" y1="9" x2="9" y2="9" stroke="#9ca3af" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Recent Activity */}
          <div className={`${panelClass} rounded-[7px] p-4`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M7.5 1L4 7.5H6.5L5.5 12L9 5.5H6.5Z" stroke="#2dd4bf" strokeWidth="1.1" strokeLinejoin="round" fill="none" />
                </svg>
                <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">Recent Activity</h2>
              </div>
              <button className="text-[10px] font-semibold text-[#2dd4bf]">View all</button>
            </div>

            <div className="flex flex-col gap-3">
              {recentActivity.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#2a2d32] bg-[#101215]">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-white">{item.title}</p>
                    <p className="text-[10px] leading-[1.5] text-[#6b7280]">{item.detail}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-[#4b5563]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SharesView() {
  const sharePositions = [
    {
      mentor: "IndoRegulator_01",
      shares: "184 shares",
      portfolio: "26.9% of portfolio",
      price: "1,240 0G",
      change: "+14.2%",
      rewards: "42.8 0G",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDmEXNoAf-cmrKUiwhuPOpaf-1mlPbR4cehM2rReUiOo2pR5YTe2Y_fOieBJYQw_jjpObE2rUSUeNDpZXLLkfqIKq9eDx6Fq3naaIJ6NOUdh6TvXdSpR1mBGR9lbNuKz4l-ipSme9cTTlN69LdjblpvS-GdoEpVRO9MKyUXZf-pgQ2gP1ewqG9FgLo7t-LG4nmGXSCJbKBwUhTzVhejUHG9tF_1qCcdCRUc30KxL-C4qKOU2qD6qXSfUOcieWVkEwOxSK5b6CoRPc0",
    },
    {
      mentor: "QuantAlpha_7",
      shares: "61 shares",
      portfolio: "28.6% of portfolio",
      price: "3,890 0G",
      change: "+9.5%",
      rewards: "36.4 0G",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDwHax8-ONwCEu5RCRFNZaHEf3vFl3ZmHbQAdSZaM4Elv2YyMCoTOc0FZznxMitJ7LYmW39c3plK3Z8ehgMMV-ZK1-gKG21Qvd88ybTMVAgcJNZ61EUyP1Rzts6Af1PoKNP3L2pCYv1dXU_CpwzBY0H7T9WSL1UOwc4J795T3fNLfTee_C1ACovI8R5NBnWJ869DYe0pPkbhyIkST18eVEFU5SXJdxPbakmqDidBwNJorTZNOftAcjn4GlJ0zGc6U-ZcNNl5BltlBc",
    },
    {
      mentor: "CyberSec_V2",
      shares: "24 shares",
      portfolio: "17.2% of portfolio",
      price: "8,105 0G",
      change: "+4.1%",
      rewards: "28.7 0G",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC9hN7Aj8iDuVpi80ZyqSXqOofwILzZ4vWR6r2Y1XFYDb6v14RKB-NGZ5izd5lCKWGoar_4i3PibYHZLmzvVDY5LelKLD7jM6NeqaDjfgfhOI8VRi-jrRGoObVKf8cv5Si0_PsEY8lSLEbEDuv2KEv80bgXjfwtE2mQAlU5ajHb9cVgXzWmZxVZvVihmZvKMnoIQ2o2zRWPxOtGCVWFGG7jVV8F3crN16L8knqQs6E4GSUZFjjtjw9BMfJux0V3dGc26QWq8xOodc",
    },
  ];

  const rewards = [
    ["IndoRegulator_01 reward", "Weekly usage rewards distribution", "2h ago", "+12.4 OG", "cyan"],
    ["QuantAlpha_7 reward", "Weekly usage rewards distribution", "12h ago", "+9.7 OG", "yellow"],
    ["CyberSec_V2 reward", "Weekly usage rewards distribution", "1d ago", "+7.3 OG", "cyan"],
    ["IndoRegulator_01 reward", "Milestone bonus achieved", "2d ago", "+13.4 OG", "cyan"],
  ];

  const statCards = [
    { label: "Portfolio Value", value: "684K OG", detail: "Total share value", icon: "stack", stroke: "#2dd4bf" },
    { label: "Usage Rewards", value: "107.9 OG", detail: "Unclaimed rewards", icon: "shield", stroke: "#2dd4bf" },
    { label: "Active Mentors", value: "3", detail: "Mentors with exposure", icon: "users", stroke: "#2dd4bf" },
    { label: "Avg Yield", value: "11.4%", detail: "Weekly yield trend", icon: "percent", stroke: "#2dd4bf" },
  ];

  return (
    <div className="shares-reference">
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`${panelClass} rounded-[7px] p-4`}>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.1)] shadow-[0_0_18px_rgba(45,212,191,0.16)]">
                {stat.icon === "stack" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <ellipse cx="10" cy="5" rx="6" ry="2.5" stroke={stat.stroke} strokeWidth="1.4" />
                    <path d="M4 5V10C4 11.4 6.7 12.5 10 12.5C13.3 12.5 16 11.4 16 10V5" stroke={stat.stroke} strokeWidth="1.4" />
                    <path d="M4 10V15C4 16.4 6.7 17.5 10 17.5C13.3 17.5 16 16.4 16 15V10" stroke={stat.stroke} strokeWidth="1.4" />
                  </svg>
                )}
                {stat.icon === "shield" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2.5L16 5V9.5C16 13.2 13.6 16 10 17.5C6.4 16 4 13.2 4 9.5V5L10 2.5Z" stroke={stat.stroke} strokeWidth="1.4" />
                    <path d="M7.4 9.7L9.2 11.4L12.8 7.6" stroke={stat.stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {stat.icon === "users" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="7.5" cy="7" r="2.5" stroke={stat.stroke} strokeWidth="1.4" />
                    <circle cx="13.5" cy="8" r="2" stroke={stat.stroke} strokeWidth="1.4" />
                    <path d="M3.5 16C4 13.5 5.5 12.2 7.5 12.2C9.5 12.2 11 13.5 11.5 16" stroke={stat.stroke} strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M11.5 13.2C13.8 13 15.5 14 16.2 16" stroke={stat.stroke} strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
                {stat.icon === "percent" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 15L15 5" stroke={stat.stroke} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="6.5" cy="6.5" r="2" stroke={stat.stroke} strokeWidth="1.3" />
                    <circle cx="13.5" cy="13.5" r="2" stroke={stat.stroke} strokeWidth="1.3" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b95a3]">{stat.label}</p>
                <p className="text-[22px] font-bold leading-none text-white">{stat.value}</p>
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
              <div className="relative mx-auto h-[160px] w-[160px] rounded-full bg-[conic-gradient(#14b8a6_0_54%,#facc15_54%_83%,#6d5bd0_83%_100%)] p-[22px] shadow-[0_0_34px_rgba(45,212,191,0.1)]">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-[rgba(96,165,250,0.18)] bg-[#071014] text-center">
                  <span className="text-[18px] font-bold text-white">684K</span>
                  <span className="text-[13px] font-bold leading-none text-white">OG</span>
                  <span className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#6b7280]">Total</span>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-[#707b89]">Allocation by share value</p>
            </div>
            <div className="overflow-hidden rounded border border-[rgba(96,165,250,0.2)]">
              {[
                ["#14b8a6", "IndoRegulator_01", "370.7K OG", "54.2%"],
                ["#facc15", "QuantAlpha_7", "195.3K OG", "28.6%"],
                ["#6d5bd0", "CyberSec_V2", "117.6K OG", "17.2%"],
              ].map(([color, name, value, pct]) => (
                <div key={name} className="grid grid-cols-[14px_1fr_auto] items-center gap-3 border-b border-[rgba(96,165,250,0.15)] px-4 py-3 last:border-b-0">
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
          <div className="grid grid-cols-[1.35fr_0.9fr_0.8fr_0.75fr_0.8fr_1fr] gap-3 border-b border-[rgba(96,165,250,0.16)] pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#586474]">
            <span>Mentor</span><span>Position</span><span>Share Price</span><span>Weekly Change</span><span>Rewards</span><span>Action</span>
          </div>
          {sharePositions.map((row) => (
            <div key={row.mentor} className="grid grid-cols-[1.35fr_0.9fr_0.8fr_0.75fr_0.8fr_1fr] items-center gap-3 border-b border-[rgba(96,165,250,0.12)] py-3 text-[11px]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-11 w-11 shrink-0 rounded border border-[rgba(96,165,250,0.25)] bg-cover bg-center" style={{ backgroundImage: `url(${row.image})` }} />
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{row.mentor}</p>
                  <span className="mt-1 inline-flex rounded border border-[rgba(45,212,191,0.35)] bg-[rgba(45,212,191,0.08)] px-1.5 py-0.5 text-[8px] font-bold text-[#2dd4bf]">ACTIVE</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-white">{row.shares}</p>
                <p className="text-[10px] text-[#707b89]">{row.portfolio}</p>
              </div>
              <p className="font-bold text-white">{row.price}</p>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#2dd4bf]">{row.change}</span>
                <svg viewBox="0 0 60 18" className="h-4 w-11" fill="none">
                  <path d="M0 9L6 12L12 10L18 13L24 8L30 10L36 7L42 8L48 4L54 5L60 2" stroke="#2dd4bf" strokeWidth="1.3" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-white">{row.rewards}</p>
                <p className="text-[10px] text-[#707b89]">Available</p>
              </div>
              <div className="flex items-center gap-2">
                <button className={`px-3 py-1.5 text-[9px] ${accentButtonClass}`}>CLAIM</button>
                <button className={`px-3 py-1.5 text-[9px] ${subtleButtonClass}`}>MANAGE</button>
                <span className="text-[#586474]">⋮</span>
              </div>
            </div>
          ))}
          <p className="mt-3 text-[10px] text-[#707b89]">Showing 3 of 3 positions</p>
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
            {rewards.map(([title, detail, time, amount, tone]) => (
              <div key={`${title}-${time}`} className="grid grid-cols-[36px_1fr_auto] items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded border ${tone === "yellow" ? "border-[rgba(250,204,21,0.32)] bg-[rgba(250,204,21,0.08)] text-[#facc15]" : "border-[rgba(45,212,191,0.32)] bg-[rgba(45,212,191,0.08)] text-[#2dd4bf]"}`}>
                  {tone === "yellow" ? "%" : "♙"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-white">{title}</p>
                  <p className="truncate text-[10px] text-[#707b89]">{detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#707b89]">{time}</p>
                  <p className="text-[11px] font-bold text-[#2dd4bf]">{amount}</p>
                </div>
              </div>
            ))}
          </div>
          <button className={`flex w-full items-center justify-center gap-2 py-2.5 text-[10px] ${accentButtonClass}`}>
            VIEW ALL ACTIVITY <span className="text-base leading-none">→</span>
          </button>
        </div>
      </div>
    </div>
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
    <div className={kind === "mentors" ? "mentor-studio-reference" : ""}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-[#2dd4bf]">{copy.eyebrow}</p>
          <h1 className="mb-2 text-2xl font-bold text-white">{copy.title}</h1>
          <p className="max-w-[560px] text-xs leading-[1.65] text-[#8b95a3]">{copy.description}</p>
        </div>
        <button className={`shrink-0 px-3 py-1.5 text-[10px] ${subtleButtonClass}`}>MOCK DATA</button>
      </div>

      {kind === "mentors" && <MentorsView />}
      {kind === "shares" && <SharesView />}
      {kind === "gaps" && <GapsView />}
      {kind === "earnings" && <EarningsView />}
      {kind === "security" && <SecurityView />}
    </div>
  );
}

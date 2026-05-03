import { panelClass, subtleButtonClass, accentButtonClass, solidAccentBtn } from "./shared";

export default function MentorsView() {
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

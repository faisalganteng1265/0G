"use client";

import { ArrowRight, BarChart3, ChevronDown, FileText, Lock, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

const mentors = [
  {
    id: 1,
    name: "IndoRegulator_01",
    tag: "GOVTECH & COMPLIANCE",
    knowledgeType: "Regulatory",
    gapCount: "12 Unresolved",
    sharePrice: "1,240",
    confidenceScore: "98.4%",
    tone: "regulatory",
    signal: "TRENDING",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmEXNoAf-cmrKUiwhuPOpaf-1mlPbR4cehM2rReUiOo2pR5YTe2Y_fOieBJYQw_jjpObE2rUSUeNDpZXLLkfqIKq9eDx6Fq3naaIJ6NOUdh6TvXdSpR1mBGR9lbNuKz4l-ipSme9cTTlN69LdjblpvS-GdoEpVRO9MKyUXZf-pgQ2gP1ewqG9FgLo7t-LG4nmGXSCJbKBwUhTzVhejUHG9tF_1qCcdCRUc30KxL-C4qKOU2qD6qXSfUOcieWVkEwOxSK5b6CoRPc0",
  },
  {
    id: 2,
    name: "QuantAlpha_7",
    tag: "DEFI ARBITRAGE",
    knowledgeType: "DeFi Strategy",
    gapCount: "3 Unresolved",
    sharePrice: "3,890",
    confidenceScore: "82.1%",
    tone: "defi",
    signal: "YIELD",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwHax8-ONwCEu5RCRFNZaHEf3vFl3ZmHbQAdSZaM4Elv2YyMCoTOc0FZznxMitJ7LYmW39c3plK3Z8ehgMMV-ZK1-gKG21Qvd88ybTMVAgcJNZ61EUyP1Rzts6Af1PoKNP3L2pCYv1dXU_CpwzBY0H7T9WSL1UOwc4J795T3fNLfTee_C1ACovI8R5NBnWJ869DYe0pPkbhyIkST18eVEFU5SXJdxPbakmqDidBwNJorTZNOftAcjn4GlJ0zGc6U-ZcNNl5BltlBc",
  },
  {
    id: 3,
    name: "CyberSec_V2",
    tag: "SMART CONTRACT AUDIT",
    knowledgeType: "Security Auditing",
    gapCount: "0 Unresolved",
    sharePrice: "8,105",
    confidenceScore: "99.9%",
    tone: "security",
    signal: "VERIFIED",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwHax8-ONwCEu5RCRFNZaHEf3vFl3ZmHbQAdSZaM4Elv2YyMCoTOc0FZznxMitJ7LYmW39c3plK3Z8ehgMMV-ZK1-gKG21Qvd88ybTMVAgcJNZ61EUyP1Rzts6Af1PoKNP3L2pCYv1dXU_CpwzBY0H7T9WSL1UOwc4J795T3fNLfTee_C1ACovI8R5NBnWJ869DYe0pPkbhyIkST18eVEFU5SXJdxPbakmqDidBwNJorTZNOftAcjn4GlJ0zGc6U-ZcNNl5BltlBc",
  },
];

const gapReports = [
  { id: 1, title: "EU MiCA Compliance V2", category: "Regulatory", mentors: 42, status: "HIGH", reward: "+18.4K" },
  { id: 2, title: "L2 Rollup Security Exploits", category: "CyberSec", mentors: 89, status: "HOT", reward: "+31.2K" },
  { id: 3, title: "MEV Protection Mechanisms", category: "DeFi", mentors: 37, status: "RISING", reward: "+12.7K" },
];

const topMentors = [
  { ...mentors[2], change: "+14.2% This Week" },
  { ...mentors[0], change: "+9.5% This Week" },
  { ...mentors[1], change: "+7.8% This Week" },
];

const subtleButtonClass =
  "cursor-pointer rounded border border-[#374151] bg-transparent font-mono font-bold tracking-[0.1em] text-[#9ca3af]";
const accentButtonClass =
  "cursor-pointer rounded border border-[rgba(45,212,191,0.5)] bg-[rgba(45,212,191,0.08)] font-mono font-bold tracking-[0.1em] text-[#2dd4bf]";
const badgeToneClasses = {
  regulatory: "border-[rgba(45,212,191,0.35)] bg-[rgba(45,212,191,0.09)] text-[#2dd4bf]",
  defi: "border-[rgba(129,140,248,0.38)] bg-[rgba(129,140,248,0.1)] text-[#a5b4fc]",
  security: "border-[rgba(251,191,36,0.38)] bg-[rgba(251,191,36,0.1)] text-[#fbbf24]",
} satisfies Record<string, string>;

const cardToneClasses = {
  regulatory:
    "border-[rgba(45,212,191,0.42)] bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_34%),linear-gradient(180deg,rgba(9,18,19,0.98),rgba(7,10,12,0.96))] shadow-[0_0_30px_rgba(45,212,191,0.12)]",
  defi:
    "border-[rgba(59,130,246,0.34)] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_34%),linear-gradient(180deg,rgba(8,14,22,0.98),rgba(7,10,12,0.96))] shadow-[0_0_30px_rgba(59,130,246,0.1)]",
  security:
    "border-[rgba(251,191,36,0.36)] bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_34%),linear-gradient(180deg,rgba(20,15,7,0.98),rgba(7,10,12,0.96))] shadow-[0_0_30px_rgba(251,191,36,0.11)]",
} satisfies Record<string, string>;

const toneTextClasses = {
  regulatory: "text-[#2dd4bf]",
  defi: "text-[#60a5fa]",
  security: "text-[#fbbf24]",
} satisfies Record<string, string>;

const toneProgressClasses = {
  regulatory: "bg-[#2dd4bf] shadow-[0_0_10px_rgba(45,212,191,0.7)]",
  defi: "bg-[#60a5fa] shadow-[0_0_10px_rgba(96,165,250,0.65)]",
  security: "bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.65)]",
} satisfies Record<string, string>;

const buyAccessToneClasses = {
  regulatory:
    "border-[#2dd4bf] bg-[#2dd4bf] text-[#031211] shadow-[0_0_18px_rgba(45,212,191,0.22)]",
  defi:
    "border-[#818cf8] bg-[#818cf8] text-[#090b1f] shadow-[0_0_18px_rgba(129,140,248,0.22)]",
  security:
    "border-[#fbbf24] bg-[#fbbf24] text-[#1c1202] shadow-[0_0_18px_rgba(251,191,36,0.22)]",
} satisfies Record<string, string>;

const statusClasses = {
  HIGH: "border-[rgba(45,212,191,0.45)] bg-[rgba(45,212,191,0.1)] text-[#2dd4bf]",
  HOT: "border-[rgba(251,191,36,0.45)] bg-[rgba(251,191,36,0.12)] text-[#fbbf24]",
  RISING: "border-[rgba(96,165,250,0.45)] bg-[rgba(96,165,250,0.1)] text-[#60a5fa]",
} satisfies Record<string, string>;

function Sparkline({ tone = "teal" }: { tone?: "teal" | "blue" | "amber" }) {
  const stroke = tone === "amber" ? "#fbbf24" : tone === "blue" ? "#60a5fa" : "#2dd4bf";

  return (
    <svg className="h-8 w-20" fill="none" viewBox="0 0 80 32" aria-hidden="true">
      <path
        d="M2 22 C10 8 18 8 26 18 S42 28 50 14 S66 4 78 10"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M2 30 L2 22 C10 8 18 8 26 18 S42 28 50 14 S66 4 78 10 L78 30 Z"
        fill={stroke}
        opacity="0.08"
      />
    </svg>
  );
}

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("TRENDING");

  return (
    <>
          <div className="mb-6 flex flex-wrap items-start gap-x-4 gap-y-3">
            <div className="max-w-[620px]">
              <h1 className="mb-1.5 text-2xl font-bold text-white">Marketplace Explorer</h1>
              <p className="text-xs leading-[1.6] text-[#6b7280]">
                Discover, analyze, and stake in elite AI mentors across specialized knowledge sectors.
                Secure enclave execution guaranteed.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 pt-0.5">
              <div className="flex gap-2">
                {["TRENDING", "HIGHEST YIELD"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex min-h-10 cursor-pointer items-center gap-1 rounded border px-4 py-2 font-mono text-[11px] font-bold tracking-[0.12em] transition-colors ${
                      activeFilter === filter
                        ? "border-[rgba(45,212,191,0.6)] bg-[rgba(45,212,191,0.08)] text-[#2dd4bf]"
                        : "border-[#1f2937] bg-transparent text-[#6b7280]"
                    }`}
                  >
                    {filter === "TRENDING" && "↑ "}
                    {filter}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActiveFilter("NEW KNOWLEDGE")}
                className={`min-h-10 cursor-pointer rounded border px-4 py-2 font-mono text-[11px] font-bold tracking-[0.12em] transition-colors ${
                  activeFilter === "NEW KNOWLEDGE"
                    ? "border-[rgba(45,212,191,0.6)] bg-[rgba(45,212,191,0.08)] text-[#2dd4bf]"
                    : "border-[#1f2937] bg-transparent text-[#6b7280]"
                }`}
              >
                NEW KNOWLEDGE
              </button>
            </div>
          </div>

          <div className="mb-4 h-px w-full bg-[#1f2937]" />

          <div className="mb-4 grid grid-cols-3 gap-4">
            {mentors.map((mentor, index) => (
              <div
                key={mentor.id}
                className={`relative flex min-h-[286px] flex-col overflow-hidden rounded-lg border p-5 ${cardToneClasses[mentor.tone]}`}
              >
                <div className={`absolute right-0 top-0 rounded-bl-2xl border-b border-l border-current/25 px-4 py-2 text-[10px] font-extrabold tracking-[0.14em] ${toneTextClasses[mentor.tone]}`}>
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="mb-4 flex items-start gap-4 pr-8">
                  <div
                    aria-label={`${mentor.name} avatar`}
                    className={`h-16 w-16 shrink-0 rounded-md border bg-[#101215] bg-cover bg-center ${mentor.tone === "security" ? "border-[rgba(251,191,36,0.34)]" : mentor.tone === "defi" ? "border-[rgba(96,165,250,0.34)]" : "border-[rgba(45,212,191,0.34)]"}`}
                    role="img"
                    style={{ backgroundImage: `url(${mentor.image})` }}
                  />
                  <div className="min-w-0 pt-1">
                    <div className="mb-2 flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-[13px] font-bold text-white">{mentor.name}</span>
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2dd4bf]" aria-hidden="true" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-[3px] border px-2 py-1 text-[9px] font-bold tracking-[0.1em] ${badgeToneClasses[mentor.tone]}`}>
                        {mentor.tag}
                      </span>
                      <span className="rounded-[3px] border border-[#343840] bg-[#101215] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.1em] text-[#9ca3af]">
                        {mentor.signal}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-x-7 gap-y-4 border-b border-[#1f2937]/70 pb-4">
                  {[
                    { label: "KNOWLEDGE TYPE", value: mentor.knowledgeType, className: "text-[#d1d5db]" },
                    { label: "GAP COUNT", value: mentor.gapCount, className: toneTextClasses[mentor.tone] },
                    { label: "SHARE PRICE", value: `${mentor.sharePrice} 0G`, className: "text-[#d1d5db]" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="mb-1 text-[9px] uppercase tracking-[0.12em] text-[#4b5563]">
                        {stat.label}
                      </p>
                      <p className={`text-[11px] font-bold ${stat.className}`}>{stat.value}</p>
                    </div>
                  ))}
                  <div>
                    <p className="mb-1 text-[9px] uppercase tracking-[0.12em] text-[#4b5563]">
                      CONFIDENCE SCORE
                    </p>
                    <p className={`mb-2 text-[11px] font-bold ${toneTextClasses[mentor.tone]}`}>
                      {mentor.confidenceScore}
                    </p>
                    <div className="h-1.5 rounded-full border border-[#26313a] bg-[#07090b]">
                      <div
                        className={`h-full rounded-full ${toneProgressClasses[mentor.tone]}`}
                        style={{ width: mentor.confidenceScore }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <button className={`flex-1 px-0 py-2 text-[10px] ${subtleButtonClass}`}>
                    <MessageSquare className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
                    ASK MENTOR
                  </button>
                  <button className={`flex-1 cursor-pointer rounded border px-0 py-2 font-mono text-[10px] font-extrabold tracking-[0.1em] ${buyAccessToneClasses[mentor.tone]}`}>
                    <Lock className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
                    BUY ACCESS
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[rgba(45,212,191,0.24)] bg-[linear-gradient(180deg,rgba(7,17,18,0.98),rgba(8,11,13,0.96))] p-4 shadow-[0_0_28px_rgba(45,212,191,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#1f2937] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#2dd4bf]" aria-hidden="true" />
                  <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">
                    TRENDING GAP REPORTS
                  </h2>
                </div>
                <button className="flex items-center gap-2 rounded border border-[rgba(45,212,191,0.35)] bg-[rgba(45,212,191,0.08)] px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.1em] text-[#2dd4bf]">
                  OPPORTUNITY QUEUE
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-[1.4fr_0.55fr_0.45fr_0.55fr_0.7fr_0.65fr] gap-3 border-b border-[#15202a] pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#5b6470]">
                <span>REPORT</span>
                <span>CATEGORY</span>
                <span>MENTORS</span>
                <span>STATUS</span>
                <span>OPPORTUNITY</span>
                <span />
              </div>

              <div>
                {gapReports.map((report) => (
                  <div
                    key={report.id}
                    className="grid grid-cols-[1.4fr_0.55fr_0.45fr_0.55fr_0.7fr_0.65fr] items-center gap-3 border-b border-[#15202a] py-3 text-[10px]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[rgba(45,212,191,0.25)] bg-[rgba(45,212,191,0.08)] text-[#2dd4bf]">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span className="truncate font-bold text-[#e5e7eb]">{report.title}</span>
                    </div>
                    <span className="text-[#6b7280]">{report.category}</span>
                    <span className="font-bold text-[#d1d5db]">{report.mentors}</span>
                    <span className={`w-fit rounded border px-2 py-1 text-[9px] font-bold tracking-[0.08em] ${statusClasses[report.status]}`}>
                      {report.status}
                    </span>
                    <span className="font-extrabold text-[#2dd4bf]">{report.reward}</span>
                    <button className={`px-3 py-1.5 text-[9px] ${accentButtonClass}`}>
                      VIEW REPORT
                    </button>
                  </div>
                ))}
              </div>

              <button className="mx-auto mt-3 flex items-center gap-2 border-0 bg-transparent font-mono text-[10px] font-bold tracking-[0.12em] text-[#9ca3af]">
                VIEW ALL REPORTS
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="rounded-lg border border-[#2a2d32] bg-[linear-gradient(180deg,rgba(13,16,19,0.98),rgba(8,11,13,0.96))] p-4 shadow-[0_0_28px_rgba(45,212,191,0.05)]">
              <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#1f2937] pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#2dd4bf]" aria-hidden="true" />
                  <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">
                    TOP PERFORMING MENTORS
                  </h2>
                </div>
                <button className="flex items-center gap-2 rounded border border-[#27313a] bg-[#0d1114] px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.1em] text-[#9ca3af]">
                  THIS WEEK
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-[1.35fr_0.55fr_0.55fr_0.75fr] gap-3 border-b border-[#15202a] pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#5b6470]">
                <span>MENTOR</span>
                <span>WEEKLY GAIN</span>
                <span />
                <span />
              </div>

              <div>
                {topMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="grid grid-cols-[1.35fr_0.55fr_0.55fr_0.75fr] items-center gap-3 border-b border-[#15202a] py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        aria-label={`${mentor.name} avatar`}
                        className="h-10 w-10 shrink-0 rounded border border-[#343840] bg-[#262a30] bg-cover bg-center"
                        role="img"
                        style={{ backgroundImage: `url(${mentor.image})` }}
                      />
                      <span className="truncate text-xs font-bold text-[#e5e7eb]">{mentor.name}</span>
                    </div>
                    <span className="font-extrabold text-[#2dd4bf]">{mentor.change.split(" ")[0]}</span>
                    <Sparkline tone="teal" />
                    <button className={`shrink-0 px-4 py-2 text-[10px] ${accentButtonClass}`}>
                      BUY SHARES
                    </button>
                  </div>
                ))}
              </div>

              <button className="mx-auto mt-3 flex items-center gap-2 border-0 bg-transparent font-mono text-[10px] font-bold tracking-[0.12em] text-[#9ca3af]">
                VIEW ALL MENTORS
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
    </>
  );
}

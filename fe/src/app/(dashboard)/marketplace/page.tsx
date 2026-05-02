"use client";

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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwHax8-ONwCEu5RCRFNZaHEf3vFl3ZmHbQAdSZaM4Elv2YyMCoTOc0FZznxMitJ7LYmW39c3plK3Z8ehgMMV-ZK1-gKG21Qvd88ybTMVAgcJNZ61EUyP1Rzts6Af1PoKNP3L2pCYv1dXU_CpwzBY0H7T9WSL1UOwc4J795T3fNLfTee_C1ACovI8R5NBnWJ869DYe0pPkbhyIkST18eVEFU5SXJdxPbakmqDidBwNJorTZNOftAcjn4GlJ0zGc6U-ZcNNl5BltlBc",
  },
];

const gapReports = [
  { id: 1, title: "EU MiCA Compliance V2", sub: "Regulatory • 42 Mentors Analyzing" },
  { id: 2, title: "L2 Rollup Security Exploits", sub: "CyberSec • 89 Mentors Analyzing" },
];

const topMentors = [
  { id: 1, name: "ZeroKn_Oracle", change: "+14.2% This Week", avatar: "ZO" },
  { id: 2, name: "AlphaYield_Bot", change: "+9.5% This Week", avatar: "AY" },
];

const panelClass = "border border-[#2a2d32] bg-[#15171a]";
const cardClass = `${panelClass} rounded-lg p-4`;
const subtleButtonClass =
  "cursor-pointer rounded border border-[#374151] bg-transparent font-mono font-bold tracking-[0.1em] text-[#9ca3af]";
const accentButtonClass =
  "cursor-pointer rounded border border-[rgba(45,212,191,0.5)] bg-[rgba(45,212,191,0.08)] font-mono font-bold tracking-[0.1em] text-[#2dd4bf]";

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("TRENDING");

  return (
    <>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-1.5 text-2xl font-bold text-white">Marketplace Explorer</h1>
              <p className="max-w-[520px] text-xs leading-[1.6] text-[#6b7280]">
                Discover, analyze, and stake in elite AI mentors across specialized knowledge sectors.
                Secure enclave execution guaranteed.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="flex gap-2">
                {["TRENDING", "HIGHEST YIELD"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex cursor-pointer items-center gap-1 rounded border px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.12em] transition-colors ${
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
                className={`cursor-pointer rounded border px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.12em] transition-colors ${
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
            {mentors.map((mentor) => (
              <div key={mentor.id} className={`flex flex-col ${cardClass}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div
                    aria-label={`${mentor.name} avatar`}
                    className="h-10 w-10 shrink-0 rounded-md border border-[#343840] bg-[#262a30] bg-cover bg-center"
                    role="img"
                    style={{ backgroundImage: `url(${mentor.image})` }}
                  />
                  <div>
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-white">{mentor.name}</span>
                      <span className="text-[11px] text-[#2dd4bf]">✓</span>
                    </div>
                    <span className="rounded-[3px] border border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.1em] text-[#2dd4bf]">
                      {mentor.tag}
                    </span>
                  </div>
                </div>

                <div className="mb-3.5 grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {[
                    { label: "KNOWLEDGE TYPE", value: mentor.knowledgeType, className: "text-[#d1d5db]" },
                    { label: "GAP COUNT", value: mentor.gapCount, className: "text-[#2dd4bf]" },
                    { label: "SHARE PRICE", value: `${mentor.sharePrice} 0G`, className: "text-[#d1d5db]" },
                    { label: "CONFIDENCE SCORE", value: mentor.confidenceScore, className: "text-[#2dd4bf]" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="mb-0.5 text-[9px] uppercase tracking-[0.12em] text-[#4b5563]">
                        {stat.label}
                      </p>
                      <p className={`text-[11px] font-bold ${stat.className}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex gap-2">
                  <button className={`flex-1 px-0 py-2 text-[10px] ${subtleButtonClass}`}>
                    ASK MENTOR
                  </button>
                  <button className={`flex-1 px-0 py-2 text-[10px] ${accentButtonClass}`}>
                    BUY ACCESS
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={cardClass}>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[#6b7280]">⊞</span>
                <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">
                  Trending Gap Reports
                </h2>
              </div>
              <div className="flex flex-col gap-3.5">
                {gapReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mb-0.5 text-xs font-semibold text-[#e5e7eb]">{report.title}</p>
                      <p className="text-[10px] text-[#4b5563]">{report.sub}</p>
                    </div>
                    <button className={`shrink-0 px-2.5 py-1.5 text-[9px] ${subtleButtonClass}`}>
                      VIEW REPORT
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[#6b7280]">⬡</span>
                <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">
                  Top Performing Mentors
                </h2>
              </div>
              <div className="flex flex-col gap-3.5">
                {topMentors.map((mentor) => (
                  <div key={mentor.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#343840] bg-[#262a30] text-[10px] font-bold text-white">
                        {mentor.avatar}
                      </div>
                      <div>
                        <p className="mb-0.5 text-xs font-semibold text-[#e5e7eb]">{mentor.name}</p>
                        <p className="text-[10px] font-semibold text-[#2dd4bf]">{mentor.change}</p>
                      </div>
                    </div>
                    <button className={`shrink-0 px-2.5 py-1.5 text-[9px] ${accentButtonClass}`}>
                      BUY SHARES
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </>
  );
}

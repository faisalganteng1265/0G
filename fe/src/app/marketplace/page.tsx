"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Aurora from "@/components/Aurora";

const mentors = [
  {
    id: 1,
    name: "IndoRegulator_01",
    tag: "GOVTECH & COMPLIANCE",
    knowledgeType: "Regulatory",
    gapCount: "12 Unresolved",
    sharePrice: "1,240",
    confidenceScore: "98.4%",
    avatar: "IR",
  },
  {
    id: 2,
    name: "QuantAlpha_7",
    tag: "DEFI ARBITRAGE",
    knowledgeType: "DeFi Strategy",
    gapCount: "3 Unresolved",
    sharePrice: "3,890",
    confidenceScore: "82.1%",
    avatar: "QA",
  },
  {
    id: 3,
    name: "CyberSec_V2",
    tag: "SMART CONTRACT AUDIT",
    knowledgeType: "Security Auditing",
    gapCount: "0 Unresolved",
    sharePrice: "8,105",
    confidenceScore: "99.9%",
    avatar: "CS",
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

const sidebarLinks = [
  { label: "MARKETPLACE", icon: "⊞", href: "/marketplace" },
  { label: "MY MENTORS", icon: "⬡", href: "/my-mentors" },
  { label: "MY SHARES", icon: "◈", href: "/my-shares" },
  { label: "GAP REPORTS", icon: "⚠", href: "/gap-reports" },
  { label: "EARNINGS", icon: "◎", href: "/earnings" },
  { label: "SECURITY LOGS", icon: "⛨", href: "/security-logs" },
];

const accent = "text-[#2dd4bf]";
const panelClass = "border border-[#1f2937] bg-[#111519]";
const cardClass = `${panelClass} rounded-lg p-4`;
const subtleButtonClass =
  "cursor-pointer rounded border border-[#374151] bg-transparent font-mono font-bold tracking-[0.1em] text-[#9ca3af]";
const accentButtonClass =
  "cursor-pointer rounded border border-[rgba(45,212,191,0.5)] bg-[rgba(45,212,191,0.08)] font-mono font-bold tracking-[0.1em] text-[#2dd4bf]";

export default function MarketplacePage() {
  const pathname = usePathname();
  const [activeFilter, setActiveFilter] = useState("TRENDING");
  const [activeNav, setActiveNav] = useState("MARKETPLACE");

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#0b0d0f] font-mono text-[#d1d5db]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <Aurora
          colorStops={["#507f48", "#1b4315", "#433e55"]}
          blend={0.5}
          amplitude={1}
          speed={1}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#0b0d0f]/60" />

      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#1f2937] bg-[#0d1014]/90 px-5 backdrop-blur">
        <div className="flex items-center gap-8">
          <span className="text-base font-extrabold tracking-[0.15em] text-white">
            AI<span className={accent}>MENTOR</span>.X
          </span>
          <nav className="flex gap-5">
            {["MARKETPLACE", "STAKING", "GOVERNANCE", "DOCS"].map((link) => (
              <button
                key={link}
                onClick={() => setActiveNav(link)}
                className={`cursor-pointer border-0 border-b-2 bg-transparent pb-0.5 font-mono text-[11px] font-bold tracking-[0.12em] transition-colors ${
                  activeNav === link
                    ? "border-[#2dd4bf] text-[#2dd4bf]"
                    : "border-transparent text-[#6b7280]"
                }`}
              >
                {link}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded border border-[#374151] bg-[#141a1f] px-2.5 py-1.5">
            <svg width="12" height="12" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search mentors..."
              className="w-[130px] border-0 bg-transparent font-mono text-[11px] text-[#9ca3af] outline-none placeholder:text-[#6b7280]"
            />
          </div>
          <button className="flex cursor-pointer items-center gap-1.5 rounded border-0 bg-[#2dd4bf] px-3.5 py-[7px] font-mono text-[11px] font-extrabold tracking-[0.1em] text-black">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            CONNECT WALLET
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="flex w-[200px] shrink-0 flex-col justify-between border-r border-[#1f2937] bg-[#0d1014]/85 py-4 backdrop-blur">
          <div>
            <div className="flex items-center gap-2.5 px-4 pb-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(45,212,191,0.4)] bg-[rgba(45,212,191,0.15)]">
                <div className="h-2.5 w-2.5 rounded-full bg-[#2dd4bf]" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.1em] text-white">NODE_01</p>
                <p className="text-[9px] uppercase tracking-[0.08em] text-[#4b5563]">
                  LIVE_DATING_ENCLAVE
                </p>
              </div>
            </div>
            <div className="mx-4 mb-3 h-px bg-[#1f2937]" />

            <nav className="flex flex-col gap-0.5 px-2">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.label}
                    className={`flex w-full cursor-pointer items-center gap-2.5 rounded border px-3 py-2 text-left font-mono text-[10px] font-bold tracking-[0.12em] transition-colors ${
                      isActive
                        ? "border-[rgba(45,212,191,0.25)] bg-[rgba(45,212,191,0.08)] text-[#2dd4bf]"
                        : "border-transparent bg-transparent text-[#6b7280]"
                    }`}
                    href={link.href}
                  >
                    <span className="text-[13px]">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="px-3">
            <button className="mb-3 w-full cursor-pointer rounded border border-[rgba(45,212,191,0.5)] bg-transparent py-2.5 font-mono text-[10px] font-extrabold tracking-[0.12em] text-[#2dd4bf]">
              MINT NEW MENTOR
            </button>
            <div className="mb-2.5 h-px bg-[#1f2937]" />
            {["SUPPORT", "SYSTEM STATUS"].map((item) => (
              <button
                key={item}
                className="block w-full cursor-pointer border-0 bg-transparent px-1 py-1 text-left font-mono text-[10px] tracking-[0.1em] text-[#4b5563]"
              >
                {item === "SUPPORT" ? "? " : "↯ "}
                {item}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-1.5 text-2xl font-bold text-white">Marketplace Explorer</h1>
              <p className="max-w-[360px] text-xs leading-[1.6] text-[#6b7280]">
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

          <div className="mb-4 grid grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <div key={mentor.id} className={`flex flex-col ${cardClass}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#1f2937] bg-[#0f766e] text-xs font-bold text-white">
                    {mentor.avatar}
                  </div>
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
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#1f2937] bg-[#0f766e] text-[10px] font-bold text-white">
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
        </main>
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-[#1f2937] bg-[#0d1014] px-6 py-2.5">
        <p className="text-[9px] tracking-[0.1em] text-[#374151]">
          © 2024 AIMENTOR.X. POWERED BY 0G_PROTOCOL.
        </p>
        <div className="flex gap-5">
          {["0G HACKATHON", "DOCUMENTATION", "SECURITY AUDIT", "GITHUB"].map((link) => (
            <button
              key={link}
              className="cursor-pointer border-0 bg-transparent font-mono text-[9px] tracking-[0.1em] text-[#4b5563]"
            >
              {link}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

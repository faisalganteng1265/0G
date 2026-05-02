"use client";

import { ReactNode } from "react";

import Aurora from "@/components/Aurora";
import MarketplaceSidebar from "@/components/MarketplaceSidebar";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="relative isolate flex min-h-screen flex-col gap-4 overflow-hidden bg-[#0b0d0f] p-4 font-mono text-[#d1d5db]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <Aurora
          colorStops={["#507f48", "#1b4315", "#433e55"]}
          blend={0.75}
          amplitude={2.4}
          speed={1}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#0b0d0f]/64" />

      <header className="flex h-12 shrink-0 items-center justify-between rounded-lg border border-[#2a2d32] bg-[#050607]/95 px-5 shadow-2xl shadow-black/30">
        <div className="flex min-w-0 items-center gap-8">
          <span className="shrink-0 text-base font-extrabold tracking-[0.15em] text-white">
            AI<span className="text-[#2dd4bf]">MENTOR</span>.X
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-1.5 rounded border border-[#374151] bg-[#141a1f] px-2.5 py-1.5 sm:flex">
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

      <div className="flex min-h-0 flex-1 gap-4">
        <MarketplaceSidebar />
        <main className="flex-1 overflow-y-auto rounded-lg border border-[#2a2d32] bg-[#050607]/95 p-6 shadow-2xl shadow-black/30">
          {children}
        </main>
      </div>

      <footer className="flex shrink-0 items-center justify-between rounded-lg border border-[#2a2d32] bg-[#050607]/95 px-6 py-2.5 shadow-2xl shadow-black/30">
        <p className="text-[9px] tracking-[0.1em] text-[#374151]">
          © 2026 AIMENTOR.X. POWERED BY 0G_PROTOCOL.
        </p>
        <div className="hidden gap-5 sm:flex">
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

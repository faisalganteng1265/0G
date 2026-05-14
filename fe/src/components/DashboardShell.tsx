"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent, ReactNode, useRef, useState } from "react";

import Dither from "@/components/Dither";
import MarketplaceSidebar, { sidebarLinks } from "@/components/MarketplaceSidebar";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const scrollbarTimeoutRef = useRef<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  function handleMainScroll() {
    setIsScrollbarVisible(true);

    if (scrollbarTimeoutRef.current) {
      window.clearTimeout(scrollbarTimeoutRef.current);
    }

    scrollbarTimeoutRef.current = window.setTimeout(() => {
      setIsScrollbarVisible(false);
    }, 900);
  }

  function handleMobileNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setMobileMenuOpen(false);

    if (pathname === href) {
      event.preventDefault();
      return;
    }

    const panel = document.querySelector(".route-panel-transition");

    if (!panel) return;

    event.preventDefault();
    panel.classList.add("route-panel-transition--leaving");

    window.setTimeout(() => {
      router.push(href);
    }, 180);
  }

  return (
    <div className="relative isolate flex h-screen flex-col gap-4 overflow-hidden bg-[#0b0d0f] p-4 font-mono text-[#d1d5db]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-95">
        <Dither
          waveColor={[0.17647058823529413, 0.8313725490196079, 0.7490196078431373]}
          disableAnimation={false}
          enableMouseInteraction
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.38}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#0b0d0f]/45" />

      <header className="flex h-12 shrink-0 items-center justify-between rounded-lg border border-[#2a2d32] bg-[#050607]/95 px-5 shadow-2xl shadow-black/30">
        <div className="flex min-w-0 items-center gap-8">
          <span className="shrink-0 text-base font-extrabold tracking-[0.15em] text-white">
            TAC<span className="text-[#2dd4bf]">IT</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-[#374151] bg-[#141a1f] md:hidden"
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? (
              <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
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
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchValue.trim()) {
                  router.push(`/marketplace?q=${encodeURIComponent(searchValue.trim())}`);
                }
              }}
            />
          </div>
          <ConnectButton.Custom>
            {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
              const connected = mounted && account && chain;

              if (!connected) {
                return (
                  <button
                    className="flex cursor-pointer items-center gap-1.5 rounded border-0 bg-[#2dd4bf] px-3.5 py-[7px] font-mono text-[11px] font-extrabold tracking-[0.1em] text-black"
                    type="button"
                    onClick={openConnectModal}
                  >
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
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    className="flex cursor-pointer items-center gap-1.5 rounded border border-red-500/60 bg-red-500/15 px-3.5 py-[7px] font-mono text-[11px] font-extrabold tracking-[0.1em] text-red-200"
                    type="button"
                    onClick={openChainModal}
                  >
                    WRONG NETWORK
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    className="hidden cursor-pointer items-center rounded border border-[#374151] bg-[#141a1f] px-2.5 py-[7px] font-mono text-[10px] font-bold tracking-[0.08em] text-[#d1d5db] sm:flex"
                    type="button"
                    onClick={openChainModal}
                  >
                    {chain.name}
                  </button>
                  <button
                    className="flex cursor-pointer items-center rounded border-0 bg-[#2dd4bf] px-3.5 py-[7px] font-mono text-[11px] font-extrabold tracking-[0.1em] text-black"
                    type="button"
                    onClick={openAccountModal}
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="shrink-0 overflow-y-auto rounded-lg border border-[#2a2d32] bg-[#050607]/95 px-3 py-3 shadow-2xl shadow-black/30 md:hidden">
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleMobileNavClick(e, link.href)}
                  className={`relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded border px-3.5 py-3 text-left font-mono text-[11px] font-bold tracking-[0.12em] transition-colors ${
                    isActive
                      ? "border-[rgba(45,212,191,0.34)] bg-[linear-gradient(90deg,rgba(45,212,191,0.16),rgba(45,212,191,0.06))] text-[#2dd4bf] shadow-[inset_-3px_0_0_#2dd4bf,0_0_18px_rgba(45,212,191,0.12)]"
                      : "border-transparent bg-transparent text-[#6b7280] hover:bg-[#101517] hover:text-[#9ca3af]"
                  }`}
                >
                  <span className="text-[15px]">{link.icon}</span>
                  {link.label}
                  {isActive && (
                    <span className="ml-auto text-[10px] font-extrabold text-[#2dd4bf]" aria-hidden="true">
                      +
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <MarketplaceSidebar />
        <main
          className={`dashboard-content min-h-0 flex-1 overflow-y-auto rounded-lg border border-[#2a2d32] bg-[#050607]/95 p-6 shadow-2xl shadow-black/30 ${
            isScrollbarVisible ? "dashboard-content--scrolling" : ""
          }`}
          onScroll={handleMainScroll}
        >
          {children}
        </main>
      </div>

      <footer className="flex shrink-0 items-center justify-between rounded-lg border border-[#2a2d32] bg-[#050607]/95 px-6 py-2.5 shadow-2xl shadow-black/30">
        <p className="text-[9px] tracking-[0.1em] text-[#374151]">
          © 2026 TACIT. POWERED BY 0G_PROTOCOL.
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

const sidebarLinks = [
  { label: "MARKETPLACE", icon: "⊞", href: "/marketplace" },
  { label: "MY MENTORS", icon: "⬡", href: "/my-mentors" },
  { label: "MY SHARES", icon: "◈", href: "/my-shares" },
  { label: "GAP REPORTS", icon: "⚠", href: "/gap-reports" },
  { label: "EARNINGS", icon: "◎", href: "/earnings" },
  { label: "SECURITY LOGS", icon: "⛨", href: "/security-logs" },
];

const nodeLogoSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBEQYK9jLglg6UCi4fhrRP1JETedU2lu7sQgLciY8P212-3wmotdwgQdaLYuZALgjVvmXri72OoTgDkr6zrLbYxLXD3mTufG84F9tkvVFJusde4orHOIBpRlvnOiSu7PLxn_X5-NDEdcaGuiNrJammsTPZeCPNYjxa2FyiLb8Q_uGgzxNqh_PgfA_G2pNk-NzF1bYurV-tiW_ctsazahaBpUCZAW1jpFIJPrWbtF_gNValweIowR_oL1YUw_QpRejokAHz-fTFIm-0";

export default function MarketplaceSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleRouteClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (pathname === href) {
      event.preventDefault();
      return;
    }

    const panel = document.querySelector(".route-panel-transition");

    if (!panel) {
      return;
    }

    event.preventDefault();
    panel.classList.add("route-panel-transition--leaving");

    window.setTimeout(() => {
      router.push(href);
    }, 180);
  }

  return (
    <aside className="flex w-[200px] shrink-0 flex-col justify-between rounded-lg border border-[#2a2d32] bg-[#050607]/95 py-4 shadow-2xl shadow-black/30">
      <div>
        <div className="flex items-center gap-2.5 px-4 pb-3">
          <div
            aria-label="Node logo"
            className="h-8 w-8 shrink-0 rounded-full border border-white/15 bg-[#15171a] bg-cover bg-center"
            role="img"
            style={{ backgroundImage: `url(${nodeLogoSrc})` }}
          />
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
                onClick={(event) => handleRouteClick(event, link.href)}
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
  );
}

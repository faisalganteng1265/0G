"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type MouseEvent } from "react";
import { useWriteContract } from "wagmi";

import { useTxToast } from "@/components/ToastProvider";
import { MARKETPLACE_ADDRESS, marketplaceAbi } from "@/lib/contracts";

export const sidebarLinks = [
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
  const { writeContractAsync } = useWriteContract();
  const txToast = useTxToast();
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [mintName, setMintName] = useState("");
  const [mintCategory, setMintCategory] = useState("");
  const [busy, setBusy] = useState(false);

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

  async function mintMentor(event: FormEvent) {
    event.preventDefault();
    setBusy(true);

    try {
      await txToast("Mint mentor", () =>
        writeContractAsync({
          address: MARKETPLACE_ADDRESS,
          abi: marketplaceAbi,
          functionName: "registerMentor",
          args: [mintName, mintCategory || "General", "pending"],
        }),
      );
      setMintName("");
      setMintCategory("");
      setIsMintOpen(false);
      if (pathname !== "/my-mentors") router.push("/my-mentors");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <aside className="hidden md:flex h-full w-[230px] shrink-0 flex-col justify-between overflow-hidden rounded-lg border border-[#2a2d32] bg-[#050607]/95 py-5 shadow-2xl shadow-black/30">
        <div>
          <div className="flex items-center gap-3 px-5 pb-4">
            <div
              aria-label="Node logo"
              className="h-9 w-9 shrink-0 rounded-full border border-white/15 bg-[#15171a] bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${nodeLogoSrc})` }}
            />
            <div>
              <p className="text-[12px] font-bold tracking-[0.1em] text-white">TACIT</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#4b5563]">
                0G MAINNET · ENCLAVE
              </p>
            </div>
          </div>
          <div className="mx-5 mb-4 h-px bg-[#1f2937]" />

          <nav className="flex flex-col gap-1 px-3">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  className={`relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded border px-3.5 py-3 text-left font-mono text-[11px] font-bold tracking-[0.12em] transition-colors ${
                    isActive
                      ? "border-[rgba(45,212,191,0.34)] bg-[linear-gradient(90deg,rgba(45,212,191,0.16),rgba(45,212,191,0.06))] text-[#2dd4bf] shadow-[inset_-3px_0_0_#2dd4bf,0_0_18px_rgba(45,212,191,0.12)]"
                      : "border-transparent bg-transparent text-[#6b7280] hover:bg-[#101517] hover:text-[#9ca3af]"
                  }`}
                  href={link.href}
                  onClick={(event) => handleRouteClick(event, link.href)}
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

        <div className="px-4">
          <button
            className="mb-4 w-full cursor-pointer rounded border border-[rgba(45,212,191,0.5)] bg-transparent py-3 font-mono text-[11px] font-extrabold tracking-[0.12em] text-[#2dd4bf]"
            onClick={() => setIsMintOpen(true)}
            type="button"
          >
            MINT NEW MENTOR
          </button>
          <div className="mb-2.5 h-px bg-[#1f2937]" />
          {["SUPPORT", "SYSTEM STATUS"].map((item) => (
            <button
              key={item}
              className="block w-full cursor-pointer border-0 bg-transparent px-1 py-1.5 text-left font-mono text-[11px] tracking-[0.1em] text-[#4b5563]"
              type="button"
            >
              {item === "SUPPORT" ? "? " : "↯ "}
              {item}
            </button>
          ))}
        </div>
      </aside>

      {isMintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form className="w-full max-w-[460px] rounded-[7px] border border-[rgba(96,165,250,0.24)] bg-black p-4" onSubmit={mintMentor}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Mint New Mentor</h2>
              <button className="text-[#8b95a3]" onClick={() => setIsMintOpen(false)} type="button">×</button>
            </div>
            <div className="space-y-3">
              <input className="w-full rounded border border-[#26333d] bg-[#050607] px-3 py-2 text-xs text-white outline-none" placeholder="Mentor name" required value={mintName} onChange={(event) => setMintName(event.target.value)} />
              <input className="w-full rounded border border-[#26333d] bg-[#050607] px-3 py-2 text-xs text-white outline-none" placeholder="Category" value={mintCategory} onChange={(event) => setMintCategory(event.target.value)} />
              <button className="w-full rounded border border-[#2dd4bf] bg-[#2dd4bf] py-2.5 font-mono text-[10px] font-extrabold tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-50" disabled={busy} type="submit">
                {busy ? "MINTING..." : "MINT ON-CHAIN"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

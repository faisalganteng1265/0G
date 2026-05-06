"use client";

import { useState, type FormEvent } from "react";
import { isAddress, type Address } from "viem";
import { useAccount, useWriteContract } from "wagmi";

import { shortAddress, useMentors, useSecurityEvents } from "@/hooks/useMarketplace";
import { api } from "@/lib/api";
import { INFT_ADDRESS, inftAbi } from "@/lib/contracts";

import { subtleButtonClass } from "./shared";

const panelClass = "border border-[rgba(96,165,250,0.24)] bg-black";

export default function SecurityView() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { data: securityEvents = [] } = useSecurityEvents();
  const [transferMode, setTransferMode] = useState<"transfer" | "clone" | null>(null);
  const [tokenId, setTokenId] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const logs = securityEvents.slice(0, 8).map((event) => [
    event.type === "Transfer" ? "⇄" : "▱",
    event.type === "Transfer" ? "INFT_TRANSFER" : "STORAGE_COMMIT",
    `Mentor #${event.tokenId} ${event.detail}`,
    shortAddress(event.txHash),
    "INFT_SC",
    "VERIFIED",
    `Block ${event.blockNumber.toString()}`,
  ]);
  const securityStats = [
    ["⛨", "Audit Events", String(securityEvents.length), "↑ on-chain", "#2dd4bf"],
    ["⛨", "TEE Verified", "99.2%", "↑ 0.6% vs last 24h", "#2dd4bf"],
    ["△", "Failed Checks", "0", "↓ -12.5% vs last 24h", "#ef4444"],
    ["◔", "Avg Response SLA", "—", "monitoring", "#2dd4bf"],
  ];

  const severityClass: Record<string, string> = {
    VERIFIED: "border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-[#2dd4bf]",
    INFO: "border-sky-400/35 bg-sky-400/10 text-sky-300",
    LOW: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
    MEDIUM: "border-yellow-400/35 bg-yellow-400/10 text-yellow-300",
    HIGH: "border-red-400/35 bg-red-400/10 text-red-300",
  };

  return (
    <div className="security-reference">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {securityStats.map(([icon, label, value, trend, color]) => (
          <div key={label} className={`${panelClass} rounded-[7px] p-4`}>
            <div className="flex items-start gap-4">
              <span className="mt-0.5 shrink-0 text-[56px] leading-none" style={{ color }}>{icon}</span>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b95a3]">{label}</p>
                <p className="text-[24px] font-bold leading-none text-white">{value}</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <p className="text-[10px] font-bold" style={{ color }}>{trend}</p>
                  <svg viewBox="0 0 100 42" className="h-10 w-[90px] shrink-0" fill="none">
                    <path d="M0 34L8 30L15 20L23 26L31 12L39 18L47 4L55 7L63 25L71 13L79 21L87 11L95 19L100 8" stroke={color} strokeWidth="2" />
                    <path d="M0 42L0 34L8 30L15 20L23 26L31 12L39 18L47 4L55 7L63 25L71 13L79 21L87 11L95 19L100 8L100 42Z" fill={color} opacity="0.16" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.75fr_0.65fr]">
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[#8b95a3]">⛨</span>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Audit Event Stream</h2>
          </div>

          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {["ALL", "TEE", "ACCESS", "STORAGE", "E-SIGN", "ALERTS"].map((tab) => (
                <button
                  key={tab}
                  className={`rounded border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    tab === "ALL"
                      ? "border-[#2dd4bf]/50 bg-[#2dd4bf]/10 text-[#2dd4bf]"
                      : "border-[rgba(96,165,250,0.18)] bg-[rgba(255,255,255,0.025)] text-[#8b95a3]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className={`${subtleButtonClass} px-3 py-2 text-[10px]`}>▽ All Sources⌄</button>
              <button className={`${subtleButtonClass} px-3 py-2 text-[10px]`}>Sort: Newest⌄</button>
              <button className={`${subtleButtonClass} px-3 py-2 text-[10px]`}>☷</button>
            </div>
          </div>

          <div className="overflow-hidden rounded border border-[rgba(96,165,250,0.12)]">
            <div className="grid grid-cols-[1fr_1.55fr_0.78fr_0.72fr_0.66fr_0.65fr_0.56fr] gap-3 bg-[rgba(255,255,255,0.025)] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.12em] text-[#586474]">
              <span>Event</span><span>Detail</span><span>Proof</span><span>Source</span><span>Severity</span><span>Time</span><span>Actions</span>
            </div>
            {logs.length === 0 && (
              <div className="px-4 py-8 text-center text-[11px] text-[#4b5563]">No on-chain events yet. Transfer or clone an INFT to generate logs.</div>
            )}
            {logs.map(([icon, event, detail, proof, source, severity, time]) => (
              <div key={`${event}-${time}`} className="grid grid-cols-[1fr_1.55fr_0.78fr_0.72fr_0.66fr_0.65fr_0.56fr] items-center gap-3 border-t border-[rgba(96,165,250,0.12)] px-3 py-3 text-[10px]">
                <span className="flex items-center gap-2 font-bold text-[#2dd4bf]"><span>{icon}</span>{event}</span>
                <span className="truncate text-[#d1d5db]">{detail}</span>
                <span className="text-[#8b95a3]">{proof}</span>
                <span className="text-[#8b95a3]">{source}</span>
                <span className={`w-fit rounded border px-2 py-1 text-[8px] font-bold ${severityClass[severity]}`}>{severity}</span>
                <span className="text-[#8b95a3]">{time}</span>
                <span className="flex items-center gap-2">
                  <button className="rounded border border-[#2dd4bf]/35 px-2 py-1 text-[#2dd4bf]">⊙</button>
                  <button className="rounded border border-[#2dd4bf]/35 px-2 py-1 text-[#2dd4bf]">⌁</button>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] text-[#8b95a3]">
            <span>Showing 1 to 10 of 234 events</span>
            <div className="flex items-center gap-3">
              <span className="rounded border border-[rgba(96,165,250,0.18)] px-3 py-2">‹</span>
              <span className="rounded border border-[#2dd4bf]/45 bg-[#2dd4bf]/20 px-3 py-2 text-[#2dd4bf]">1</span>
              <span className="rounded border border-[rgba(96,165,250,0.18)] px-3 py-2">2</span>
              <span className="rounded border border-[rgba(96,165,250,0.18)] px-3 py-2">3</span>
              <span>...</span>
              <span className="rounded border border-[rgba(96,165,250,0.18)] px-3 py-2">24</span>
              <span className="rounded border border-[rgba(96,165,250,0.18)] px-3 py-2">›</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Rows per page:</span>
              <button className={`${subtleButtonClass} px-4 py-2 text-[10px]`}>10⌄</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`${panelClass} rounded-[7px] p-4`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#2dd4bf]">⌁</span>
                <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">Security Signals</h2>
              </div>
              <button className="text-[10px] font-bold text-[#2dd4bf]">View All</button>
            </div>
            {[
              ["TEE Health", "99.3%"],
              ["Storage Integrity", "98.7%"],
              ["Access Compliance", "97.6%"],
              ["Signature Coverage", "96.1%"],
              ["Latency Trend (p95)", "142ms"],
            ].map(([label, value]) => (
              <div key={label} className="mb-3 grid grid-cols-[1fr_120px_42px] items-center gap-3 text-[10px]">
                <span className="text-[#d1d5db]">{label}</span>
                <div className="h-[5px] rounded-full bg-[rgba(96,165,250,0.16)]">
                  <div className="h-[5px] rounded-full bg-[#2dd4bf]" style={{ width: value === "142ms" ? "82%" : value }} />
                </div>
                <span className="text-right font-bold text-white">{value}</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between text-[9px] text-[#707b89]">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className={`${subtleButtonClass} px-3 py-2 text-[10px]`} onClick={() => setTransferMode("transfer")} type="button">TRANSFER INFT</button>
              <button className={`${subtleButtonClass} px-3 py-2 text-[10px]`} onClick={() => setTransferMode("clone")} type="button">CLONE INFT</button>
            </div>
          </div>

          <div className={`${panelClass} rounded-[7px] p-4`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-400">△</span>
                <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">Critical Alerts</h2>
              </div>
              <button className="text-[10px] font-bold text-[#2dd4bf]">View All</button>
            </div>
            {[
              ["Failed access check spike", "HIGH", "ACCESS_SVC"],
              ["Storage integrity drift detected", "MEDIUM", "STORAGE_N1"],
              ["Signature coverage below 97%", "MEDIUM", "ESIGN_SVC"],
              ["Enclave uptime below threshold", "LOW", "ENCLAVE_N1"],
            ].map(([title, severity, source]) => (
              <div key={title} className="mb-3 grid grid-cols-[22px_1fr_auto_auto] items-center gap-2 text-[10px]">
                <span className={severity === "HIGH" ? "text-red-400" : severity === "MEDIUM" ? "text-yellow-300" : "text-emerald-300"}>△</span>
                <span className="truncate text-[#d1d5db]">{title}</span>
                <span className={`rounded border px-2 py-0.5 text-[8px] font-bold ${severityClass[severity]}`}>{severity}</span>
                <span className="text-[#8b95a3]">{source}</span>
              </div>
            ))}
          </div>

          <div className={`${panelClass} rounded-[7px] p-4`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#2dd4bf]">☷</span>
                <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">Recent Activity</h2>
              </div>
              <button className="text-[10px] font-bold text-[#2dd4bf]">View All</button>
            </div>
            <div className="relative pl-4">
              <div className="absolute left-[5px] top-2 h-[112px] w-px bg-[#2dd4bf]/50" />
              {[
                ["TEE attestation verified for NODE_01", "2 min ago"],
                ["Mentor consent package signed", "18 min ago"],
                ["Storage commit successful", "41 min ago"],
                ["Shareholder access validated", "1 hr ago"],
                ["Policy rule set updated", "6 hr ago"],
              ].map(([title, time]) => (
                <div key={title} className="relative mb-4 flex items-center justify-between gap-3 text-[10px]">
                  <span className="absolute -left-[14px] h-3 w-3 rounded-full bg-[#2dd4bf] shadow-[0_0_12px_rgba(45,212,191,0.6)]" />
                  <span className="truncate text-[#d1d5db]">{title}</span>
                  <span className="shrink-0 text-[#8b95a3]">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {transferMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            className={`${panelClass} w-full max-w-[500px] rounded-[7px] p-4`}
            onSubmit={async (event: FormEvent) => {
              event.preventDefault();
              if (!isAddress(to)) return;
              setBusy(true);
              const body = { mentorId, tokenId: Number(tokenId), from: address, to };
              const proof = transferMode === "transfer" ? await api.signTransfer(body) : await api.signClone(body);
              await writeContractAsync({
                address: INFT_ADDRESS,
                abi: inftAbi,
                functionName: transferMode === "transfer" ? "iTransfer" : "iClone",
                args: [to as Address, BigInt(tokenId), proof.proofs as never],
              });
              setBusy(false);
              setTransferMode(null);
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">{transferMode === "transfer" ? "Transfer INFT" : "Clone INFT"}</h2>
              <button className="text-[#8b95a3]" onClick={() => setTransferMode(null)} type="button">×</button>
            </div>
            <div className="space-y-3">
              <input className="w-full rounded border border-[#26333d] bg-[#050607] px-3 py-2 text-xs text-white outline-none" placeholder="Mentor ID / key namespace" required value={mentorId} onChange={(event) => setMentorId(event.target.value)} />
              <input className="w-full rounded border border-[#26333d] bg-[#050607] px-3 py-2 text-xs text-white outline-none" placeholder="Token ID" required value={tokenId} onChange={(event) => setTokenId(event.target.value)} />
              <input className="w-full rounded border border-[#26333d] bg-[#050607] px-3 py-2 text-xs text-white outline-none" placeholder="Destination address" required value={to} onChange={(event) => setTo(event.target.value)} />
              <button className={`${subtleButtonClass} w-full px-3 py-2.5 text-[10px]`} disabled={busy || !isAddress(to)} type="submit">{busy ? "SIGNING PROOF..." : "REQUEST ORACLE PROOF"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

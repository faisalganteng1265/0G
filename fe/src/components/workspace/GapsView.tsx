"use client";

import { useState } from "react";

import { useGapEvents, useMentors } from "@/hooks/useMarketplace";

import { subtleButtonClass, accentButtonClass } from "./shared";

const panelClass = "border border-[rgba(96,165,250,0.24)] bg-black";

export default function GapsView() {
  const { data: gapEvents = [] } = useGapEvents();
  const { data: mentors = [] } = useMentors();
  const [activeFilter, setActiveFilter] = useState<"ALL" | "CRITICAL" | "IN REVIEW" | "RESOLVED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showRowsMenu, setShowRowsMenu] = useState(false);

  const allGaps = gapEvents.map((event) => {
    const mentor = mentors.find((item) => item.tokenId === event.tokenId);
    const priority = event.count > 20 ? "CRITICAL" : event.count > 10 ? "HIGH" : event.count > 3 ? "MEDIUM" : "LOW";
    const status = event.type === "GapResolved" ? "RESOLVED" : "IN REVIEW";
    const confidence = Math.max(20, 100 - event.count * 4);
    return {
      title: status === "RESOLVED" ? "Gap resolved by oracle" : "Low-confidence answer detected",
      mentor: mentor?.name ?? `Mentor #${event.tokenId}`,
      category: mentor?.category ?? "Oracle",
      priority,
      confidence: `${confidence}%`,
      queries: String(event.count),
      updated: `Block ${event.blockNumber.toString()}`,
      severity: priority === "LOW" ? "Low severity" : priority === "MEDIUM" ? "Moderate severity" : "High severity",
      status,
    };
  });

  const filteredGaps = activeFilter === "ALL"
    ? allGaps
    : activeFilter === "CRITICAL"
      ? allGaps.filter((g) => g.priority === "CRITICAL")
      : allGaps.filter((g) => g.status === activeFilter);

  const totalPages = Math.max(1, Math.ceil(filteredGaps.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, filteredGaps.length);
  const gaps = filteredGaps.slice(startIdx, endIdx);

  const totalOpenGaps = mentors.reduce((sum, mentor) => sum + mentor.gapCount, 0);
  const criticalGaps = allGaps.filter((gap) => gap.priority === "CRITICAL").length;
  const inReviewGaps = allGaps.filter((gap) => gap.status === "IN REVIEW").length;
  const resolvedGaps = allGaps.filter((gap) => gap.status === "RESOLVED").length;

  const handleFilter = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const queueFilters: [typeof activeFilter, string, string][] = [
    ["ALL", String(allGaps.length), "accent"],
    ["CRITICAL", String(criticalGaps), "critical"],
    ["IN REVIEW", String(inReviewGaps), "warn"],
    ["RESOLVED", String(resolvedGaps), "good"],
  ];
  const gapStats = [
    ["◎", "Total Open Gaps", String(totalOpenGaps), `${gapEvents.length} events`, "on-chain", "#2dd4bf"],
    ["△", "Critical Priority", String(criticalGaps), "live events", "", "#fb7185"],
    ["♧", "Avg Confidence Recovery", "+21.4%", "30d trend", "spark", "#2dd4bf"],
    ["♧", "Pending Reviews", String(Math.max(totalOpenGaps - criticalGaps, 0)), "Needs attention", "", "#2dd4bf"],
  ];

  const priorityTone: Record<string, string> = {
    CRITICAL: "border-red-500/40 bg-red-500/10 text-red-400",
    HIGH: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    MEDIUM: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
    LOW: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  };

  const severityColor: Record<string, string> = {
    CRITICAL: "#fb7185",
    HIGH: "#fb923c",
    MEDIUM: "#facc15",
    LOW: "#34d399",
  };

  return (
    <div className="gaps-reference">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_0.8fr_1.08fr_1.4fr]">
        {gapStats.map(([icon, label, value, detail, extra, color]) => (
          <div key={label} className={`${panelClass} rounded-[7px] p-4`}>
            <div className="flex items-center gap-4">
              <span className="shrink-0 text-[56px] leading-none" style={{ color }}>{icon}</span>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b95a3]">{label}</p>
                <div className="flex items-end gap-4">
                  <p className="text-[24px] font-bold leading-none text-white">{value}</p>
                  {extra === "spark" ? (
                    <svg viewBox="0 0 130 34" className="h-8 flex-1" fill="none">
                      <path d="M0 28L10 25L18 16L28 20L38 8L48 18L58 11L68 19L78 15L88 4L98 16L108 18L118 13L130 4" stroke="#2dd4bf" strokeWidth="2" />
                      <path d="M0 34L0 28L10 25L18 16L28 20L38 8L48 18L58 11L68 19L78 15L88 4L98 16L108 18L118 13L130 4L130 34Z" fill="#2dd4bf" opacity="0.14" />
                    </svg>
                  ) : (
                    <span className={`text-[11px] font-bold ${label === "Total Open Gaps" ? "text-[#2dd4bf]" : "text-[#8b95a3]"}`}>{detail}</span>
                  )}
                </div>
                {extra !== "spark" && extra && <p className="mt-1 text-[10px] text-[#707b89]">{extra}</p>}
                {extra === "spark" && <p className="mt-1 text-[10px] text-[#707b89]">{detail}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.95fr_0.95fr]">
        <div className={`${panelClass} rounded-[7px] p-4`}>
          <div className="mb-4">
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.08em] text-white">Priority Gap Queue</h2>
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex flex-wrap items-center gap-1">
                {queueFilters.map(([label, count, tone]) => (
                  <button
                    key={label}
                    onClick={() => handleFilter(label)}
                    className={`rounded border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] ${
                      activeFilter === label
                        ? tone === "accent"
                          ? "border-[#2dd4bf]/50 bg-[#2dd4bf]/10 text-[#2dd4bf]"
                          : tone === "critical"
                            ? "border-red-500/50 bg-red-500/10 text-red-400"
                            : tone === "warn"
                              ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                              : "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                        : `border-[rgba(96,165,250,0.18)] bg-[rgba(255,255,255,0.025)] ${
                            tone === "accent" ? "text-[#2dd4bf]" : tone === "critical" ? "text-red-400" : tone === "warn" ? "text-amber-300" : "text-emerald-300"
                          }`
                    }`}
                  >
                    {label} <span className="ml-1 rounded bg-black/25 px-1">{count}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#586474]">SORT BY</span>
                <button className={`${subtleButtonClass} px-3 py-2 text-[10px]`}>Priority (High → Low)⌄</button>
                <button className={`${subtleButtonClass} px-3 py-2 text-[10px]`}>▽</button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
          <div className="min-w-[700px] overflow-hidden rounded border border-[rgba(96,165,250,0.14)]">
            <div className="grid grid-cols-[1.75fr_0.7fr_0.65fr_0.65fr_0.5fr_0.65fr_0.8fr_0.78fr] gap-3 bg-[rgba(255,255,255,0.025)] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.12em] text-[#586474]">
              <span>Gap / Source</span><span>Category</span><span>Priority</span><span>Confidence</span><span>Queries</span><span>Last Updated</span><span>Severity</span><span>Actions</span>
            </div>
            {gaps.length === 0 && (
              <div className="px-4 py-8 text-center text-[11px] text-[#4b5563]">No gap events detected on-chain yet.</div>
            )}
            {gaps.map(({ title, mentor, category, priority, confidence, queries, updated, severity }) => {
              const numericConfidence = Number(confidence.replace("%", ""));
              return (
                <div key={title} className="grid grid-cols-[1.75fr_0.7fr_0.65fr_0.65fr_0.5fr_0.65fr_0.8fr_0.78fr] items-center gap-3 border-t border-[rgba(96,165,250,0.12)] px-3 py-3 text-[10px]">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${priority === "CRITICAL" ? "border-red-500/35 bg-red-500/10 text-red-400" : priority === "HIGH" || priority === "MEDIUM" ? "border-yellow-400/35 bg-yellow-400/10 text-yellow-300" : "border-emerald-400/35 bg-emerald-400/10 text-emerald-300"}`}>△</span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{title}</p>
                      <p className="text-[#707b89]">{mentor}</p>
                    </div>
                  </div>
                  <span className="w-fit rounded border border-[rgba(96,165,250,0.16)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-[9px] font-bold text-[#9ca3af]">{category}</span>
                  <span className={`w-fit rounded border px-2 py-1 text-[9px] font-bold ${priorityTone[priority]}`}>{priority}</span>
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 shrink-0 rounded-full" style={{ background: `conic-gradient(${severityColor[priority]} ${numericConfidence * 3.6}deg, rgba(96,165,250,0.14) 0deg)` }}>
                      <div className="absolute inset-[4px] flex items-center justify-center rounded-full bg-[#071014] text-[9px] font-bold text-white">{confidence}</div>
                    </div>
                  </div>
                  <span className="font-bold text-white">{queries}</span>
                  <span className="text-[#d1d5db]">{updated}</span>
                  <div>
                    <div className="mb-1 flex gap-1">
                      {[0, 1, 2, 3, 4].map((bar) => (
                        <span
                          key={bar}
                          className="h-1.5 w-4 rounded-full"
                          style={{ backgroundColor: bar < (priority === "CRITICAL" ? 5 : priority === "HIGH" ? 4 : priority === "MEDIUM" ? 3 : 5) ? severityColor[priority] : "rgba(96,165,250,0.14)" }}
                        />
                      ))}
                    </div>
                    <p className="text-[9px] text-[#707b89]">{severity}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className={`${accentButtonClass} px-2 py-1 text-[8px]`}>OPEN REPORT</button>
                    <button className="text-[9px] font-bold text-[#2dd4bf]">ASSIGN UPDATE</button>
                  </div>
                </div>
              );
            })}
          </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] text-[#707b89]">
            <span>
              {filteredGaps.length === 0
                ? "No gaps"
                : `Showing ${startIdx + 1} to ${endIdx} of ${filteredGaps.length} gaps`}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="rounded border border-[rgba(96,165,250,0.18)] px-3 py-2 disabled:opacity-30"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >‹</button>
              {(() => {
                const pages: (number | "…")[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (safeCurrentPage > 3) pages.push("…");
                  for (let i = Math.max(2, safeCurrentPage - 1); i <= Math.min(totalPages - 1, safeCurrentPage + 1); i++) pages.push(i);
                  if (safeCurrentPage < totalPages - 2) pages.push("…");
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-2">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`rounded border px-3 py-2 ${
                        p === safeCurrentPage
                          ? "border-[#2dd4bf]/45 bg-[#2dd4bf]/20 text-[#2dd4bf]"
                          : "border-[rgba(96,165,250,0.18)]"
                      }`}
                    >{p}</button>
                  )
                );
              })()}
              <button
                className="rounded border border-[rgba(96,165,250,0.18)] px-3 py-2 disabled:opacity-30"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >›</button>
            </div>
            <div className="relative">
              <button
                className={`${subtleButtonClass} px-3 py-2 text-[10px]`}
                onClick={() => setShowRowsMenu((v) => !v)}
              >{rowsPerPage} / page ⌄</button>
              {showRowsMenu && (
                <div className="absolute bottom-full right-0 mb-1 rounded border border-[rgba(96,165,250,0.18)] bg-black shadow-lg">
                  {[5, 10, 25].map((n) => (
                    <button
                      key={n}
                      className={`block w-full px-4 py-2 text-left text-[10px] hover:bg-[rgba(96,165,250,0.08)] ${n === rowsPerPage ? "text-[#2dd4bf]" : "text-[#8b95a3]"}`}
                      onClick={() => { setRowsPerPage(n); setCurrentPage(1); setShowRowsMenu(false); }}
                    >{n} / page</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`${panelClass} rounded-[7px] p-4`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Oracle Signals</h2>
                <span className="text-[#707b89]">⊙</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#707b89]">30D Trend</span>
            </div>
            {[
              ["◎", "Retrieval Match", "64%"],
              ["♧", "Self-Eval Confidence", "71%"],
              ["♧", "Source Freshness", "39%"],
              ["⌁", "Mentor Response SLA", "18h"],
              ["✥", "Citation Coverage", "58%"],
            ].map(([icon, label, value]) => (
              <div key={label} className="mb-3 grid grid-cols-[22px_1fr_115px_42px] items-center gap-2 text-[11px] sm:grid-cols-[22px_1fr_115px_42px_54px]">
                <span className="text-[#9ca3af]">{icon}</span>
                <span className="text-[#d1d5db]">{label}</span>
                <div className="h-[5px] rounded-full bg-[rgba(96,165,250,0.14)]">
                  <div className="h-[5px] rounded-full bg-[#2dd4bf]" style={{ width: value === "18h" ? "50%" : value }} />
                </div>
                <span className="text-right font-bold text-white">{value}</span>
                <svg viewBox="0 0 54 18" className="hidden h-4 w-[54px] sm:block" fill="none">
                  <path d="M0 11L5 8L10 13L15 4L20 10L25 6L30 13L35 5L40 10L45 4L54 8" stroke="#2dd4bf" strokeWidth="1.2" />
                </svg>
              </div>
            ))}
            <button className={`mt-2 w-full py-2 text-[10px] ${accentButtonClass}`}>VIEW SIGNAL DETAILS</button>
          </div>

          <div className={`${panelClass} rounded-[7px] p-4`}>
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.08em] text-white">Recommended Actions</h2>
            {[
              ["Update IndoRegulator_01 knowledge base", "Resolve 21 critical queries", "CRITICAL", "Unassigned"],
              ["Refresh MiCA regulatory sources", "Improve source freshness", "HIGH", "QuantAlpha_7"],
              ["Review proxy incident runbook", "Add recent attack patterns", "MEDIUM", "CyberSec_V2"],
              ["Expand cross-chain risk dataset", "Add new bridge exploit data", "LOW", "ChainIntel_3"],
            ].map(([title, detail, priority, owner]) => (
              <div key={title} className="mb-2 grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded border border-[rgba(96,165,250,0.1)] bg-[rgba(255,255,255,0.025)] px-3 py-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${priorityTone[priority]}`}>△</span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-white">{title}</p>
                  <p className="truncate text-[9px] text-[#707b89]">{detail}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded border px-2 py-0.5 text-[8px] font-bold ${priorityTone[priority]}`}>{priority}</span>
                  <p className="mt-1 text-[9px] text-[#707b89]">{owner}</p>
                </div>
              </div>
            ))}
            <button className={`mt-2 w-full py-2 text-[10px] ${accentButtonClass}`}>VIEW ALL ACTIONS (17) →</button>
          </div>

          <div className={`${panelClass} rounded-[7px] p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Recent Activity</h2>
              <button className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2dd4bf]">View all</button>
            </div>
            {[
              ["IndoRegulator_01 gap marked as In Review", "2h ago"],
              ["MiCA stablecoin sources refreshed", "4h ago"],
              ["CyberSec_V2 update published", "6h ago"],
              ["ChainIntel_3 assigned 3 new gaps", "8h ago"],
            ].map(([title, time]) => (
              <div key={title} className="mb-2 flex items-center justify-between gap-3 text-[10px]">
                <span className="truncate text-[#d1d5db]">⊙ {title}</span>
                <span className="shrink-0 text-[#707b89]">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

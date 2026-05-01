"use client";

import { useState } from "react";

const BG_PAGE = "#0b0d0f";
const BG_PANEL = "#0d1014";
const BG_CARD = "#111519";
const BORDER = "#1f2937";
const TEAL = "#2dd4bf";

const mentors = [
  {
    id: 1,
    name: "IndoRegulator_01",
    tag: "GOVTECH & COMPLIANCE",
    tagColor: TEAL,
    tagBg: "rgba(45,212,191,0.08)",
    tagBorder: "rgba(45,212,191,0.3)",
    knowledgeType: "Regulatory",
    gapCount: "12 Unresolved",
    gapColor: "#f87171",
    sharePrice: "1,240",
    confidenceScore: "98.4%",
    scoreColor: TEAL,
    avatar: "IR",
    avatarBg: "#6d28d9",
  },
  {
    id: 2,
    name: "QuantAlpha_7",
    tag: "DEFI ARBITRAGE",
    tagColor: "#60a5fa",
    tagBg: "rgba(96,165,250,0.08)",
    tagBorder: "rgba(96,165,250,0.3)",
    knowledgeType: "DeFi Strategy",
    gapCount: "3 Unresolved",
    gapColor: "#fbbf24",
    sharePrice: "3,890",
    confidenceScore: "82.1%",
    scoreColor: "#fbbf24",
    avatar: "QA",
    avatarBg: "#1d4ed8",
  },
  {
    id: 3,
    name: "CyberSec_V2",
    tag: "SMART CONTRACT AUDIT",
    tagColor: "#4ade80",
    tagBg: "rgba(74,222,128,0.08)",
    tagBorder: "rgba(74,222,128,0.3)",
    knowledgeType: "Security Auditing",
    gapCount: "0 Unresolved",
    gapColor: "#4ade80",
    sharePrice: "8,105",
    confidenceScore: "99.9%",
    scoreColor: TEAL,
    avatar: "CS",
    avatarBg: "#166534",
  },
];

const gapReports = [
  { id: 1, title: "EU MiCA Compliance V2", sub: "Regulatory • 42 Mentors Analyzing" },
  { id: 2, title: "L2 Rollup Security Exploits", sub: "CyberSec • 89 Mentors Analyzing" },
];

const topMentors = [
  { id: 1, name: "ZeroKn_Oracle", change: "+14.2% This Week", avatar: "ZO", avatarBg: "#3730a3" },
  { id: 2, name: "AlphaYield_Bot", change: "+9.5% This Week", avatar: "AY", avatarBg: "#6b21a8" },
];

const sidebarLinks = [
  { label: "MARKETPLACE", icon: "⊞" },
  { label: "MY MENTORS", icon: "⬡" },
  { label: "MY SHARES", icon: "◈" },
  { label: "GAP REPORTS", icon: "⚠" },
  { label: "EARNINGS", icon: "◎" },
  { label: "SECURITY LOGS", icon: "⛨" },
];

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("TRENDING");
  const [activeNav, setActiveNav] = useState("MARKETPLACE");
  const [activeSidebar, setActiveSidebar] = useState("MY MENTORS");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: BG_PAGE,
        color: "#d1d5db",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* ── Navbar ── */}
      <header
        style={{
          backgroundColor: BG_PANEL,
          borderBottom: `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 48,
          flexShrink: 0,
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "0.15em" }}>
            AI<span style={{ color: TEAL }}>MENTOR</span>.X
          </span>
          <nav style={{ display: "flex", gap: 20 }}>
            {["MARKETPLACE", "STAKING", "GOVERNANCE", "DOCS"].map((link) => (
              <button
                key={link}
                onClick={() => setActiveNav(link)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: activeNav === link ? TEAL : "#6b7280",
                  borderBottom: activeNav === link ? `2px solid ${TEAL}` : "2px solid transparent",
                  paddingBottom: 2,
                  fontFamily: "inherit",
                  transition: "color 0.15s",
                }}
              >
                {link}
              </button>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#141a1f",
              border: `1px solid #374151`,
              borderRadius: 4,
              padding: "6px 10px",
            }}
          >
            <svg width="12" height="12" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search mentors..."
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: "#9ca3af",
                fontSize: 11,
                fontFamily: "inherit",
                width: 130,
              }}
            />
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: TEAL,
              color: "#000",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              padding: "7px 14px",
              borderRadius: 4,
              fontFamily: "inherit",
            }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            CONNECT WALLET
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <aside
          style={{
            width: 200,
            flexShrink: 0,
            backgroundColor: BG_PANEL,
            borderRight: `1px solid ${BORDER}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "16px 0",
          }}
        >
          <div>
            {/* User */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px 12px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "rgba(45,212,191,0.15)",
                  border: `1px solid rgba(45,212,191,0.4)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: TEAL }} />
              </div>
              <div>
                <p style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>NODE_01</p>
                <p style={{ color: "#4b5563", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>LIVE_DATING_ENCLAVE</p>
              </div>
            </div>
            <div style={{ height: 1, backgroundColor: BORDER, margin: "0 16px 12px" }} />

            {/* Nav Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 8px" }}>
              {sidebarLinks.map((link) => {
                const isActive = activeSidebar === link.label;
                return (
                  <button
                    key={link.label}
                    onClick={() => setActiveSidebar(link.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 4,
                      border: isActive ? `1px solid rgba(45,212,191,0.25)` : "1px solid transparent",
                      backgroundColor: isActive ? "rgba(45,212,191,0.08)" : "transparent",
                      color: isActive ? TEAL : "#6b7280",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{link.icon}</span>
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom */}
          <div style={{ padding: "0 12px" }}>
            <button
              style={{
                width: "100%",
                border: `1px solid rgba(45,212,191,0.5)`,
                backgroundColor: "transparent",
                color: TEAL,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.12em",
                padding: "10px 0",
                borderRadius: 4,
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: 12,
              }}
            >
              MINT NEW MENTOR
            </button>
            <div style={{ height: 1, backgroundColor: BORDER, marginBottom: 10 }} />
            {["SUPPORT", "SYSTEM STATUS"].map((item) => (
              <button
                key={item}
                style={{
                  display: "block",
                  width: "100%",
                  background: "none",
                  border: "none",
                  color: "#4b5563",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  padding: "4px 4px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                {item === "SUPPORT" ? "? " : "↯ "}{item}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>

          {/* Page Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.02em" }}>
                Marketplace Explorer
              </h1>
              <p style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.6, maxWidth: 360 }}>
                Discover, analyze, and stake in elite AI mentors across specialized knowledge sectors. Secure enclave execution guaranteed.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {["TRENDING", "HIGHEST YIELD"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      padding: "6px 12px",
                      borderRadius: 4,
                      border: activeFilter === f ? `1px solid rgba(45,212,191,0.6)` : `1px solid ${BORDER}`,
                      backgroundColor: activeFilter === f ? "rgba(45,212,191,0.08)" : "transparent",
                      color: activeFilter === f ? TEAL : "#6b7280",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {f === "TRENDING" && "↑ "}{f}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActiveFilter("NEW KNOWLEDGE")}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: activeFilter === "NEW KNOWLEDGE" ? `1px solid rgba(45,212,191,0.6)` : `1px solid ${BORDER}`,
                  backgroundColor: activeFilter === "NEW KNOWLEDGE" ? "rgba(45,212,191,0.08)" : "transparent",
                  color: activeFilter === "NEW KNOWLEDGE" ? TEAL : "#6b7280",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                NEW KNOWLEDGE
              </button>
            </div>
          </div>

          {/* Mentor Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
            {mentors.map((m) => (
              <div
                key={m.id}
                style={{
                  backgroundColor: BG_CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      backgroundColor: m.avatarBg,
                      border: `1px solid ${BORDER}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {m.avatar}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{m.name}</span>
                      <span style={{ color: TEAL, fontSize: 11 }}>✓</span>
                    </div>
                    <span
                      style={{
                        color: m.tagColor,
                        backgroundColor: m.tagBg,
                        border: `1px solid ${m.tagBorder}`,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        padding: "2px 6px",
                        borderRadius: 3,
                      }}
                    >
                      {m.tag}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px", marginBottom: 14 }}>
                  {[
                    { label: "KNOWLEDGE TYPE", value: m.knowledgeType, color: "#d1d5db" },
                    { label: "GAP COUNT", value: m.gapCount, color: m.gapColor },
                    { label: "SHARE PRICE", value: `${m.sharePrice} 0G`, color: "#d1d5db" },
                    { label: "CONFIDENCE SCORE", value: m.confidenceScore, color: m.scoreColor },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p style={{ color: "#4b5563", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                        {stat.label}
                      </p>
                      <p style={{ color: stat.color, fontSize: 11, fontWeight: 700 }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <button
                    style={{
                      flex: 1,
                      border: `1px solid #374151`,
                      backgroundColor: "transparent",
                      color: "#9ca3af",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      padding: "8px 0",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    ASK MENTOR
                  </button>
                  <button
                    style={{
                      flex: 1,
                      border: `1px solid rgba(45,212,191,0.5)`,
                      backgroundColor: "rgba(45,212,191,0.08)",
                      color: TEAL,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      padding: "8px 0",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    BUY ACCESS
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Panels */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Trending Gap Reports */}
            <div
              style={{
                backgroundColor: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ color: "#6b7280" }}>⊞</span>
                <h2 style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>Trending Gap Reports</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {gapReports.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <p style={{ color: "#e5e7eb", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{r.title}</p>
                      <p style={{ color: "#4b5563", fontSize: 10 }}>{r.sub}</p>
                    </div>
                    <button
                      style={{
                        flexShrink: 0,
                        border: `1px solid #374151`,
                        backgroundColor: "transparent",
                        color: "#9ca3af",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        padding: "6px 10px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      VIEW REPORT
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Mentors */}
            <div
              style={{
                backgroundColor: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ color: "#6b7280" }}>⬡</span>
                <h2 style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>Top Performing Mentors</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {topMentors.map((m) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 4,
                          backgroundColor: m.avatarBg,
                          border: `1px solid ${BORDER}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {m.avatar}
                      </div>
                      <div>
                        <p style={{ color: "#e5e7eb", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{m.name}</p>
                        <p style={{ color: TEAL, fontSize: 10, fontWeight: 600 }}>{m.change}</p>
                      </div>
                    </div>
                    <button
                      style={{
                        flexShrink: 0,
                        border: `1px solid rgba(45,212,191,0.5)`,
                        backgroundColor: "rgba(45,212,191,0.08)",
                        color: TEAL,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        padding: "6px 10px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      BUY SHARES
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${BORDER}`,
          backgroundColor: BG_PANEL,
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <p style={{ color: "#374151", fontSize: 9, letterSpacing: "0.1em" }}>
          © 2024 AIMENTOR.X. POWERED BY 0G_PROTOCOL.
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {["0G HACKATHON", "DOCUMENTATION", "SECURITY AUDIT", "GITHUB"].map((link) => (
            <button
              key={link}
              style={{
                background: "none",
                border: "none",
                color: "#4b5563",
                fontSize: 9,
                letterSpacing: "0.1em",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {link}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

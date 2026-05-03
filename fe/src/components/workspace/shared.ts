export type PageKind = "mentors" | "shares" | "gaps" | "earnings" | "security";

export const panelClass =
  "border border-[rgba(96,165,250,0.24)] bg-[rgba(5,12,15,0.78)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_26px_rgba(45,212,191,0.06)]";
export const subtleButtonClass =
  "cursor-pointer rounded border border-[rgba(96,165,250,0.28)] bg-[rgba(5,12,15,0.58)] font-mono font-bold tracking-[0.1em] text-[#8f9cac]";
export const accentButtonClass =
  "cursor-pointer rounded border border-[rgba(45,212,191,0.62)] bg-[rgba(45,212,191,0.08)] font-mono font-bold tracking-[0.1em] text-[#2dd4bf] shadow-[0_0_16px_rgba(45,212,191,0.08)]";
export const solidAccentBtn =
  "cursor-pointer rounded bg-[linear-gradient(90deg,#2dd4bf,#22d3ee)] font-mono font-bold tracking-[0.14em] text-[#021011] shadow-[0_0_22px_rgba(45,212,191,0.26)]";

export const pageCopy = {
  mentors: {
    title: "Mentor Studio",
    description:
      "Draft, package, and maintain private expert playbooks before the 0G Storage and TEE integration is connected.",
    eyebrow: "EXPERT WORKSPACE",
  },
  shares: {
    title: "My Access Shares",
    description:
      "Track your curator stakes, earnings, and performance across AI Mentors. Monitor rewards, yield, and portfolio growth in real time.",
    eyebrow: "CURATOR PORTFOLIO",
  },
  gaps: {
    title: "Gap Reports",
    description:
      "Identify blind spots and low-confidence answers from mentors to prioritize knowledge updates and improve answer quality.",
    eyebrow: "CONFIDENCE ORACLE",
  },
  earnings: {
    title: "Earnings",
    description:
      "Royalty, curator rewards, vesting, and platform fees across your mentors and packages.",
    eyebrow: "REVENUE FLOW",
  },
  security: {
    title: "Security Logs",
    description:
      "Track encrypted storage, enclave inference, access checks, TEE attestations, and e-sign audit references across the network.",
    eyebrow: "TEE AUDIT TRAIL",
  },
} satisfies Record<PageKind, { title: string; description: string; eyebrow: string }>;

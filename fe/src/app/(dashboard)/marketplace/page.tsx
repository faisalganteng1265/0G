"use client";

import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  ClipboardList,
  Crosshair,
  FileText,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  Snowflake,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  Waves,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAccount, usePublicClient, useSendTransaction, useSignMessage } from "wagmi";

import { api, type TxPayload } from "@/lib/api";
import { zeroGMainnet } from "@/lib/chains";
import { formatOg, useGapEvents, useMarketQuote, useMentors, useShareBalance, type MentorMeta } from "@/hooks/useMarketplace";

const mentorImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDmEXNoAf-cmrKUiwhuPOpaf-1mlPbR4cehM2rReUiOo2pR5YTe2Y_fOieBJYQw_jjpObE2rUSUeNDpZXLLkfqIKq9eDx6Fq3naaIJ6NOUdh6TvXdSpR1mBGR9lbNuKz4l-ipSme9cTTlN69LdjblpvS-GdoEpVRO9MKyUXZf-pgQ2gP1ewqG9FgLo7t-LG4nmGXSCJbKBwUhTzVhejUHG9tF_1qCcdCRUc30KxL-C4qKOU2qD6qXSfUOcieWVkEwOxSK5b6CoRPc0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwHax8-ONwCEu5RCRFNZaHEf3vFl3ZmHbQAdSZaM4Elv2YyMCoTOc0FZznxMitJ7LYmW39c3plK3Z8ehgMMV-ZK1-gKG21Qvd88ybTMVAgcJNZ61EUyP1Rzts6Af1PoKNP3L2pCYv1dXU_CpwzBY0H7T9WSL1UOwc4J795T3fNLfTee_C1ACovI8R5NBnWJ869DYe0pPkbhyIkST18eVEFU5SXJdxPbakmqDidBwNJorTZNOftAcjn4GlJ0zGc6U-ZcNNl5BltlBc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC9hN7Aj8iDuVpi80ZyqSXqOofwILzZ4vWR6r2Y1XFYDb6v14RKB-NGZ5izd5lCKWGoar_4i3PibYHZLmzvVDY5LelKLD7jM6NeqaDjfgfhOI8VRi-jrRGoObVKf8cv5Si0_PsEY8lSLEbEDuv2KEv80bgXjfwtE2mQAlU5ajHb9cVgXzWmZxVZvVihmZvKMnoIQ2o2zRWPxOtGCVWFGG7jVV8F3crN16L8knqQs6E4GSUZFjjtjw9BMfJux0V3dGc26QWq8xOodc",
] as const;

const filterOptions = [
  { label: "TRENDING", icon: TrendingUp },
  { label: "HIGHEST YIELD", icon: Wallet },
  { label: "NEW KNOWLEDGE", icon: Snowflake },
];

const subtleButtonClass =
  "cursor-pointer rounded border border-[#374151] bg-transparent font-mono font-bold tracking-[0.1em] text-[#9ca3af]";
const accentButtonClass =
  "cursor-pointer rounded border border-[rgba(45,212,191,0.5)] bg-[rgba(45,212,191,0.08)] font-mono font-bold tracking-[0.1em] text-[#2dd4bf]";
const badgeToneClasses = {
  regulatory: "border-[rgba(74,222,128,0.36)] bg-[rgba(74,222,128,0.09)] text-[#4ade80]",
  defi: "border-[rgba(129,140,248,0.38)] bg-[rgba(129,140,248,0.1)] text-[#a5b4fc]",
  security: "border-[rgba(251,191,36,0.38)] bg-[rgba(251,191,36,0.1)] text-[#fbbf24]",
} satisfies Record<string, string>;

const cardToneClasses = {
  regulatory:
    "border-[rgba(74,222,128,0.38)] bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.16),transparent_34%),linear-gradient(180deg,rgba(8,18,12,0.98),rgba(7,10,12,0.96))] shadow-[0_0_30px_rgba(74,222,128,0.1)]",
  defi:
    "border-[rgba(59,130,246,0.34)] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_34%),linear-gradient(180deg,rgba(8,14,22,0.98),rgba(7,10,12,0.96))] shadow-[0_0_30px_rgba(59,130,246,0.1)]",
  security:
    "border-[rgba(251,191,36,0.36)] bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_34%),linear-gradient(180deg,rgba(20,15,7,0.98),rgba(7,10,12,0.96))] shadow-[0_0_30px_rgba(251,191,36,0.11)]",
} satisfies Record<string, string>;

const toneTextClasses = {
  regulatory: "text-[#4ade80]",
  defi: "text-[#60a5fa]",
  security: "text-[#fbbf24]",
} satisfies Record<string, string>;

const toneProgressClasses = {
  regulatory: "bg-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.65)]",
  defi: "bg-[#60a5fa] shadow-[0_0_10px_rgba(96,165,250,0.65)]",
  security: "bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.65)]",
} satisfies Record<string, string>;

const buyAccessToneClasses = {
  regulatory:
    "border-[#4ade80] bg-[#4ade80] text-[#041508] shadow-[0_0_18px_rgba(74,222,128,0.2)]",
  defi:
    "border-[#818cf8] bg-[#818cf8] text-[#090b1f] shadow-[0_0_18px_rgba(129,140,248,0.22)]",
  security:
    "border-[#fbbf24] bg-[#fbbf24] text-[#1c1202] shadow-[0_0_18px_rgba(251,191,36,0.22)]",
} satisfies Record<string, string>;

const statusClasses = {
  HIGH: "border-[rgba(45,212,191,0.45)] bg-[rgba(45,212,191,0.1)] text-[#2dd4bf]",
  HOT: "border-[rgba(251,191,36,0.45)] bg-[rgba(251,191,36,0.12)] text-[#fbbf24]",
  RISING: "border-[rgba(96,165,250,0.45)] bg-[rgba(96,165,250,0.1)] text-[#60a5fa]",
} satisfies Record<string, string>;

function Sparkline({ tone = "teal" }: { tone?: "teal" | "blue" | "amber" }) {
  const stroke = tone === "amber" ? "#fbbf24" : tone === "blue" ? "#60a5fa" : "#2dd4bf";

  return (
    <svg className="h-8 w-20" fill="none" viewBox="0 0 80 32" aria-hidden="true">
      <path
        d="M2 22 C10 8 18 8 26 18 S42 28 50 14 S66 4 78 10"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M2 30 L2 22 C10 8 18 8 26 18 S42 28 50 14 S66 4 78 10 L78 30 Z"
        fill={stroke}
        opacity="0.08"
      />
    </svg>
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function useTxPayloadSender() {
  const publicClient = usePublicClient({ chainId: zeroGMainnet.id });
  const { sendTransactionAsync } = useSendTransaction();

  return async (tx: TxPayload) => {
    const hash = await sendTransactionAsync({
      chainId: zeroGMainnet.id,
      to: tx.to,
      data: tx.data,
      value: BigInt(tx.value),
    });
    if (!publicClient) return hash;

    try {
      await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
        timeout: 120_000,
      });
    } catch (err) {
      for (let attempt = 0; attempt < 12; attempt += 1) {
        await wait(2_500);
        try {
          await publicClient.getTransactionReceipt({ hash });
          return hash;
        } catch {
          // Some 0G RPC nodes lag receipt indexing immediately after broadcast.
        }
      }
      throw err;
    }
    return hash;
  };
}

function BuySharesButton({
  children,
  className,
  tokenId,
}: {
  children: ReactNode;
  className: string;
  tokenId?: number;
}) {
  const sendPayload = useTxPayloadSender();
  const [busy, setBusy] = useState(false);

  async function buyShares() {
    if (tokenId === undefined) return;
    setBusy(true);
    try {
      const result = await api.buildBuySharesTx({ tokenId, amount: 1 });
      await sendPayload(result.tx);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className={className} disabled={busy || tokenId === undefined} onClick={buyShares} type="button">
      {busy ? "PENDING..." : children}
    </button>
  );
}

function MentorCard({ mentor, index }: { mentor: DisplayMentor; index: number }) {
  const { address } = useAccount();
  const sendPayload = useTxPayloadSender();
  const quote = useMarketQuote(mentor.tokenId, 1);
  const shareBalance = useShareBalance(mentor.tokenId, address);
  const [busy, setBusy] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const ownedShares = Number(shareBalance.data ?? 0);
  const canAskMentor = mentor.tokenId !== undefined && ownedShares > 0;

  async function buyAccess() {
    if (mentor.tokenId === undefined) return;
    setBusy("buy");
    try {
      const result = await api.buildBuySharesTx({ tokenId: mentor.tokenId, amount: 1 });
      await sendPayload(result.tx);
    } finally {
      setBusy(null);
    }
  }

  const sharePrice = quote.data?.sharePriceWei ? formatOg(quote.data.sharePriceWei) : `${mentor.sharePrice} 0G`;

  return (
    <>
      <div
        className={`relative flex min-h-[286px] flex-col overflow-hidden rounded-lg border p-5 ${cardToneClasses[mentor.tone]}`}
      >
        <div className={`absolute right-0 top-0 rounded-bl-2xl border-b border-l border-current/25 px-4 py-2 text-[10px] font-extrabold tracking-[0.14em] ${toneTextClasses[mentor.tone]}`}>
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="mb-4 flex items-start gap-4 pr-8">
          <div
            aria-label={`${mentor.name} avatar`}
            className={`h-16 w-16 shrink-0 rounded-md border bg-[#101215] bg-cover bg-center ${mentor.tone === "security" ? "border-[rgba(251,191,36,0.34)]" : mentor.tone === "defi" ? "border-[rgba(96,165,250,0.34)]" : "border-[rgba(74,222,128,0.34)]"}`}
            role="img"
            style={{ backgroundImage: `url(${mentor.image})` }}
          />
          <div className="min-w-0 pt-1">
            <div className="mb-2 flex min-w-0 items-center gap-1.5">
              <span className="truncate text-[13px] font-bold text-white">{mentor.name}</span>
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2dd4bf]" aria-hidden="true" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`rounded-[3px] border px-2 py-1 text-[9px] font-bold tracking-[0.1em] ${badgeToneClasses[mentor.tone]}`}>
                {mentor.tag}
              </span>
              <span className="rounded-[3px] border border-[#343840] bg-[#101215] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.1em] text-[#9ca3af]">
                {mentor.signal}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-x-7 gap-y-4 border-b border-[#1f2937]/70 pb-4">
          {[
            { label: "KNOWLEDGE TYPE", value: mentor.knowledgeType, className: "text-[#d1d5db]" },
            { label: "GAP COUNT", value: mentor.gapCount, className: toneTextClasses[mentor.tone] },
            { label: "SHARE PRICE", value: sharePrice, className: "text-[#d1d5db]" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="mb-1 text-[9px] uppercase tracking-[0.12em] text-[#4b5563]">
                {stat.label}
              </p>
              <p className={`text-[11px] font-bold ${stat.className}`}>{stat.value}</p>
            </div>
          ))}
          <div>
            <p className="mb-1 text-[9px] uppercase tracking-[0.12em] text-[#4b5563]">
              CONFIDENCE SCORE
            </p>
            <p className={`mb-2 text-[11px] font-bold ${toneTextClasses[mentor.tone]}`}>
              {mentor.confidenceScore}
            </p>
            <div className="h-1.5 rounded-full border border-[#26313a] bg-[#07090b]">
              <div
                className={`h-full rounded-full ${toneProgressClasses[mentor.tone]}`}
                style={{ width: mentor.confidenceScore }}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <button
            className={`flex-1 px-0 py-2 text-[10px] ${subtleButtonClass} disabled:cursor-not-allowed disabled:opacity-45`}
            disabled={!canAskMentor}
            onClick={() => setIsChatOpen(true)}
            title={canAskMentor ? "Ask this mentor" : "Buy shares before asking this mentor"}
            type="button"
          >
            <MessageSquare className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
            {address ? "ASK MENTOR" : "CONNECT FIRST"}
          </button>
          <button className={`flex-1 cursor-pointer rounded border px-0 py-2 font-mono text-[10px] font-extrabold tracking-[0.1em] ${buyAccessToneClasses[mentor.tone]}`} disabled={busy === "buy" || mentor.tokenId === undefined} onClick={buyAccess} type="button">
            <Lock className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
            {busy === "buy" ? "PENDING..." : "BUY SHARES"}
          </button>
        </div>
      </div>

      {isChatOpen && canAskMentor && <MentorChatModal mentor={mentor} onClose={() => setIsChatOpen(false)} />}
    </>
  );
}

type ChatMessage = {
  role: "user" | "assistant" | "system";
  text: string;
  meta?: string;
};

type MarkdownBlock =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language?: string }
  | { type: "heading"; content: string; level: 1 | 2 | 3 }
  | { type: "quote"; content: string }
  | { type: "list"; ordered: boolean; items: string[] };

function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const lines = text.split("\n");
  const blocks: MarkdownBlock[] = [];
  let textLines: string[] = [];
  let codeLines: string[] = [];
  let fence: "```" | "'''" | null = null;
  let language: string | undefined;

  function flushText() {
    if (textLines.length === 0) return;
    blocks.push({ type: "text", content: textLines.join("\n") });
    textLines = [];
  }

  function parseList(startIndex: number, ordered: boolean) {
    const items: string[] = [];
    let cursor = startIndex;
    const marker = ordered ? /^\s*\d+\.\s+(.+)$/ : /^\s*[-*]\s+(.+)$/;

    while (cursor < lines.length) {
      const itemMatch = lines[cursor].match(marker);
      if (!itemMatch) break;
      items.push(itemMatch[1]);
      cursor += 1;
    }

    blocks.push({ type: "list", ordered, items });
    return cursor - 1;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const startsBacktickFence = trimmed.startsWith("```");
    const startsApostropheFence = trimmed.startsWith("'''");

    if (fence) {
      if (trimmed.startsWith(fence)) {
        blocks.push({ type: "code", content: codeLines.join("\n"), language });
        codeLines = [];
        fence = null;
        language = undefined;
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (startsBacktickFence || startsApostropheFence) {
      flushText();
      fence = startsBacktickFence ? "```" : "'''";
      language = trimmed.slice(3).trim().split(/\s+/)[0] || undefined;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushText();
      blocks.push({
        type: "heading",
        content: headingMatch[2],
        level: headingMatch[1].length as 1 | 2 | 3,
      });
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushText();
      blocks.push({ type: "quote", content: trimmed.replace(/^>\s?/, "") });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      flushText();
      index = parseList(index, false);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      flushText();
      index = parseList(index, true);
      continue;
    }

    textLines.push(line);
  }

  if (fence) {
    blocks.push({ type: "code", content: codeLines.join("\n"), language });
  }
  flushText();

  return blocks;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    const token = match[0];
    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const href = linkMatch[2].trim();
      const isSafeHref = /^(https?:|mailto:)/i.test(href);
      nodes.push(
        isSafeHref ? (
          <a key={`link-${match.index}`} className="font-bold text-[#67e8f9] underline decoration-[#2dd4bf]/45 underline-offset-4" href={href} rel="noreferrer" target="_blank">
            {linkMatch[1]}
          </a>
        ) : (
          linkMatch[1]
        )
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`bold-${match.index}`} className="font-extrabold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={`inline-code-${match.index}`} className="rounded border border-[#26333d] bg-[#0d1114] px-1.5 py-0.5 text-[0.92em] text-[#67e8f9]">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(
        <em key={`italic-${match.index}`} className="italic text-[#cbd5e1]">
          {token.slice(1, -1)}
        </em>
      );
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function MarkdownMessage({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {parseMarkdownBlocks(text).map((block, blockIndex) => {
        if (block.type === "code") {
          return (
            <div key={`code-${blockIndex}`} className="overflow-hidden rounded border border-[rgba(45,212,191,0.2)] bg-[#06090b]">
              {block.language && (
                <div className="border-b border-[#1f2937] bg-[#0b1115] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#2dd4bf]">
                  {block.language}
                </div>
              )}
              <pre className="overflow-x-auto p-3 text-[11px] leading-[1.7] text-[#d1d5db]">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        if (block.type === "heading") {
          const headingClass =
            block.level === 1
              ? "text-base"
              : block.level === 2
                ? "text-sm"
                : "text-xs";

          return (
            <p key={`heading-${blockIndex}`} className={`${headingClass} font-extrabold leading-tight text-white`}>
              {renderInlineMarkdown(block.content)}
            </p>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={`quote-${blockIndex}`} className="border-l-2 border-[#2dd4bf] bg-[#0b1115] px-3 py-2 text-[#cbd5e1]">
              {renderInlineMarkdown(block.content)}
            </blockquote>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={`list-${blockIndex}`} className={`space-y-1 ${block.ordered ? "list-decimal" : "list-disc"} pl-5`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ListTag>
          );
        }

        return block.content.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
          <p key={`text-${blockIndex}-${paragraphIndex}`} className="whitespace-pre-wrap">
            {renderInlineMarkdown(paragraph)}
          </p>
        ));
      })}
    </div>
  );
}

function MentorChatModal({ mentor, onClose }: { mentor: DisplayMentor; onClose: () => void }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const sendPayload = useTxPayloadSender();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      text: `Connected to ${mentor.name}. Each answer is settled on-chain before BE runs the TEE query.`,
    },
  ]);
  const [busy, setBusy] = useState(false);

  async function submitQuestion() {
    if (!question.trim() || mentor.tokenId === undefined || !address) return;
    const currentQuestion = question.trim();
    setQuestion("");
    setBusy(true);
    setMessages((current) => [...current, { role: "user", text: currentQuestion }]);

    try {
      const message = await api.getQueryMessage({
        tokenId: mentor.tokenId,
        question: currentQuestion,
        userAddress: address,
      });
      const signature = await signMessageAsync({ message: message.message });
      const settlement = await api.buildExecuteQueryTx({ tokenId: mentor.tokenId });
      const settlementTxHash = await sendPayload(settlement.tx);
      const answer = await api.sendQuery({
        tokenId: mentor.tokenId,
        question: currentQuestion,
        userAddress: address,
        signature,
        signedAt: message.signedAt,
        settlementTxHash,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: answer.answer,
          meta: `${answer.teeVerified ? "TEE VERIFIED" : "TEE UNVERIFIED"} / confidence ${answer.oracle.confidenceUpdated}%`,
        },
      ]);
    } catch (err) {
      setMessages((current) => [
        ...current,
        {
          role: "system",
          text: err instanceof Error ? err.message : String(err),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex h-[min(720px,calc(100vh-48px))] w-full max-w-[860px] flex-col overflow-hidden rounded-lg border border-[rgba(45,212,191,0.32)] bg-[#050607] shadow-[0_0_42px_rgba(45,212,191,0.12)]">
        <div className="flex items-center justify-between border-b border-[#1f2937] bg-black px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`h-11 w-11 shrink-0 rounded border bg-[#101215] bg-cover bg-center ${mentor.tone === "security" ? "border-[rgba(251,191,36,0.34)]" : mentor.tone === "defi" ? "border-[rgba(96,165,250,0.34)]" : "border-[rgba(74,222,128,0.34)]"}`}
              style={{ backgroundImage: `url(${mentor.image})` }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{mentor.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2dd4bf]">
                Mentor #{mentor.tokenId} / {mentor.tag}
              </p>
            </div>
          </div>
          <button className="rounded border border-[#374151] p-2 text-[#9ca3af] hover:text-white" onClick={onClose} type="button">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_220px]">
          <div className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[82%] rounded border px-3 py-2 text-xs leading-[1.65] ${
                    message.role === "user"
                      ? "ml-auto border-[rgba(45,212,191,0.35)] bg-[rgba(45,212,191,0.1)] text-white"
                      : message.role === "assistant"
                        ? "border-[rgba(96,165,250,0.18)] bg-black text-[#d1d5db]"
                        : "mx-auto border-[#374151] bg-[#0d1114] text-[#8b95a3]"
                  }`}
                >
                  <MarkdownMessage text={message.text} />
                  {message.meta && (
                    <p className="mt-2 border-t border-[#1f2937] pt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2dd4bf]">
                      {message.meta}
                    </p>
                  )}
                </div>
              ))}
              {busy && (
                <div className="flex w-fit items-center gap-2 rounded border border-[rgba(96,165,250,0.18)] bg-black px-3 py-2 text-xs font-bold text-[#d1d5db]">
                  <span>Thinking</span>
                  <span className="flex items-end gap-1" aria-hidden="true">
                    <span className="thinking-dot thinking-dot-one" />
                    <span className="thinking-dot thinking-dot-two" />
                    <span className="thinking-dot thinking-dot-three" />
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-[#1f2937] bg-black p-3">
              <div className="grid grid-cols-[1fr_44px] gap-2">
                <textarea
                  className="max-h-28 min-h-12 resize-none rounded border border-[#26333d] bg-[#050607] px-3 py-2 text-xs leading-[1.5] text-white outline-none placeholder:text-[#586474]"
                  placeholder={address ? "Ask a tactical question..." : "Connect wallet to ask this mentor"}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submitQuestion();
                    }
                  }}
                />
                <button
                  className="flex h-12 items-center justify-center rounded border border-[rgba(45,212,191,0.6)] bg-[rgba(45,212,191,0.12)] text-[#2dd4bf] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!address || !question.trim() || busy}
                  onClick={submitQuestion}
                  type="button"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <aside className="hidden border-l border-[#1f2937] bg-black p-4 md:block">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#586474]">Session</p>
            <div className="space-y-3 text-[10px]">
              <div className="rounded border border-[#26333d] bg-[#050607] p-3">
                <p className="text-[#586474]">Access</p>
                <p className="mt-1 font-bold text-[#2dd4bf]">Wallet gated</p>
              </div>
              <div className="rounded border border-[#26333d] bg-[#050607] p-3">
                <p className="text-[#586474]">Settlement</p>
                <p className="mt-1 font-bold text-white">executeQuery</p>
              </div>
              <div className="rounded border border-[#26333d] bg-[#050607] p-3">
                <p className="text-[#586474]">Confidence</p>
                <p className="mt-1 font-bold text-white">{mentor.confidenceScore}</p>
              </div>
              <div className="rounded border border-[#26333d] bg-[#050607] p-3">
                <p className="text-[#586474]">Gap Count</p>
                <p className="mt-1 font-bold text-white">{mentor.gapCount}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

type MentorTone = keyof typeof cardToneClasses;
type DisplayMentor = {
  id: number;
  tokenId?: number;
  name: string;
  tag: string;
  knowledgeType: string;
  gapCount: string;
  sharePrice: string;
  confidenceScore: string;
  tone: MentorTone;
  signal: string;
  image: string;
};

const toneCycle: MentorTone[] = ["regulatory", "defi", "security"];

function toDisplayMentor(mentor: MentorMeta, index: number): DisplayMentor {
  const tone = toneCycle[index % toneCycle.length];
  return {
    id: mentor.tokenId,
    tokenId: mentor.tokenId,
    name: mentor.name,
    tag: mentor.category.toUpperCase(),
    knowledgeType: mentor.category,
    gapCount: `${mentor.gapCount} Unresolved`,
    sharePrice: "-",
    confidenceScore: `${mentor.confidenceScore}%`,
    tone,
    signal: mentor.status === 2 ? "VERIFIED" : "DRAFT",
    image: mentorImages[index % mentorImages.length],
  };
}

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("TRENDING");
  const { data: onchainMentors = [] } = useMentors();
  const { data: gapEvents = [] } = useGapEvents();
  const displayMentors = onchainMentors.map(toDisplayMentor);
  const topDisplayMentors: Array<DisplayMentor & { change: string }> =
    displayMentors.slice(0, 3).map((mentor) => ({ ...mentor, change: "+0.0% This Week" }));
  const liveStats = [
    { label: "ACTIVE MENTORS", value: String(onchainMentors.length), sub: "on-chain", icon: Users, tone: "text-[#2dd4bf]" },
    {
      label: "TOTAL QUERIES",
      value: String(onchainMentors.reduce((sum, mentor) => sum + mentor.totalQueries, 0)),
      sub: "recorded",
      icon: Lock,
      tone: "text-[#2dd4bf]",
    },
    {
      label: "AVG. CONFIDENCE",
      value: onchainMentors.length > 0
        ? `${Math.round(onchainMentors.reduce((sum, mentor) => sum + mentor.confidenceScore, 0) / onchainMentors.length)}%`
        : "—",
      sub: "oracle score",
      icon: Waves,
      tone: "text-[#2dd4bf]",
    },
    {
      label: "GAP OPPORTUNITIES",
      value: String(onchainMentors.reduce((sum, mentor) => sum + mentor.gapCount, 0)),
      sub: "unresolved",
      icon: Crosshair,
      tone: "text-[#fbbf24]",
    },
  ];

  return (
    <>
          <div className="mb-5">
            <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between xl:gap-6">
              <div className="xl:max-w-[610px] xl:shrink-0">
                <h1 className="mb-2 text-2xl font-bold text-white">Marketplace Explorer</h1>
                <p className="text-xs leading-[1.65] text-[#8b929d]">
                  Discover, analyze, and stake in elite AI mentors across specialized knowledge sectors.
                  Secure enclave execution guaranteed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:flex-1 xl:grid-cols-4">
                {liveStats.map((stat) => {
                  const StatIcon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="flex min-h-[76px] items-center gap-3 rounded border border-[#25313a] bg-black px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    >
                      <StatIcon className={`h-5 w-5 shrink-0 ${stat.tone}`} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.13em] text-[#6b7280]">
                          {stat.label}
                        </p>
                        <p className="text-lg font-extrabold leading-none text-white">{stat.value}</p>
                        <p className={`mt-1 text-[10px] font-bold ${stat.tone}`}>{stat.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => {
                const FilterIcon = filter.icon;
                const isActive = activeFilter === filter.label;

                return (
                  <button
                    key={filter.label}
                    onClick={() => setActiveFilter(filter.label)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded border px-3 py-2 font-mono text-[10px] font-bold tracking-[0.1em] transition-colors sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.12em] ${
                      isActive
                        ? "border-[rgba(45,212,191,0.7)] bg-[rgba(45,212,191,0.1)] text-[#2dd4bf] shadow-[0_0_16px_rgba(45,212,191,0.1)]"
                        : "border-[#1f2937] bg-black text-[#8b929d]"
                    }`}
                  >
                    <FilterIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {displayMentors.length === 0 ? (
              <div className="col-span-3 flex items-center justify-center rounded-lg border border-[#1f2937] bg-black py-16 text-[12px] font-mono text-[#586474]">
                No mentors registered on-chain yet. Be the first — go to My Mentors.
              </div>
            ) : displayMentors.map((mentor, index) => (
              <MentorCard key={mentor.id} mentor={mentor} index={index} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-[rgba(45,212,191,0.22)] bg-black px-4 py-3 shadow-[inset_0_1px_0_rgba(45,212,191,0.08),0_0_28px_rgba(45,212,191,0.07)]">
              <div className="mb-2.5 flex items-center justify-between gap-4 border-b border-[#1a2630] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded border border-[rgba(45,212,191,0.35)] bg-[rgba(45,212,191,0.08)]">
                    <FileText className="h-3.5 w-3.5 text-[#2dd4bf]" aria-hidden="true" />
                  </span>
                  <h2 className="text-[13px] font-extrabold tracking-[0.08em] text-white">
                    TRENDING GAP REPORTS
                  </h2>
                </div>
                <button className="flex min-h-0 items-center gap-2 rounded border border-[rgba(45,212,191,0.34)] bg-[rgba(45,212,191,0.06)] px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.12em] text-[#2dd4bf]">
                  OPPORTUNITY QUEUE
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>

              <div className="overflow-x-auto">
              <div className="min-w-[520px]">
              <div className="grid grid-cols-[1.4fr_0.55fr_0.4fr_0.5fr_0.62fr_0.78fr] gap-3 border-b border-[#14212a] px-1 pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#5b6470]">
                <span>REPORT</span>
                <span>CATEGORY</span>
                <span>MENTORS</span>
                <span>STATUS</span>
                <span>OPPORTUNITY</span>
                <span />
              </div>

              <div>
                {gapEvents.length === 0 ? (
                  <div className="px-1 py-6 text-center text-[11px] text-[#4b5563]">No gap events detected on-chain yet.</div>
                ) : (
                  gapEvents.slice(0, 3).map((event) => (
                    <div key={event.txHash} className="grid grid-cols-[1.4fr_0.55fr_0.4fr_0.5fr_0.62fr_0.78fr] items-center gap-3 border-b border-[#14212a] px-1 py-2.5 text-[10px]">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[rgba(45,212,191,0.24)] bg-[rgba(45,212,191,0.07)] text-[#2dd4bf]">
                          <Crosshair className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span className="truncate font-bold text-[#e5e7eb]">
                          {event.type === "GapResolved" ? "Gap resolved" : "Blind spot detected"} — Mentor #{event.tokenId}
                        </span>
                      </div>
                      <span className="text-[#6b7280]">Oracle</span>
                      <span className="font-bold text-[#d1d5db]">{event.count}</span>
                      <span className={`w-fit rounded border px-2 py-1 text-[9px] font-bold tracking-[0.08em] ${event.type === "GapResolved" ? statusClasses.RISING : event.count > 10 ? statusClasses.HIGH : statusClasses.HOT}`}>
                        {event.type === "GapResolved" ? "RESOLVED" : event.count > 10 ? "HIGH" : "ACTIVE"}
                      </span>
                      <span className="font-extrabold text-[#2dd4bf]">Block {event.blockNumber.toString()}</span>
                      <button className="min-h-0 whitespace-nowrap rounded border border-[rgba(45,212,191,0.4)] bg-[rgba(45,212,191,0.06)] px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.1em] text-[#2dd4bf]">
                        VIEW REPORT
                      </button>
                    </div>
                  ))
                )}
              </div>
              </div>
              </div>

              <button className="mx-auto mt-2.5 flex min-h-0 items-center gap-2 border-0 bg-transparent font-mono text-[10px] font-bold tracking-[0.12em] text-[#9ca3af]">
                VIEW ALL REPORTS
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="rounded-lg border border-[#2a2d32] bg-black px-4 py-3 shadow-[0_0_28px_rgba(45,212,191,0.05)]">
              <div className="mb-2.5 flex items-center justify-between gap-4 border-b border-[#1f2937] pb-2.5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#2dd4bf]" aria-hidden="true" />
                  <h2 className="text-[13px] font-bold tracking-[0.05em] text-white">
                    TOP PERFORMING MENTORS
                  </h2>
                </div>
                <button className="flex items-center gap-2 rounded border border-[#27313a] bg-[#0d1114] px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.1em] text-[#9ca3af]">
                  THIS WEEK
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>

              <div className="overflow-x-auto">
              <div className="min-w-[380px]">
              <div className="grid grid-cols-[1.35fr_0.55fr_0.55fr_0.75fr] gap-3 border-b border-[#15202a] pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#5b6470]">
                <span>MENTOR</span>
                <span>WEEKLY GAIN</span>
                <span />
                <span />
              </div>

              <div>
                {topDisplayMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="grid grid-cols-[1.35fr_0.55fr_0.55fr_0.75fr] items-center gap-3 border-b border-[#15202a] py-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        aria-label={`${mentor.name} avatar`}
                        className="h-10 w-10 shrink-0 rounded border border-[#343840] bg-[#262a30] bg-cover bg-center"
                        role="img"
                        style={{ backgroundImage: `url(${mentor.image})` }}
                      />
                      <span className="truncate text-xs font-bold text-[#e5e7eb]">{mentor.name}</span>
                    </div>
                    <span className="font-extrabold text-[#2dd4bf]">{mentor.change.split(" ")[0]}</span>
                    <Sparkline tone="teal" />
                    <BuySharesButton className={`shrink-0 px-4 py-2 text-[10px] ${accentButtonClass}`} tokenId={mentor.tokenId}>
                      BUY SHARES
                    </BuySharesButton>
                  </div>
                ))}
              </div>
              </div>
              </div>

              <button className="mx-auto mt-2.5 flex items-center gap-2 border-0 bg-transparent font-mono text-[10px] font-bold tracking-[0.12em] text-[#9ca3af]">
                VIEW ALL MENTORS
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
    </>
  );
}

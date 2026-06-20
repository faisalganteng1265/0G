import { MemWal } from "@mysten-incubation/memwal";

let client: MemWal | null = null;
function getMemWal(): MemWal {
  if (!client) {
    client = MemWal.create({
      key: process.env.MEMWAL_DELEGATE_KEY ?? "",
      accountId: process.env.MEMWAL_ACCOUNT_ID ?? "",
      serverUrl: process.env.MEMWAL_RELAYER_URL ?? "https://relayer.memwal.ai",
    });
  }
  return client;
}

// One namespace per (mentor, querier) pair — isolates each user's
// conversation history from every other user's, and from the mentor's
// static knowledge base (which lives in Seal/Walrus directly, not here).
function namespaceFor(stateId: string, querier: string): string {
  return `tacit:${stateId}:${querier}`;
}

function asksAboutPastConversation(question: string): boolean {
  const normalized = question.toLowerCase();
  return [
    "sebelumnya",
    "kemarin",
    "pernah tanya",
    "pernah aku tanya",
    "apa aja yang aku tanya",
    "apa yang aku tanyakan",
    "obrolan kita",
    "percakapan kita",
    "history",
    "riwayat",
    "previous",
    "last time",
    "past conversation",
    "conversation history",
  ].some((phrase) => normalized.includes(phrase));
}

// Recall past exchanges between this querier and this mentor — this is what
// turns a one-shot knowledge lookup into an agent with real cross-session
// memory, durable and verifiable on Walrus via MemWal.
export async function recallMemory(stateId: string, querier: string, question: string): Promise<string> {
  try {
    const namespace = namespaceFor(stateId, querier);
    const historyQuery = asksAboutPastConversation(question);
    const result = await getMemWal().recall({
      query: question,
      namespace,
      limit: historyQuery ? 8 : 3,
    });

    if (!historyQuery) {
      return result.results.map((item) => item.text).join("\n---\n");
    }

    const historyResult = await getMemWal().recall({
      query: "previous questions asked by this user and answers from this mentor conversation history",
      namespace,
      limit: 8,
    });

    const byText = new Map<string, string>();
    for (const item of [...result.results, ...historyResult.results]) {
      byText.set(item.text, item.text);
    }
    return [...byText.values()].join("\n---\n");
  } catch (err) {
    console.error("[memory] recall failed:", err);
    return "";
  }
}

// Store this exchange so the mentor remembers it next time this same
// querier asks something, even in a different session. Fire-and-forget by
// design (errors logged, never thrown) — memory is an enhancement, not a
// requirement for the query response itself.
export async function rememberExchange(
  stateId: string,
  querier: string,
  question: string,
  answer: string
): Promise<void> {
  try {
    await getMemWal().remember(`Q: ${question}\nA: ${answer}`, namespaceFor(stateId, querier));
  } catch (err) {
    console.error("[memory] remember failed:", err);
  }
}

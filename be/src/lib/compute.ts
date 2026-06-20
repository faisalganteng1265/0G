import { AtomaSDK } from "atoma-sdk";

const COMPUTE_PROVIDER = process.env.COMPUTE_PROVIDER ?? "atoma";

let atoma: AtomaSDK | null = null;
function getAtoma(): AtomaSDK {
  if (!atoma) {
    atoma = new AtomaSDK({ bearerAuth: process.env.ATOMA_API_KEY ?? "" });
  }
  return atoma;
}

const ATOMA_MODEL = process.env.ATOMA_MODEL ?? "meta-llama/Llama-3.3-70B-Instruct";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct";
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

// Language-independent low-confidence signal: matching English phrases like
// "i don't know" breaks the moment the model answers in the user's own
// language (e.g. Indonesian), so the model is instructed to always emit
// this literal tag instead, regardless of what language the rest of its
// reply is in.
export const NO_KNOWLEDGE_TAG = "[NO_KNOWLEDGE]";

export type ServiceInfo = {
  model: string;
};

// List chat-capable models served by the active compute provider.
export async function listServices(): Promise<ServiceInfo[]> {
  if (COMPUTE_PROVIDER === "openrouter") {
    return [{ model: OPENROUTER_MODEL }];
  }
  const { data } = await getAtoma().models.modelsList();
  return (data ?? []).map((model) => ({ model: model.id }));
}

export interface InferenceResult {
  answer: string;
  teeVerified: boolean;
  chatId: string;
  providerAddress: string;
  model: string;
}

export async function runInference(
  question: string,
  knowledgeContext: string,
  mentorName: string,
  memoryContext?: string
): Promise<InferenceResult> {
  const memorySection = memoryContext
    ? `\n--- PAST CONVERSATIONS WITH THIS USER ---\n${memoryContext}\n--- END PAST CONVERSATIONS ---\n`
    : "";

  const systemPrompt = `You are ${mentorName}, an AI Mentor. Always reply in the same language the user asked in.

Use two sources:
1. The private expert knowledge base for domain/expert answers.
2. Past conversations with this same user for memory, personalization, and questions about what the user previously asked or told you.

--- KNOWLEDGE BASE ---
${knowledgeContext}
--- END KNOWLEDGE BASE ---
${memorySection}
Respond concisely and practically.

Rules:
- Do not fabricate domain facts that are not present in the knowledge base.
- If the user asks about prior conversation, preferences, identity, context, or what they asked before, answer from PAST CONVERSATIONS when available.
- If PAST CONVERSATIONS are present but incomplete, summarize what is available and say that it may not be the full history.
- Only use ${NO_KNOWLEDGE_TAG} when neither the knowledge base nor the past conversations contain enough information to answer. This tag must stay in English even though the rest of your reply is in the user's language.`;

  return COMPUTE_PROVIDER === "openrouter"
    ? runOpenRouterInference(systemPrompt, question)
    : runAtomaInference(systemPrompt, question);
}

// Runs inference inside an Atoma confidential-compute (TEE) node — the
// request/response payload is AEAD-encrypted end-to-end by the SDK, and the
// node's attestation is what `teeVerified` reflects. This is the direct
// analog of 0G Compute's TeeML broker call in the old design.
async function runAtomaInference(systemPrompt: string, question: string): Promise<InferenceResult> {
  const response = await getAtoma().confidentialChat.create({
    model: ATOMA_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
  });

  const choice = response.choices?.[0];
  const answer = choice?.message?.content ?? "";

  console.log(
    `[compute] provider=atoma model=${ATOMA_MODEL} id=${response.id} usage=${JSON.stringify(response.usage ?? {})}`
  );

  return {
    answer: typeof answer === "string" ? answer : "",
    teeVerified: true, // confidentialChat only returns once TEE attestation + AEAD round-trip succeeds
    chatId: response.id ?? "",
    providerAddress: "atoma-confidential-compute",
    model: ATOMA_MODEL,
  };
}

// Plain OpenAI-compatible inference via OpenRouter — dev/testing fallback
// while Atoma cloud access is pending. No TEE node is involved, so
// teeVerified is always false here (not a stand-in for the real thing).
async function runOpenRouterInference(systemPrompt: string, question: string): Promise<InferenceResult> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter request failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    id?: string;
    choices?: { message?: { content?: string } }[];
    usage?: unknown;
  };
  const answer = data.choices?.[0]?.message?.content ?? "";

  console.log(
    `[compute] provider=openrouter model=${OPENROUTER_MODEL} id=${data.id} usage=${JSON.stringify(data.usage ?? {})}`
  );

  return {
    answer: typeof answer === "string" ? answer : "",
    teeVerified: false,
    chatId: data.id ?? "",
    providerAddress: "openrouter",
    model: OPENROUTER_MODEL,
  };
}

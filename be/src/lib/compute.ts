import {
  createInferenceBroker,
  createLedgerBroker,
  InferenceServiceStructOutput,
} from "@0gfoundation/0g-compute-ts-sdk";
import { ethers } from "ethers";

const RPC_URL =
  process.env.ZG_RPC_URL ?? "https://evmrpc-testnet.0g.ai";

// Contract addresses — default ke Galileo testnet, override via env jika perlu
const LEDGER_CA =
  process.env.ZG_COMPUTE_LEDGER_CA ??
  "0xE70830508dAc0A97e6c087c75f402f9Be669E406";
const INFERENCE_CA =
  process.env.ZG_COMPUTE_INFERENCE_CA ??
  "0xa79F4c8311FF93C06b8CfB403690cc987c93F91E";
const FINE_TUNING_CA =
  process.env.ZG_COMPUTE_FINE_TUNING_CA ??
  "0xC6C075D8039763C8f1EbE580be5ADdf2fd6941bA";

function getSigner() {
  if (!process.env.ORACLE_PRIVATE_KEY)
    throw new Error("ORACLE_PRIVATE_KEY not set");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
}

async function createBroker() {
  const signer = getSigner();
  const ledger = await createLedgerBroker(
    signer,
    LEDGER_CA,
    INFERENCE_CA,
    FINE_TUNING_CA
  );
  return createInferenceBroker(signer, INFERENCE_CA, ledger);
}

export interface ServiceInfo {
  provider: string;
  model: string;
  serviceType: string;
  url: string;
  verifiability: string;
  inputPrice: string;
  outputPrice: string;
}

export interface InferenceResult {
  answer: string;
  teeVerified: boolean;
  chatId: string;
  providerAddress: string;
  model: string;
}

function toServiceInfo(s: InferenceServiceStructOutput): ServiceInfo {
  return {
    provider: s.provider,
    model: s.model,
    serviceType: s.serviceType,
    url: s.url,
    verifiability: s.verifiability,
    inputPrice: s.inputPrice.toString(),
    outputPrice: s.outputPrice.toString(),
  };
}

// List semua inference service yang tersedia di 0G Compute Network
export async function listServices(): Promise<ServiceInfo[]> {
  const broker = await createBroker();
  const raw = await broker.listService();
  return raw.map(toServiceInfo);
}

// Pilih service TEE (verifiability === 'TeeML') sebagai prioritas utama
function pickTeeService(services: ServiceInfo[]): ServiceInfo | undefined {
  return (
    services.find(
      (s) => s.verifiability === "TeeML" && s.serviceType === "chatbot"
    ) ?? services.find((s) => s.serviceType === "chatbot")
  );
}

// Jalankan inference via 0G Compute TEE dengan knowledge context dari 0G Storage
export async function runInference(
  question: string,
  knowledgeContext: string,
  mentorName: string
): Promise<InferenceResult> {
  const broker = await createBroker();

  const raw = await broker.listService();
  const services = raw.map(toServiceInfo);
  const service = pickTeeService(services);
  if (!service) throw new Error("No chatbot service available on 0G Compute");

  const systemPrompt = `You are ${mentorName}, an AI Mentor. Answer questions based strictly on the following private expert knowledge. If the knowledge does not contain enough information to answer confidently, say so explicitly.

--- KNOWLEDGE BASE ---
${knowledgeContext}
--- END KNOWLEDGE BASE ---

Respond concisely and practically. Do not fabricate information not present in the knowledge base.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ];

  const requestContent = JSON.stringify({ model: service.model, messages });

  // Generate one-time billing headers untuk request ini
  const rawHeaders = await broker.getRequestHeaders(
    service.provider,
    requestContent
  );
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  for (const [k, v] of Object.entries(rawHeaders)) {
    if (v !== undefined) headers[k] = String(v);
  }

  const response = await fetch(`${service.url}/v1/proxy/chat/completions`, {
    method: "POST",
    headers,
    body: requestContent,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`0G Compute returned ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    id?: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    choices?: { message?: { content?: string } }[];
  };

  const chatId = response.headers.get("ZG-Res-Key") ?? data.id ?? "";
  const answer = data.choices?.[0]?.message?.content ?? "";

  // Usage info untuk fee settlement dan TEE signature verification
  const usageContent = JSON.stringify({
    input_tokens: data.usage?.prompt_tokens ?? 0,
    output_tokens: data.usage?.completion_tokens ?? 0,
  });

  // Verifikasi bahwa response benar-benar datang dari TEE enclave
  let teeVerified = false;
  if (chatId) {
    const verifyResult = await broker.processResponse(
      service.provider,
      chatId,
      usageContent
    );
    teeVerified = verifyResult === true;
  }

  console.log(
    `[compute] provider=${service.provider} model=${service.model} teeVerified=${teeVerified} chatId=${chatId}`
  );

  return {
    answer,
    teeVerified,
    chatId,
    providerAddress: service.provider,
    model: service.model,
  };
}

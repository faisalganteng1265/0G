import {
  createInferenceBroker,
  createLedgerBroker,
  InferenceServiceStructOutput,
} from "@0gfoundation/0g-compute-ts-sdk";
import { ethers } from "ethers";

const RPC_URL =
  process.env.ZG_RPC_URL ?? "https://evmrpc.0g.ai";

// Contract addresses default ke 0G Aristotle mainnet, override via env jika perlu.
const LEDGER_CA =
  process.env.ZG_COMPUTE_LEDGER_CA ??
  "0x2dE54c845Cd948B72D2e32e39586fe89607074E3";
const INFERENCE_CA =
  process.env.ZG_COMPUTE_INFERENCE_CA ??
  "0x47340d900bdFec2BD393c626E12ea0656F938d84";
const FINE_TUNING_CA =
  process.env.ZG_COMPUTE_FINE_TUNING_CA ??
  "0x4e3474095518883744ddf135b7E0A23301c7F9c0";
const MIN_LEDGER_CREATION_DEPOSIT_OG = 3;
const MIN_PROVIDER_BALANCE = ethers.parseEther("2");

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
  const broker = await createInferenceBroker(signer, INFERENCE_CA, ledger);
  return { broker, ledger };
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

function parseOgAmount(value: string | undefined, fallback: string): bigint {
  return ethers.parseEther(value && value.trim().length > 0 ? value : fallback);
}

function parseOgNumber(value: string | undefined, fallback: string): number {
  const parsed = Number(value && value.trim().length > 0 ? value : fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid 0G amount: ${value}`);
  }
  return parsed;
}

function maxOgNumber(...values: number[]): number {
  return Math.max(...values.map((value) => Number(value.toFixed(18))));
}

async function ensureProviderFunded(
  ctx: Awaited<ReturnType<typeof createBroker>>,
  provider: string
) {
  if (process.env.ZG_COMPUTE_AUTO_FUND === "false") return;

  const configuredProviderFund = parseOgAmount(
    process.env.ZG_COMPUTE_PROVIDER_FUND_OG,
    "2"
  );
  const targetBalance =
    configuredProviderFund < MIN_PROVIDER_BALANCE
      ? MIN_PROVIDER_BALANCE
      : configuredProviderFund;

  let lockedBalance = 0n;
  try {
    const account = await ctx.broker.getAccount(provider);
    lockedBalance = account.balance - account.pendingRefund;
  } catch {
    lockedBalance = 0n;
  }

  if (lockedBalance < targetBalance) {
    const rawDeficit = targetBalance - lockedBalance;
    const transferAmount =
      rawDeficit < MIN_PROVIDER_BALANCE ? MIN_PROVIDER_BALANCE : rawDeficit;

    let availableBalance = 0n;
    let ledgerExists = true;
    try {
      const ledger = await ctx.ledger.getLedger();
      availableBalance = ledger.availableBalance;
    } catch {
      ledgerExists = false;
      availableBalance = 0n;
    }

    if (availableBalance < transferAmount) {
      const configuredDeposit = parseOgNumber(
        process.env.ZG_COMPUTE_AUTO_DEPOSIT_OG ??
          process.env.ZG_COMPUTE_LEDGER_BALANCE,
        "1"
      );
      const transferDeficit = Number(
        ethers.formatEther(transferAmount - availableBalance)
      );
      const depositAmount = ledgerExists
        ? maxOgNumber(configuredDeposit, transferDeficit)
        : maxOgNumber(
            configuredDeposit,
            transferDeficit,
            MIN_LEDGER_CREATION_DEPOSIT_OG
          );

      console.log(
        `[compute] depositing ${depositAmount} OG to 0G Compute ledger before provider funding`
      );
      await ctx.ledger.depositFund(depositAmount);
    }

    console.log(
      `[compute] funding provider=${provider} amount=${ethers.formatEther(
        transferAmount
      )} OG`
    );
    await ctx.ledger.transferFund(provider, "inference", transferAmount);
  }

  await ctx.broker.acknowledgeProviderSigner(provider);
}

// List semua inference service yang tersedia di 0G Compute Network
export async function listServices(): Promise<ServiceInfo[]> {
  const { broker } = await createBroker();
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
  const ctx = await createBroker();
  const { broker } = ctx;

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

  await ensureProviderFunded(ctx, service.provider);

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

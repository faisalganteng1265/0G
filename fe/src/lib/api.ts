const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type JsonBody = Record<string, unknown>;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, init);
  const payload = (await response.json().catch(() => ({}))) as T & { error?: unknown };

  if (!response.ok) {
    const message =
      typeof payload.error === "string" ? payload.error : `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function postJson<T>(path: string, body: JsonBody): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

export type TxPayload = {
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
};

export type MarketQuote = {
  tokenId: number;
  amount: number;
  sharePriceWei: string | null;
  buySharesCostWei: string | null;
  queryPriceWei: string;
};

export type MarketAccess = {
  checked: boolean;
  hasAccess: boolean;
  reason: "contracts-not-configured" | "shareholder" | "no-access";
  shareBalance: number;
};

export type QueryResponse = {
  ok: true;
  answer: string;
  teeVerified: boolean;
  chatId: string;
  providerAddress: string;
  model: string;
  revenue: { txHash: string | null; recordedQuery: boolean };
  oracle: { confidenceUpdated: number; gapFlagged: boolean };
};

export const api = {
  getMentors: () => request<{ ok: true; mentors: unknown[] }>("/market/mentors"),
  getAccess: (tokenId: number, userAddress: string) =>
    request<{ ok: true; access: MarketAccess }>(
      `/market/access?tokenId=${tokenId}&userAddress=${userAddress}`,
    ),
  getQuote: (tokenId: number, amount: number) =>
    request<{ ok: true; quote: MarketQuote }>(`/market/quote?tokenId=${tokenId}&amount=${amount}`),
  buildBuySharesTx: (body: { tokenId: number; amount: number; valueWei?: string }) =>
    postJson<{ ok: true; tx: TxPayload; quote: MarketQuote }>("/market/tx/buy-shares", body),
  buildExecuteQueryTx: (body: { tokenId: number; valueWei?: string }) =>
    postJson<{ ok: true; tx: TxPayload; quote: MarketQuote }>("/market/tx/execute-query", body),
  getQueryMessage: (body: { tokenId: number; question: string; userAddress: string }) =>
    postJson<{ ok: true; message: string; signedAt: number }>("/market/query-message", body),
  sendQuery: (body: JsonBody) => postJson<QueryResponse>("/query", body),
  uploadKnowledge: (formData: FormData) =>
    request<{ ok: true; rootHash: string; sizeBytes: number; txHash: string | null; message: string }>(
      "/upload",
      { method: "POST", body: formData },
    ),
  getOracleServices: () => request<{ ok: true; services: unknown[] }>("/oracle/services"),
  signTransfer: (body: JsonBody) =>
    postJson<{ ok: true; sealedKey: `0x${string}`; proofs: unknown[] }>("/oracle/sign-transfer", body),
  signClone: (body: JsonBody) =>
    postJson<{ ok: true; sealedKey: `0x${string}`; proofs: unknown[] }>("/oracle/sign-clone", body),
};

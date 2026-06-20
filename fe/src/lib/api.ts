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

export type MentorListEntry = {
  nftId: string;
  stateId: string;
  creator: string;
  name: string;
};

export type MarketQuote = {
  stateId: string;
  amount: number;
  sharePoolId: string;
  sharePriceMist: number;
  buySharesCostMist: number;
  queryPriceMist: number;
};

export type MarketAccess = {
  hasAccess: boolean;
  reason: "shareholder" | "allow-listed" | "no-access";
  shareBalance: number;
};

export type QueryResponse = {
  ok: true;
  answer: string;
  teeVerified: boolean;
  chatId: string;
  model: string;
  mentor: { stateId: string; blobId: string };
  access: MarketAccess;
  settlement: { txDigest: string; querier: string };
  oracle: { confidenceUpdated: number; gapFlagged: boolean };
  memory: { recalled: boolean };
};

export const api = {
  getMentors: () => request<{ ok: true; mentors: MentorListEntry[] }>("/market/mentors"),
  getAccess: (stateId: string, userAddress: string) =>
    request<{ ok: true; access: MarketAccess }>(
      `/market/access?stateId=${stateId}&userAddress=${userAddress}`,
    ),
  getQuote: (stateId: string, amount: number) =>
    request<{ ok: true; quote: MarketQuote }>(`/market/quote?stateId=${stateId}&amount=${amount}`),
  sendQuery: (body: { stateId: string; question: string; settlementTxDigest: string }) =>
    postJson<QueryResponse>("/query", body),
  uploadKnowledge: (formData: FormData) =>
    request<{ ok: true; blobId: string; sizeBytes: number; txDigest: string; gapResolved: boolean; message: string }>(
      "/upload",
      { method: "POST", body: formData },
    ),
};

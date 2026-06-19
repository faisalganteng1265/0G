import { bcs } from "@mysten/sui/bcs";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

const NETWORK = (process.env.SUI_NETWORK ?? "testnet") as
  | "testnet"
  | "mainnet"
  | "devnet"
  | "localnet";

const PACKAGE_ID = requireEnv("PACKAGE_ID");
const CONFIG_ID = requireEnv("CONFIG_ID");
const ORACLE_CAP_ID = requireEnv("ORACLE_CAP_ID");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} not set`);
  return value;
}

let client: SuiClient | null = null;
export function getClient(): SuiClient {
  if (!client) client = new SuiClient({ url: getFullnodeUrl(NETWORK) });
  return client;
}

let keypair: Ed25519Keypair | null = null;
export function getOracleKeypair(): Ed25519Keypair {
  if (!keypair) {
    const raw = requireEnv("ORACLE_PRIVATE_KEY");
    const { secretKey } = decodeSuiPrivateKey(raw);
    keypair = Ed25519Keypair.fromSecretKey(secretKey);
  }
  return keypair;
}

async function signAndExecute(tx: Transaction): Promise<string> {
  const result = await getClient().signAndExecuteTransaction({
    signer: getOracleKeypair(),
    transaction: tx,
    options: { showEffects: true, showEvents: true },
  });
  if (result.effects?.status.status !== "success") {
    throw new Error(`Transaction failed: ${result.effects?.status.error}`);
  }
  return result.digest;
}

// ---------------------------------------------------------------------------
// Oracle-gated writes — mirror mentor_nft.move's `oracle_*` functions.
// ---------------------------------------------------------------------------

export async function oracleUpdateBlobId(
  stateId: string,
  blobId: string,
  confidence: number
): Promise<string> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::mentor_nft::oracle_update_blob_id`,
    arguments: [
      tx.object(ORACLE_CAP_ID),
      tx.object(stateId),
      tx.pure.string(blobId),
      tx.pure.u8(confidence),
      tx.object.clock(),
    ],
  });
  return signAndExecute(tx);
}

export async function oracleUpdateConfidence(stateId: string, score: number): Promise<string> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::mentor_nft::oracle_update_confidence`,
    arguments: [tx.object(ORACLE_CAP_ID), tx.object(stateId), tx.pure.u8(score), tx.object.clock()],
  });
  return signAndExecute(tx);
}

export async function oracleIncrementGap(stateId: string): Promise<string> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::mentor_nft::oracle_increment_gap`,
    arguments: [tx.object(ORACLE_CAP_ID), tx.object(stateId)],
  });
  return signAndExecute(tx);
}

export async function oracleResolveGap(stateId: string): Promise<string> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::mentor_nft::oracle_resolve_gap`,
    arguments: [tx.object(ORACLE_CAP_ID), tx.object(stateId)],
  });
  return signAndExecute(tx);
}

export async function oracleRecordQuery(stateId: string): Promise<string> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::mentor_nft::oracle_record_query`,
    arguments: [tx.object(ORACLE_CAP_ID), tx.object(stateId)],
  });
  return signAndExecute(tx);
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

const STATUS_NAMES = ["draft", "review", "ready", "suspended"] as const;

export type MentorStateView = {
  stateId: string;
  nftId: string;
  blobId: string;
  confidenceScore: number;
  gapCount: number;
  totalQueries: number;
  status: (typeof STATUS_NAMES)[number];
  lastUpdatedAtMs: number;
  sharePoolId: string;
  revenuePoolId: string;
  poolsLinked: boolean;
};

export async function getMentorState(stateId: string): Promise<MentorStateView> {
  const obj = await getClient().getObject({ id: stateId, options: { showContent: true } });
  if (obj.data?.content?.dataType !== "moveObject") {
    throw new Error(`MentorState ${stateId} not found`);
  }
  const fields = obj.data.content.fields as Record<string, unknown>;
  return {
    stateId,
    nftId: String(fields.nft_id),
    blobId: String(fields.blob_id),
    confidenceScore: Number(fields.confidence_score),
    gapCount: Number(fields.gap_count),
    totalQueries: Number(fields.total_queries),
    status: STATUS_NAMES[Number(fields.status)] ?? "draft",
    lastUpdatedAtMs: Number(fields.last_updated_at),
    sharePoolId: String(fields.share_pool_id),
    revenuePoolId: String(fields.revenue_pool_id),
    poolsLinked: Boolean(fields.pools_linked),
  };
}

async function devInspectReturnU64(target: string, args: (tx: Transaction) => unknown[]): Promise<number> {
  const tx = new Transaction();
  tx.moveCall({ target, arguments: args(tx) as never });
  const result = await getClient().devInspectTransactionBlock({
    sender: getOracleKeypair().toSuiAddress(),
    transactionBlock: tx,
  });
  const bytes = result.results?.[0]?.returnValues?.[0]?.[0];
  if (!bytes) throw new Error(`devInspect for ${target} returned no value`);
  return Number(bcs.U64.parse(Uint8Array.from(bytes)));
}

export async function getShareBalance(sharePoolId: string, holder: string): Promise<number> {
  return devInspectReturnU64(`${PACKAGE_ID}::shares_market::balance_of`, (tx) => [
    tx.object(sharePoolId),
    tx.pure.address(holder),
  ]);
}

export async function getBuyQuote(sharePoolId: string, amount: number): Promise<number> {
  return devInspectReturnU64(`${PACKAGE_ID}::shares_market::buy_quote`, (tx) => [
    tx.object(sharePoolId),
    tx.pure.u64(amount),
  ]);
}

export async function getCurrentPrice(sharePoolId: string): Promise<number> {
  return devInspectReturnU64(`${PACKAGE_ID}::shares_market::current_price`, (tx) => [tx.object(sharePoolId)]);
}

export async function getQueryPrice(): Promise<number> {
  return devInspectReturnU64(`${PACKAGE_ID}::revenue::query_price`, () => []);
}

export type QueryAccess = {
  hasAccess: boolean;
  reason: "shareholder" | "allow-listed" | "no-access";
  shareBalance: number;
};

export async function checkQueryAccess(stateId: string, userAddress?: string): Promise<QueryAccess> {
  if (!userAddress) {
    return { hasAccess: false, reason: "no-access", shareBalance: 0 };
  }
  const state = await getMentorState(stateId);
  const shareBalance = await getShareBalance(state.sharePoolId, userAddress);
  if (shareBalance > 0) {
    return { hasAccess: true, reason: "shareholder", shareBalance };
  }
  return { hasAccess: false, reason: "no-access", shareBalance: 0 };
}

/// Verifies a `marketplace::execute_query` transaction was actually
/// submitted (and succeeded) by `userAddress` for this mentor's `QueryExecuted`
/// event, before the backend spends Atoma inference budget on their behalf.
export async function verifyQuerySettlement(
  stateId: string,
  userAddress: string,
  txDigest: string
): Promise<{ ok: boolean; error?: string }> {
  const tx = await getClient().getTransactionBlock({
    digest: txDigest,
    options: { showEffects: true, showEvents: true, showInput: true },
  });

  if (tx.effects?.status.status !== "success") {
    return { ok: false, error: "Settlement transaction did not succeed" };
  }
  if (tx.transaction?.data.sender !== userAddress) {
    return { ok: false, error: "Settlement transaction sender does not match userAddress" };
  }

  const matched = (tx.events ?? []).some((event) => {
    if (!event.type.endsWith("::marketplace::QueryExecuted")) return false;
    const parsed = event.parsedJson as { state_id?: string; querier?: string } | undefined;
    return parsed?.state_id === stateId && parsed?.querier === userAddress;
  });

  if (!matched) {
    return { ok: false, error: "QueryExecuted event not found in settlement transaction" };
  }
  return { ok: true };
}

export type MentorListEntry = {
  nftId: string;
  stateId: string;
  creator: string;
  name: string;
};

let mentorsCache: { data: MentorListEntry[]; ts: number } | null = null;
const MENTORS_CACHE_TTL_MS = 60_000;

export async function getAllMentors(): Promise<MentorListEntry[]> {
  if (mentorsCache && Date.now() - mentorsCache.ts < MENTORS_CACHE_TTL_MS) {
    return mentorsCache.data;
  }

  const mentors: MentorListEntry[] = [];
  let cursor: string | null | undefined = null;
  do {
    const page = await getClient().queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::marketplace::MentorRegistered` },
      cursor,
      order: "descending",
    });
    for (const event of page.data) {
      const parsed = event.parsedJson as {
        nft_id: string;
        state_id: string;
        creator: string;
        name: string;
      };
      mentors.push({
        nftId: parsed.nft_id,
        stateId: parsed.state_id,
        creator: parsed.creator,
        name: parsed.name,
      });
    }
    cursor = page.hasNextPage ? page.nextCursor : null;
  } while (cursor);

  mentorsCache = { data: mentors, ts: Date.now() };
  return mentors;
}

export { PACKAGE_ID, CONFIG_ID, ORACLE_CAP_ID };

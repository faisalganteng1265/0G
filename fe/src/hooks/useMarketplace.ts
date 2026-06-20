"use client";

import { useCurrentAccount, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { bcs } from "@mysten/sui/bcs";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { CONFIG_ID, MOVE_EVENT_TYPES, PACKAGE_ID } from "@/lib/contracts";

export const LIVE_REFETCH_INTERVAL_MS = 6_000;
export const liveQueryOptions = {
  refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  refetchIntervalInBackground: false,
  placeholderData: keepPreviousData,
  staleTime: 4_000,
} as const;

const PLACEHOLDER_SENDER = `0x${"0".repeat(64)}`;

export const STATUS_LABELS = ["DRAFT", "REVIEW", "READY", "SUSPENDED"] as const;

export function statusLabel(status: number) {
  return STATUS_LABELS[status] ?? "UNKNOWN";
}

export function formatSui(value?: number | string | bigint | null) {
  if (value === null || value === undefined) return "-";
  const mist = typeof value === "bigint" ? Number(value) : Number(value);
  const sui = mist / 1e9;
  if (sui === 0) return "0 SUI";
  if (sui < 0.0001) return `${sui.toExponential(2)} SUI`;
  return `${sui.toLocaleString(undefined, { maximumFractionDigits: 4 })} SUI`;
}

export function shortAddress(address?: string) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export type Mentor = {
  nftId: string;
  stateId: string;
  creator: string;
  name: string;
  category: string;
  mintedAtMs: number;
  blobId: string;
  confidenceScore: number;
  gapCount: number;
  totalQueries: number;
  status: number;
  lastUpdatedAtMs: number;
  sharePoolId: string;
  revenuePoolId: string;
  vestingScheduleId: string;
};

function moveFields(data: { content?: unknown } | null | undefined) {
  const content = data?.content as { dataType?: string; fields?: unknown } | undefined;
  if (content?.dataType !== "moveObject") return {} as Record<string, unknown>;
  return content.fields as Record<string, unknown>;
}

export function useMentors() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["mentors"],
    ...liveQueryOptions,
    queryFn: async (): Promise<Mentor[]> => {
      const { mentors: entries } = await api.getMentors();
      if (entries.length === 0) return [];

      const ids = entries.flatMap((entry) => [entry.nftId, entry.stateId]);
      const objects = await client.multiGetObjects({ ids, options: { showContent: true } });
      const byId = new Map(objects.map((object) => [object.data?.objectId, object.data]));

      return entries.map((entry) => {
        const nftFields = moveFields(byId.get(entry.nftId));
        const stateFields = moveFields(byId.get(entry.stateId));

        return {
          nftId: entry.nftId,
          stateId: entry.stateId,
          creator: entry.creator,
          name: entry.name,
          category: String(nftFields.category ?? "General"),
          mintedAtMs: Number(nftFields.minted_at ?? 0),
          blobId: String(stateFields.blob_id ?? ""),
          confidenceScore: Number(stateFields.confidence_score ?? 0),
          gapCount: Number(stateFields.gap_count ?? 0),
          totalQueries: Number(stateFields.total_queries ?? 0),
          status: Number(stateFields.status ?? 0),
          lastUpdatedAtMs: Number(stateFields.last_updated_at ?? 0),
          sharePoolId: String(stateFields.share_pool_id ?? ""),
          revenuePoolId: String(stateFields.revenue_pool_id ?? ""),
          vestingScheduleId: String(stateFields.vesting_schedule_id ?? ""),
        };
      });
    },
  });
}

export function useMarketAccess(stateId?: string, userAddress?: string) {
  return useQuery({
    queryKey: ["market-access", stateId, userAddress],
    enabled: Boolean(stateId && userAddress),
    ...liveQueryOptions,
    queryFn: async () => {
      const result = await api.getAccess(stateId!, userAddress!);
      return result.access;
    },
  });
}

export function useMarketQuote(stateId?: string, amount = 1) {
  return useQuery({
    queryKey: ["market-quote", stateId, amount],
    enabled: Boolean(stateId),
    ...liveQueryOptions,
    queryFn: async () => {
      const result = await api.getQuote(stateId!, amount);
      return result.quote;
    },
  });
}

async function devInspectU64(
  client: SuiJsonRpcClient,
  sender: string,
  target: string,
  buildArgs: (tx: Transaction) => unknown[],
): Promise<number> {
  const tx = new Transaction();
  tx.moveCall({ target, arguments: buildArgs(tx) as never });
  const result = await client.devInspectTransactionBlock({ sender, transactionBlock: tx });
  const bytes = result.results?.[0]?.returnValues?.[0]?.[0];
  if (!bytes) throw new Error(`devInspect for ${target} returned no value`);
  return Number(bcs.U64.parse(Uint8Array.from(bytes)));
}

function useDevInspectU64(
  target: string,
  buildArgs: (tx: Transaction) => unknown[],
  options: { enabled?: boolean; queryKeyExtra: unknown[] },
) {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const sender = account?.address ?? PLACEHOLDER_SENDER;
  const enabled = options.enabled ?? true;

  return useQuery({
    queryKey: ["devInspectU64", target, sender, ...options.queryKeyExtra],
    enabled,
    ...liveQueryOptions,
    queryFn: () => devInspectU64(client, sender, target, buildArgs),
  });
}

export function useShareBalance(sharePoolId?: string, holder?: string) {
  return useDevInspectU64(
    `${PACKAGE_ID}::shares_market::balance_of`,
    (tx) => [tx.object(sharePoolId!), tx.pure.address(holder!)],
    { enabled: Boolean(sharePoolId && holder), queryKeyExtra: [sharePoolId, holder] },
  );
}

export function useSharePrice(sharePoolId?: string) {
  return useDevInspectU64(
    `${PACKAGE_ID}::shares_market::current_price`,
    (tx) => [tx.object(sharePoolId!)],
    { enabled: Boolean(sharePoolId), queryKeyExtra: [sharePoolId] },
  );
}

export function useBuyQuote(sharePoolId?: string, amount = 1) {
  return useDevInspectU64(
    `${PACKAGE_ID}::shares_market::buy_quote`,
    (tx) => [tx.object(sharePoolId!), tx.pure.u64(amount)],
    { enabled: Boolean(sharePoolId), queryKeyExtra: [sharePoolId, amount] },
  );
}

export function usePendingCuratorRewards(revenuePoolId?: string, sharePoolId?: string, holder?: string) {
  return useDevInspectU64(
    `${PACKAGE_ID}::revenue::pending_curator_rewards`,
    (tx) => [tx.object(revenuePoolId!), tx.object(sharePoolId!), tx.pure.address(holder!)],
    {
      enabled: Boolean(revenuePoolId && sharePoolId && holder),
      queryKeyExtra: [revenuePoolId, sharePoolId, holder],
    },
  );
}

export type SharePosition = {
  stateId: string;
  sharePoolId: string;
  revenuePoolId: string;
  balance: number;
  priceMist: number;
  pendingRewardsMist: number;
};

/** Batched per-mentor reads for the portfolio aggregate view — one query
 * fanning out N parallel devInspect calls, instead of N hook calls (which
 * would violate the rules of hooks for a dynamically-sized mentor list). */
export function useSharePositionsBatch(mentors: Mentor[], holder?: string) {
  const client = useSuiClient();
  const sender = holder ?? PLACEHOLDER_SENDER;

  return useQuery({
    queryKey: ["share-positions-batch", mentors.map((mentor) => mentor.stateId), holder],
    enabled: mentors.length > 0,
    ...liveQueryOptions,
    queryFn: async (): Promise<SharePosition[]> =>
      Promise.all(
        mentors.map(async (mentor): Promise<SharePosition> => {
          const [balance, priceMist, pendingRewardsMist] = await Promise.all([
            holder
              ? devInspectU64(client, sender, `${PACKAGE_ID}::shares_market::balance_of`, (tx) => [
                  tx.object(mentor.sharePoolId),
                  tx.pure.address(holder),
                ])
              : Promise.resolve(0),
            devInspectU64(client, sender, `${PACKAGE_ID}::shares_market::current_price`, (tx) => [
              tx.object(mentor.sharePoolId),
            ]),
            holder
              ? devInspectU64(client, sender, `${PACKAGE_ID}::revenue::pending_curator_rewards`, (tx) => [
                  tx.object(mentor.revenuePoolId),
                  tx.object(mentor.sharePoolId),
                  tx.pure.address(holder),
                ])
              : Promise.resolve(0),
          ]);
          return {
            stateId: mentor.stateId,
            sharePoolId: mentor.sharePoolId,
            revenuePoolId: mentor.revenuePoolId,
            balance,
            priceMist,
            pendingRewardsMist,
          };
        }),
      ),
  });
}

export function useVestingClaimable(vestingScheduleId?: string) {
  return useDevInspectU64(
    `${PACKAGE_ID}::vesting::claimable_amount`,
    (tx) => [tx.object(vestingScheduleId!), tx.object(CONFIG_ID), tx.object.clock()],
    { enabled: Boolean(vestingScheduleId), queryKeyExtra: [vestingScheduleId] },
  );
}

export function useVestingProgress(vestingScheduleId?: string) {
  return useDevInspectU64(
    `${PACKAGE_ID}::vesting::vesting_progress_bps`,
    (tx) => [tx.object(vestingScheduleId!), tx.object(CONFIG_ID), tx.object.clock()],
    { enabled: Boolean(vestingScheduleId), queryKeyExtra: [vestingScheduleId] },
  );
}

export function useMentorRoyaltyClaimable(revenuePoolId?: string) {
  return useSuiClientQuery(
    "getObject",
    { id: revenuePoolId ?? "", options: { showContent: true } },
    {
      ...liveQueryOptions,
      enabled: Boolean(revenuePoolId),
      select: (response) => Number(moveFields(response.data).mentor_claimable ?? 0),
    },
  );
}

export function useMentorRoyaltyClaimableBatch(revenuePoolIds: string[]) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["mentor-royalty-claimable-batch", revenuePoolIds],
    enabled: revenuePoolIds.length > 0,
    ...liveQueryOptions,
    queryFn: async () => {
      const objects = await client.multiGetObjects({ ids: revenuePoolIds, options: { showContent: true } });
      const result: Record<string, number> = {};
      for (const object of objects) {
        if (!object.data?.objectId) continue;
        result[object.data.objectId] = Number(moveFields(object.data).mentor_claimable ?? 0);
      }
      return result;
    },
  });
}

export type GapEvent = {
  stateId: string;
  gapCount: number;
  txDigest: string;
  timestampMs: number;
};

export function useGapEvents() {
  return useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: MOVE_EVENT_TYPES.GapChanged }, order: "descending", limit: 50 },
    {
      ...liveQueryOptions,
      select: (page): GapEvent[] =>
        page.data.map((event) => {
          const parsed = event.parsedJson as { state_id: string; gap_count: number };
          return {
            stateId: parsed.state_id,
            gapCount: Number(parsed.gap_count),
            txDigest: event.id.txDigest,
            timestampMs: Number(event.timestampMs ?? 0),
          };
        }),
    },
  );
}

export type ConfidencePoint = {
  score: number;
  txDigest: string;
  timestampMs: number;
};

// Full confidence trajectory for one mentor, oldest first — this is the
// on-chain trail of the agent's self-assessment evolving across every
// query, not a single point-in-time number.
export function useConfidenceHistory(stateId?: string) {
  return useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: MOVE_EVENT_TYPES.ConfidenceUpdated }, order: "descending", limit: 50 },
    {
      ...liveQueryOptions,
      enabled: Boolean(stateId),
      select: (page): ConfidencePoint[] =>
        page.data
          .map((event) => {
            const parsed = event.parsedJson as { state_id: string; score: number };
            return {
              stateId: parsed.state_id,
              score: Number(parsed.score),
              txDigest: event.id.txDigest,
              timestampMs: Number(event.timestampMs ?? 0),
            };
          })
          .filter((point) => point.stateId === stateId)
          .sort((a, b) => a.timestampMs - b.timestampMs),
    },
  );
}

export type MentorActivityEvent = {
  type: "MentorRegistered" | "StorageUpdated" | "StatusChanged";
  stateId: string;
  title: string;
  detail: string;
  txDigest: string;
  timestampMs: number;
};

export function useMentorActivityEvents() {
  const registered = useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: MOVE_EVENT_TYPES.MentorRegistered }, order: "descending", limit: 50 },
    liveQueryOptions,
  );
  const storageUpdates = useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: MOVE_EVENT_TYPES.StorageUpdated }, order: "descending", limit: 50 },
    liveQueryOptions,
  );
  const statusChanges = useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: MOVE_EVENT_TYPES.StatusChanged }, order: "descending", limit: 50 },
    liveQueryOptions,
  );

  const events: MentorActivityEvent[] = [
    ...(registered.data?.data ?? []).map((event) => {
      const parsed = event.parsedJson as { state_id: string; creator: string; name: string };
      return {
        type: "MentorRegistered" as const,
        stateId: parsed.state_id,
        title: `${parsed.name} minted`,
        detail: `Creator ${shortAddress(parsed.creator)}`,
        txDigest: event.id.txDigest,
        timestampMs: Number(event.timestampMs ?? 0),
      };
    }),
    ...(storageUpdates.data?.data ?? []).map((event) => {
      const parsed = event.parsedJson as { state_id: string; confidence_score: number };
      return {
        type: "StorageUpdated" as const,
        stateId: parsed.state_id,
        title: "Knowledge updated",
        detail: `Confidence ${Number(parsed.confidence_score)}%`,
        txDigest: event.id.txDigest,
        timestampMs: Number(event.timestampMs ?? 0),
      };
    }),
    ...(statusChanges.data?.data ?? []).map((event) => {
      const parsed = event.parsedJson as { state_id: string; status: number };
      return {
        type: "StatusChanged" as const,
        stateId: parsed.state_id,
        title: `Status changed to ${statusLabel(Number(parsed.status))}`,
        detail: `New status: ${statusLabel(Number(parsed.status))}`,
        txDigest: event.id.txDigest,
        timestampMs: Number(event.timestampMs ?? 0),
      };
    }),
  ].sort((a, b) => b.timestampMs - a.timestampMs);

  return { data: events, isLoading: registered.isLoading || storageUpdates.isLoading || statusChanges.isLoading };
}

export type SecurityEvent = {
  type: "MentorCloned" | "StorageUpdated";
  stateId: string;
  detail: string;
  txDigest: string;
  timestampMs: number;
};

export function useSecurityEvents() {
  const cloned = useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: MOVE_EVENT_TYPES.MentorCloned }, order: "descending", limit: 50 },
    liveQueryOptions,
  );
  const storageUpdates = useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: MOVE_EVENT_TYPES.StorageUpdated }, order: "descending", limit: 50 },
    liveQueryOptions,
  );

  const events: SecurityEvent[] = [
    ...(cloned.data?.data ?? []).map((event) => {
      const parsed = event.parsedJson as { source_state_id: string; new_state_id: string };
      return {
        type: "MentorCloned" as const,
        stateId: parsed.source_state_id,
        detail: `Cloned to state ${shortAddress(parsed.new_state_id)}`,
        txDigest: event.id.txDigest,
        timestampMs: Number(event.timestampMs ?? 0),
      };
    }),
    ...(storageUpdates.data?.data ?? []).map((event) => {
      const parsed = event.parsedJson as { state_id: string; confidence_score: number };
      return {
        type: "StorageUpdated" as const,
        stateId: parsed.state_id,
        detail: `confidence ${Number(parsed.confidence_score)}`,
        txDigest: event.id.txDigest,
        timestampMs: Number(event.timestampMs ?? 0),
      };
    }),
  ].sort((a, b) => b.timestampMs - a.timestampMs);

  return { data: events, isLoading: cloned.isLoading || storageUpdates.isLoading };
}

export type RoyaltyClaimedEvent = {
  poolId: string;
  mentor: string;
  amountMist: number;
  txDigest: string;
  timestampMs: number;
};

export function useMentorRoyaltyClaimedEvents() {
  return useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: MOVE_EVENT_TYPES.MentorRoyaltyClaimed }, order: "descending", limit: 50 },
    {
      ...liveQueryOptions,
      select: (page): RoyaltyClaimedEvent[] =>
        page.data.map((event) => {
          const parsed = event.parsedJson as { pool_id: string; mentor: string; amount: number };
          return {
            poolId: parsed.pool_id,
            mentor: parsed.mentor,
            amountMist: Number(parsed.amount),
            txDigest: event.id.txDigest,
            timestampMs: Number(event.timestampMs ?? 0),
          };
        }),
    },
  );
}

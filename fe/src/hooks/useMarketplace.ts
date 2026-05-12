"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { formatEther, type Address } from "viem";
import { usePublicClient, useReadContract } from "wagmi";

import { api } from "@/lib/api";
import {
  ACCESS_SHARES_ADDRESS,
  INFT_ADDRESS,
  MARKETPLACE_ADDRESS,
  accessSharesAbi,
  hasAccessSharesAddress,
  hasInftAddress,
  hasMarketplaceAddress,
  inftAbi,
  marketplaceAbi,
} from "@/lib/contracts";

export const LIVE_REFETCH_INTERVAL_MS = 6_000;
const liveQueryOptions = {
  refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  refetchIntervalInBackground: false,
  placeholderData: keepPreviousData,
  staleTime: 4_000,
} as const;

export type MentorMeta = {
  tokenId: number;
  creator: Address;
  storageRef: string;
  name: string;
  category: string;
  confidenceScore: number;
  gapCount: number;
  totalQueries: number;
  status: number;
  lastUpdatedAt: number;
  mintedAt: number;
};

function normalizeMentor(tokenId: bigint, meta: unknown): MentorMeta {
  const tuple = meta as Partial<MentorMeta> & Record<number, unknown>;
  return {
    tokenId: Number(tokenId),
    creator: (tuple.creator ?? tuple[0]) as Address,
    storageRef: String(tuple.storageRef ?? tuple[1] ?? ""),
    name: String(tuple.name ?? tuple[2] ?? `Mentor #${tokenId}`),
    category: String(tuple.category ?? tuple[3] ?? "General"),
    confidenceScore: Number(tuple.confidenceScore ?? tuple[4] ?? 0),
    gapCount: Number(tuple.gapCount ?? tuple[5] ?? 0),
    totalQueries: Number(tuple.totalQueries ?? tuple[6] ?? 0),
    status: Number(tuple.status ?? tuple[7] ?? 0),
    lastUpdatedAt: Number(tuple.lastUpdatedAt ?? tuple[8] ?? 0),
    mintedAt: Number(tuple.mintedAt ?? tuple[9] ?? 0),
  };
}

export function statusLabel(status: number) {
  return ["DRAFT", "REVIEW", "READY", "SUSPENDED"][status] ?? "UNKNOWN";
}

export function formatOg(value?: bigint | string | null) {
  if (value === null || value === undefined) return "-";
  const bigintValue = typeof value === "bigint" ? value : BigInt(value);
  const formatted = Number(formatEther(bigintValue));
  if (formatted === 0) return "0 0G";
  if (formatted < 0.0001) return `${formatted.toExponential(2)} 0G`;
  return `${formatted.toLocaleString(undefined, { maximumFractionDigits: 4 })} 0G`;
}

export function shortAddress(address?: string) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useMentors() {
  return useQuery({
    queryKey: ["mentors"],
    ...liveQueryOptions,
    queryFn: async () => {
      const result = await api.getMentors();
      return (result.mentors as Array<Record<string, unknown>>).map((m) =>
        normalizeMentor(BigInt(m.tokenId as number), m)
      );
    },
  });
}

export function useMentorMeta(tokenId?: number) {
  return useReadContract({
    address: INFT_ADDRESS,
    abi: inftAbi,
    functionName: "mentors",
    args: tokenId === undefined ? undefined : [BigInt(tokenId)],
    query: { enabled: hasInftAddress && tokenId !== undefined },
  });
}

export function useShareBalance(mentorId?: number, user?: Address) {
  const splitContractEnabled = hasAccessSharesAddress;
  return useReadContract({
    address: splitContractEnabled ? ACCESS_SHARES_ADDRESS : MARKETPLACE_ADDRESS,
    abi: splitContractEnabled ? accessSharesAbi : marketplaceAbi,
    functionName: splitContractEnabled ? "balanceOf" : "getShareBalance",
    args: mentorId === undefined || !user ? undefined : [BigInt(mentorId), user],
    query: {
      enabled: Boolean((splitContractEnabled || hasMarketplaceAddress) && mentorId !== undefined && user),
      refetchInterval: LIVE_REFETCH_INTERVAL_MS,
      refetchIntervalInBackground: false,
      staleTime: 4_000,
    },
  });
}

export function useSharePrice(mentorId?: number) {
  const splitContractEnabled = hasAccessSharesAddress;
  return useReadContract({
    address: splitContractEnabled ? ACCESS_SHARES_ADDRESS : MARKETPLACE_ADDRESS,
    abi: splitContractEnabled ? accessSharesAbi : marketplaceAbi,
    functionName: splitContractEnabled ? "currentPrice" : "getSharePrice",
    args: mentorId === undefined ? undefined : [BigInt(mentorId)],
    query: {
      enabled: Boolean((splitContractEnabled || hasMarketplaceAddress) && mentorId !== undefined),
      refetchInterval: LIVE_REFETCH_INTERVAL_MS,
      refetchIntervalInBackground: false,
      staleTime: 4_000,
    },
  });
}

export function usePendingCuratorRewards(mentorId?: number, user?: Address) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceAbi,
    functionName: "getPendingCuratorRewards",
    args: mentorId === undefined || !user ? undefined : [BigInt(mentorId), user],
    query: {
      enabled: Boolean(hasMarketplaceAddress && mentorId !== undefined && user),
      refetchInterval: LIVE_REFETCH_INTERVAL_MS,
      refetchIntervalInBackground: false,
      staleTime: 4_000,
    },
  });
}

export function useMentorClaimable(mentorId?: number) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceAbi,
    functionName: "getMentorClaimable",
    args: mentorId === undefined ? undefined : [BigInt(mentorId)],
    query: {
      enabled: Boolean(hasMarketplaceAddress && mentorId !== undefined),
      refetchInterval: LIVE_REFETCH_INTERVAL_MS,
      refetchIntervalInBackground: false,
      staleTime: 4_000,
    },
  });
}

export function useVestingProgress(mentorId?: number) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceAbi,
    functionName: "getVestingProgress",
    args: mentorId === undefined ? undefined : [BigInt(mentorId)],
    query: {
      enabled: Boolean(hasMarketplaceAddress && mentorId !== undefined),
      refetchInterval: LIVE_REFETCH_INTERVAL_MS,
      refetchIntervalInBackground: false,
      staleTime: 4_000,
    },
  });
}

export function useMarketAccess(tokenId?: number, userAddress?: Address) {
  return useQuery({
    queryKey: ["market-access", tokenId, userAddress],
    enabled: tokenId !== undefined && Boolean(userAddress),
    ...liveQueryOptions,
    queryFn: async () => {
      const result = await api.getAccess(tokenId!, userAddress!);
      return result.access;
    },
  });
}

export function useMarketQuote(tokenId?: number, amount = 1) {
  return useQuery({
    queryKey: ["market-quote", tokenId, amount],
    enabled: tokenId !== undefined,
    ...liveQueryOptions,
    queryFn: async () => {
      const result = await api.getQuote(tokenId!, amount);
      return result.quote;
    },
  });
}

export function useGapEvents() {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["gap-events", publicClient?.chain?.id, INFT_ADDRESS],
    enabled: Boolean(publicClient && hasInftAddress),
    ...liveQueryOptions,
    queryFn: async () => {
      if (!publicClient) return [];
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > BigInt(100_000) ? currentBlock - BigInt(100_000) : BigInt(0);
      const [incremented, resolved] = await Promise.all([
        publicClient.getLogs({
          address: INFT_ADDRESS,
          event: inftAbi[1],
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: INFT_ADDRESS,
          event: inftAbi[2],
          fromBlock,
          toBlock: "latest",
        }),
      ]);

      return [
        ...incremented.map((log) => ({
          type: "GapIncremented" as const,
          tokenId: Number(log.args.tokenId ?? BigInt(0)),
          count: Number(log.args.newGapCount ?? 0),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        ...resolved.map((log) => ({
          type: "GapResolved" as const,
          tokenId: Number(log.args.tokenId ?? BigInt(0)),
          count: Number(log.args.newGapCount ?? 0),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
      ].sort((a, b) => Number(b.blockNumber - a.blockNumber));
    },
  });
}

const mentorStatusLabels = ["DRAFT", "REVIEW", "READY", "SUSPENDED"] as const;

export function useMentorActivityEvents() {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["mentor-activity-events", publicClient?.chain?.id, MARKETPLACE_ADDRESS, INFT_ADDRESS],
    enabled: Boolean(publicClient && hasMarketplaceAddress && hasInftAddress),
    ...liveQueryOptions,
    queryFn: async () => {
      if (!publicClient) return [];
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > BigInt(100_000) ? currentBlock - BigInt(100_000) : BigInt(0);
      const [registered, storageUpdates, statusChanges] = await Promise.all([
        publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: marketplaceAbi[0],
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: INFT_ADDRESS,
          event: inftAbi[0],
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: INFT_ADDRESS,
          event: inftAbi[4],
          fromBlock,
          toBlock: "latest",
        }),
      ]);

      return [
        ...registered.map((log) => ({
          type: "MentorRegistered" as const,
          tokenId: Number(log.args.tokenId ?? 0),
          title: `${String(log.args.name ?? "Mentor")} minted`,
          detail: `Creator ${shortAddress(log.args.creator)}`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        ...storageUpdates.map((log) => ({
          type: "StorageRefUpdated" as const,
          tokenId: Number(log.args.tokenId ?? 0),
          title: `Knowledge updated`,
          detail: `Confidence ${Number(log.args.newConfidence ?? 0)}%`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        ...statusChanges.map((log) => {
          const oldStatus = Number(log.args.oldStatus ?? 0);
          const newStatus = Number(log.args.newStatus ?? 0);
          return {
            type: "StatusChanged" as const,
            tokenId: Number(log.args.tokenId ?? 0),
            title: `Status changed to ${mentorStatusLabels[newStatus] ?? "UNKNOWN"}`,
            detail: `${mentorStatusLabels[oldStatus] ?? "UNKNOWN"} -> ${mentorStatusLabels[newStatus] ?? "UNKNOWN"}`,
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
          };
        }),
      ].sort((a, b) => Number(b.blockNumber - a.blockNumber));
    },
  });
}

export function useSecurityEvents() {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["security-events", publicClient?.chain?.id, INFT_ADDRESS],
    enabled: Boolean(publicClient && hasInftAddress),
    ...liveQueryOptions,
    queryFn: async () => {
      if (!publicClient) return [];
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > BigInt(100_000) ? currentBlock - BigInt(100_000) : BigInt(0);
      const [transfers, storageUpdates] = await Promise.all([
        publicClient.getLogs({
          address: INFT_ADDRESS,
          event: inftAbi[3],
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: INFT_ADDRESS,
          event: inftAbi[0],
          fromBlock,
          toBlock: "latest",
        }),
      ]);

      return [
        ...transfers.map((log) => ({
          type: "Transfer" as const,
          tokenId: Number(log.args.tokenId ?? BigInt(0)),
          detail: `${shortAddress(log.args.from)} -> ${shortAddress(log.args.to)}`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        ...storageUpdates.map((log) => ({
          type: "StorageRefUpdated" as const,
          tokenId: Number(log.args.tokenId ?? BigInt(0)),
          detail: `confidence ${Number(log.args.newConfidence ?? 0)}`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
      ].sort((a, b) => Number(b.blockNumber - a.blockNumber));
    },
  });
}

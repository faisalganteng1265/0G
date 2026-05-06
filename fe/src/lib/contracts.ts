import { isAddress, zeroAddress, type Address } from "viem";

function envAddress(value: string | undefined): Address {
  return value && isAddress(value, { strict: false }) ? (value as Address) : zeroAddress;
}

export const MARKETPLACE_ADDRESS = envAddress(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS);
export const ACCESS_SHARES_ADDRESS = envAddress(process.env.NEXT_PUBLIC_ACCESS_SHARES_ADDRESS);
export const REVENUE_ADDRESS = envAddress(process.env.NEXT_PUBLIC_REVENUE_ADDRESS);
export const INFT_ADDRESS = envAddress(process.env.NEXT_PUBLIC_INFT_ADDRESS);

export const hasMarketplaceAddress = MARKETPLACE_ADDRESS !== zeroAddress;
export const hasAccessSharesAddress = ACCESS_SHARES_ADDRESS !== zeroAddress;
export const hasRevenueAddress = REVENUE_ADDRESS !== zeroAddress;
export const hasInftAddress = INFT_ADDRESS !== zeroAddress;

export const marketplaceAbi = [
  {
    type: "event",
    name: "MentorRegistered",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "QueryExecuted",
    inputs: [
      { name: "mentorId", type: "uint256", indexed: true },
      { name: "querier", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "MentorRoyaltyClaimed",
    inputs: [
      { name: "mentorId", type: "uint256", indexed: true },
      { name: "mentor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "function",
    name: "registerMentor",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "category", type: "string" },
      { name: "storageRef", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "setMentorStatus",
    stateMutability: "nonpayable",
    inputs: [
      { name: "mentorId", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "sellShares",
    stateMutability: "nonpayable",
    inputs: [
      { name: "mentorId", type: "uint256" },
      { name: "amount", type: "uint32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimCuratorRewards",
    stateMutability: "nonpayable",
    inputs: [{ name: "mentorId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claimMentorRoyalty",
    stateMutability: "nonpayable",
    inputs: [{ name: "mentorId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "vestEarnings",
    stateMutability: "nonpayable",
    inputs: [{ name: "mentorId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claimVested",
    stateMutability: "nonpayable",
    inputs: [{ name: "mentorId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getShareBalance",
    stateMutability: "view",
    inputs: [
      { name: "mentorId", type: "uint256" },
      { name: "holder", type: "address" },
    ],
    outputs: [{ name: "", type: "uint32" }],
  },
  {
    type: "function",
    name: "getSharePrice",
    stateMutability: "view",
    inputs: [{ name: "mentorId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getPendingCuratorRewards",
    stateMutability: "view",
    inputs: [
      { name: "mentorId", type: "uint256" },
      { name: "holder", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getMentorClaimable",
    stateMutability: "view",
    inputs: [{ name: "mentorId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getVestingProgress",
    stateMutability: "view",
    inputs: [{ name: "mentorId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const accessSharesAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      { name: "mentorId", type: "uint256" },
      { name: "holder", type: "address" },
    ],
    outputs: [{ name: "", type: "uint32" }],
  },
  {
    type: "function",
    name: "currentPrice",
    stateMutability: "view",
    inputs: [{ name: "mentorId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const revenueAbi = [] as const;

export const inftAbi = [
  {
    type: "event",
    name: "StorageRefUpdated",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "newRef", type: "string", indexed: false },
      { name: "newConfidence", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GapIncremented",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "newGapCount", type: "uint32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GapResolved",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "newGapCount", type: "uint32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
  {
    type: "function",
    name: "mentors",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "storageRef", type: "string" },
          { name: "name", type: "string" },
          { name: "category", type: "string" },
          { name: "confidenceScore", type: "uint8" },
          { name: "gapCount", type: "uint32" },
          { name: "totalQueries", type: "uint32" },
          { name: "status", type: "uint8" },
          { name: "lastUpdatedAt", type: "uint64" },
          { name: "mintedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getMentorsByCreator",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "iTransfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
      {
        name: "proofs",
        type: "tuple[]",
        components: [
          {
            name: "accessProof",
            type: "tuple",
            components: [
              { name: "oldDataHash", type: "bytes32" },
              { name: "newDataHash", type: "bytes32" },
              { name: "nonce", type: "bytes" },
              { name: "encryptedPubKey", type: "bytes" },
              { name: "proof", type: "bytes" },
            ],
          },
          {
            name: "ownershipProof",
            type: "tuple",
            components: [
              { name: "oracleType", type: "uint8" },
              { name: "oldDataHash", type: "bytes32" },
              { name: "newDataHash", type: "bytes32" },
              { name: "sealedKey", type: "bytes" },
              { name: "encryptedPubKey", type: "bytes" },
              { name: "nonce", type: "bytes" },
              { name: "proof", type: "bytes" },
            ],
          },
        ],
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "iClone",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
      {
        name: "proofs",
        type: "tuple[]",
        components: [
          {
            name: "accessProof",
            type: "tuple",
            components: [
              { name: "oldDataHash", type: "bytes32" },
              { name: "newDataHash", type: "bytes32" },
              { name: "nonce", type: "bytes" },
              { name: "encryptedPubKey", type: "bytes" },
              { name: "proof", type: "bytes" },
            ],
          },
          {
            name: "ownershipProof",
            type: "tuple",
            components: [
              { name: "oracleType", type: "uint8" },
              { name: "oldDataHash", type: "bytes32" },
              { name: "newDataHash", type: "bytes32" },
              { name: "sealedKey", type: "bytes" },
              { name: "encryptedPubKey", type: "bytes" },
              { name: "nonce", type: "bytes" },
              { name: "proof", type: "bytes" },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: "newTokenId", type: "uint256" }],
  },
] as const;

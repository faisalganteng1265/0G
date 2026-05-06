import { ethers } from "ethers";

const RPC_URL =
  process.env.ZG_RPC_URL ?? "https://evmrpc.0g.ai";

// Minimal ABI — hanya fungsi yang dipakai backend oracle
const INFT_ABI = [
  "function updateStorageRef(uint256 tokenId, string calldata newRef, uint8 newConfidence) external",
  "function setSealedKey(uint256 tokenId, bytes calldata sealedKey) external",
  "function incrementGapCount(uint256 tokenId) external",
  "function resolveGap(uint256 tokenId) external",
  "function updateConfidence(uint256 tokenId, uint8 score) external",
  "function recordQuery(uint256 tokenId) external",
  "function mentors(uint256 tokenId) external view returns ((address creator, string storageRef, string name, string category, uint8 confidenceScore, uint32 gapCount, uint32 totalQueries, uint8 status, uint64 lastUpdatedAt, uint64 mintedAt))",
  "function setOracle(address oracle, bool enabled) external",
];

const MARKETPLACE_ABI = [
  "event QueryExecuted(uint256 indexed mentorId, address indexed querier)",
  "function buyShares(uint256 mentorId, uint32 amount) external payable",
  "function executeQuery(uint256 mentorId) external payable",
  "function getShareBalance(uint256 mentorId, address holder) external view returns (uint32)",
  "function getSharePrice(uint256 mentorId) external view returns (uint256)",
];

const ACCESS_SHARES_ABI = [
  "function buyQuote(uint256 mentorId, uint32 amount) external view returns (uint256)",
  "function balanceOf(uint256 mentorId, address holder) external view returns (uint32)",
  "function currentPrice(uint256 mentorId) external view returns (uint256)",
];

const REVENUE_ABI = [
  "function QUERY_PRICE() external view returns (uint256)",
];

const marketplaceInterface = new ethers.Interface(MARKETPLACE_ABI);

function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

function getOracleSigner() {
  if (!process.env.ORACLE_PRIVATE_KEY)
    throw new Error("ORACLE_PRIVATE_KEY not set");
  const provider = getProvider();
  return new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
}

function getInftContract(signer: ethers.Wallet) {
  const addr = process.env.CONTRACT_INFT;
  if (!addr) throw new Error("CONTRACT_INFT not set");
  return new ethers.Contract(addr, INFT_ABI, signer);
}

function getMarketplaceContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addr = process.env.CONTRACT_MARKETPLACE;
  if (!addr) throw new Error("CONTRACT_MARKETPLACE not set");
  return new ethers.Contract(addr, MARKETPLACE_ABI, signerOrProvider);
}

function getAccessSharesContract(provider: ethers.Provider) {
  const addr = process.env.CONTRACT_ACCESS_SHARES;
  if (!addr) throw new Error("CONTRACT_ACCESS_SHARES not set");
  return new ethers.Contract(addr, ACCESS_SHARES_ABI, provider);
}

function getRevenueContract(provider: ethers.Provider) {
  const addr = process.env.CONTRACT_REVENUE;
  if (!addr) throw new Error("CONTRACT_REVENUE not set");
  return new ethers.Contract(addr, REVENUE_ABI, provider);
}

// Setelah knowledge berhasil diupload ke 0G Storage, simpan rootHash on-chain
export async function updateStorageRef(
  tokenId: number,
  rootHash: string,
  confidence: number
): Promise<string> {
  const signer = getOracleSigner();
  const contract = getInftContract(signer);
  const tx = await contract.updateStorageRef(tokenId, rootHash, confidence);
  await tx.wait();
  console.log(`[contracts] updateStorageRef tokenId=${tokenId} hash=${rootHash} tx=${tx.hash}`);
  return tx.hash as string;
}

// Simpan sealedKey (AES key untuk owner saat ini) on-chain setelah upload knowledge.
export async function setSealedKey(tokenId: number, sealedKey: Uint8Array): Promise<string> {
  const signer = getOracleSigner();
  const contract = getInftContract(signer);
  const tx = await contract.setSealedKey(tokenId, sealedKey);
  await tx.wait();
  console.log(`[contracts] setSealedKey tokenId=${tokenId} tx=${tx.hash}`);
  return tx.hash as string;
}

type TransferValidityProof = {
  accessProof: {
    oldDataHash: string;
    newDataHash: string;
    nonce: string;
    encryptedPubKey: string;
    proof: string;
  };
  ownershipProof: {
    oracleType: 0;
    oldDataHash: string;
    newDataHash: string;
    sealedKey: string;
    encryptedPubKey: string;
    nonce: string;
    proof: string;
  };
};

function bytesHex(bytes: Uint8Array): string {
  return ethers.hexlify(bytes);
}

async function getCurrentDataHash(tokenId: number): Promise<string> {
  const signer = getOracleSigner();
  const contract = getInftContract(signer);
  const mentor = await contract.mentors(tokenId);
  return ethers.keccak256(ethers.toUtf8Bytes(mentor.storageRef));
}

function proofNonce(label: string, tokenId: number, to: string): string {
  return ethers.hexlify(ethers.toUtf8Bytes(`${label}:${tokenId}:${to}:${Date.now()}:${ethers.hexlify(ethers.randomBytes(8))}`));
}

// Build ERC-7857 TransferValidityProof[] untuk iTransfer/iClone.
// Proof ini mengikuti struktur EIP-7857; verifier on-chain menerima oracle TEE
// sebagai access assistant untuk flow MVP tanpa receiver-side signature terpisah.
export async function buildTransferValidityProofs(
  to: string,
  tokenId: number,
  sealedKey: Uint8Array
): Promise<TransferValidityProof[]> {
  const signer = getOracleSigner();
  const contractAddress = process.env.CONTRACT_INFT;
  if (!contractAddress) throw new Error("CONTRACT_INFT not set");

  const oldDataHash = await getCurrentDataHash(tokenId);
  const newDataHash = oldDataHash;
  const sealedKeyHex = bytesHex(sealedKey);
  const encryptedPubKey = ethers.hexlify(ethers.concat([to]));
  const accessNonce = proofNonce("access", tokenId, to);
  const ownershipNonce = proofNonce("ownership", tokenId, to);
  const coder = ethers.AbiCoder.defaultAbiCoder();

  const accessHash = ethers.keccak256(
    coder.encode(
      ["address", "uint256", "bytes32", "bytes32", "bytes32", "bytes32"],
      [
        contractAddress,
        (await signer.provider!.getNetwork()).chainId,
        oldDataHash,
        newDataHash,
        ethers.keccak256(accessNonce),
        ethers.keccak256(encryptedPubKey),
      ]
    )
  );
  const accessSig = await signer.signMessage(ethers.getBytes(accessHash));

  const ownershipHash = ethers.keccak256(
    coder.encode(
      ["address", "uint256", "uint8", "bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
      [
        contractAddress,
        (await signer.provider!.getNetwork()).chainId,
        0,
        oldDataHash,
        newDataHash,
        ethers.keccak256(sealedKeyHex),
        ethers.keccak256(encryptedPubKey),
        ethers.keccak256(ownershipNonce),
      ]
    )
  );
  const ownershipSig = await signer.signMessage(ethers.getBytes(ownershipHash));

  return [
    {
      accessProof: {
        oldDataHash,
        newDataHash,
        nonce: accessNonce,
        encryptedPubKey,
        proof: accessSig,
      },
      ownershipProof: {
        oracleType: 0,
        oldDataHash,
        newDataHash,
        sealedKey: sealedKeyHex,
        encryptedPubKey,
        nonce: ownershipNonce,
        proof: ownershipSig,
      },
    },
  ];
}

// Oracle panggil ini setiap kali AI deteksi low-confidence answer
export async function incrementGap(tokenId: number): Promise<string> {
  const signer = getOracleSigner();
  const contract = getInftContract(signer);
  const tx = await contract.incrementGapCount(tokenId);
  await tx.wait();
  return tx.hash as string;
}

export async function resolveGap(tokenId: number): Promise<string> {
  const signer = getOracleSigner();
  const contract = getInftContract(signer);
  const tx = await contract.resolveGap(tokenId);
  await tx.wait();
  return tx.hash as string;
}

// Update confidence score on-chain (0-100)
export async function updateConfidence(
  tokenId: number,
  score: number
): Promise<string> {
  const signer = getOracleSigner();
  const contract = getInftContract(signer);
  const tx = await contract.updateConfidence(tokenId, score);
  await tx.wait();
  return tx.hash as string;
}

// Catat query yang masuk ke log on-chain
export async function recordQuery(tokenId: number): Promise<void> {
  const signer = getOracleSigner();
  const contract = getInftContract(signer);
  const tx = await contract.recordQuery(tokenId);
  await tx.wait();
}

export type QueryAccess = {
  checked: boolean;
  hasAccess: boolean;
  reason: "contracts-not-configured" | "shareholder" | "no-access";
  shareBalance: number;
};

// Query access is granted only by holding access shares.
export async function checkQueryAccess(
  tokenId: number,
  userAddress?: string
): Promise<QueryAccess> {
  const hasMarketplace = Boolean(process.env.CONTRACT_MARKETPLACE);
  const hasSplitContracts = Boolean(process.env.CONTRACT_ACCESS_SHARES && process.env.CONTRACT_REVENUE);

  if (!hasMarketplace && !hasSplitContracts) {
    return {
      checked: false,
      hasAccess: true,
      reason: "contracts-not-configured",
      shareBalance: 0,
    };
  }

  if (!userAddress || !ethers.isAddress(userAddress)) {
    return {
      checked: true,
      hasAccess: false,
      reason: "no-access",
      shareBalance: 0,
    };
  }

  const provider = getProvider();
  let shareBalance = 0;

  if (hasMarketplace) {
    const marketplace = getMarketplaceContract(provider);
    const shares = await marketplace.getShareBalance(tokenId, userAddress);
    shareBalance = Number(shares);
  } else {
    const shares = getAccessSharesContract(provider);
    const balance = await shares.balanceOf(tokenId, userAddress);
    shareBalance = Number(balance);
  }

  return {
    checked: true,
    hasAccess: shareBalance > 0,
    reason: shareBalance > 0 ? "shareholder" : "no-access",
    shareBalance,
  };
}

export async function getMarketAccess(tokenId: number, userAddress: string) {
  return checkQueryAccess(tokenId, userAddress);
}

export async function getMarketQuote(tokenId: number, amount: number) {
  const provider = getProvider();
  const hasMarketplace = Boolean(process.env.CONTRACT_MARKETPLACE);
  const hasShares = Boolean(process.env.CONTRACT_ACCESS_SHARES);
  const hasRevenue = Boolean(process.env.CONTRACT_REVENUE);

  let sharePrice: bigint | null = null;
  let buySharesCost: bigint | null = null;
  let queryPrice = ethers.parseEther(process.env.QUERY_PRICE_OG ?? "0.0005");

  if (hasMarketplace) {
    const marketplace = getMarketplaceContract(provider);
    sharePrice = await marketplace.getSharePrice(tokenId);
  } else if (hasShares) {
    const shares = getAccessSharesContract(provider);
    sharePrice = await shares.currentPrice(tokenId);
  }

  if (hasShares) {
    const shares = getAccessSharesContract(provider);
    buySharesCost = await shares.buyQuote(tokenId, amount);
  }

  if (hasRevenue) {
    const revenue = getRevenueContract(provider);
    const qPrice = await revenue.QUERY_PRICE();
    queryPrice = qPrice;
  }

  return {
    tokenId,
    amount,
    sharePriceWei: sharePrice?.toString() ?? null,
    buySharesCostWei: buySharesCost?.toString() ?? null,
    queryPriceWei: queryPrice.toString(),
  };
}

export function buildBuySharesTx(tokenId: number, amount: number, valueWei: string) {
  if (!process.env.CONTRACT_MARKETPLACE) throw new Error("CONTRACT_MARKETPLACE not set");
  return {
    to: process.env.CONTRACT_MARKETPLACE,
    value: valueWei,
    data: marketplaceInterface.encodeFunctionData("buyShares", [tokenId, amount]),
  };
}

export function buildExecuteQueryTx(tokenId: number, valueWei: string) {
  if (!process.env.CONTRACT_MARKETPLACE) throw new Error("CONTRACT_MARKETPLACE not set");
  return {
    to: process.env.CONTRACT_MARKETPLACE,
    value: valueWei,
    data: marketplaceInterface.encodeFunctionData("executeQuery", [tokenId]),
  };
}

export async function verifyQuerySettlement(
  tokenId: number,
  userAddress: string,
  txHash: string
) {
  if (!process.env.CONTRACT_MARKETPLACE) {
    return { ok: false, error: "CONTRACT_MARKETPLACE not set" };
  }

  if (!ethers.isAddress(userAddress)) {
    return { ok: false, error: "Invalid userAddress" };
  }

  const provider = getProvider();
  const tx = await provider.getTransaction(txHash);
  if (!tx) return { ok: false, error: "Settlement transaction not found" };

  const marketplaceAddress = ethers.getAddress(process.env.CONTRACT_MARKETPLACE);
  if (!tx.to || ethers.getAddress(tx.to) !== marketplaceAddress) {
    return { ok: false, error: "Settlement transaction target is not the marketplace" };
  }

  if (ethers.getAddress(tx.from) !== ethers.getAddress(userAddress)) {
    return { ok: false, error: "Settlement transaction sender does not match userAddress" };
  }

  try {
    const parsed = marketplaceInterface.parseTransaction({ data: tx.data, value: tx.value });
    if (!parsed || parsed.name !== "executeQuery" || Number(parsed.args[0]) !== tokenId) {
      return { ok: false, error: "Settlement transaction is not executeQuery(tokenId)" };
    }
  } catch {
    return { ok: false, error: "Unable to decode settlement transaction" };
  }

  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) return { ok: false, error: "Settlement transaction is not confirmed yet" };
  if (receipt.status !== 1) return { ok: false, error: "Settlement transaction reverted" };

  for (const log of receipt.logs) {
    if (ethers.getAddress(log.address) !== marketplaceAddress) continue;

    try {
      const parsedLog = marketplaceInterface.parseLog(log);
      if (
        parsedLog?.name === "QueryExecuted" &&
        Number(parsedLog.args.mentorId) === tokenId &&
        ethers.getAddress(parsedLog.args.querier) === ethers.getAddress(userAddress)
      ) {
        return {
          ok: true,
          txHash,
          blockNumber: receipt.blockNumber,
          valueWei: tx.value.toString(),
        };
      }
    } catch {
      // Ignore unrelated marketplace logs.
    }
  }

  return { ok: false, error: "QueryExecuted event not found in settlement transaction" };
}

// Trigger the marketplace pay-per-query path so mentor/curator/platform revenue
// is distributed on-chain after a successful backend inference.
export async function triggerQueryRevenue(tokenId: number): Promise<string | null> {
  if (!process.env.CONTRACT_MARKETPLACE) return null;

  const signer = getOracleSigner();
  const marketplace = getMarketplaceContract(signer);
  const provider = getProvider();

  let queryPrice = ethers.parseEther(process.env.QUERY_PRICE_OG ?? "0.0005");
  if (process.env.CONTRACT_REVENUE) {
    const revenue = getRevenueContract(provider);
    queryPrice = await revenue.QUERY_PRICE();
  }

  const tx = await marketplace.executeQuery(tokenId, { value: queryPrice });
  await tx.wait();
  console.log(`[contracts] executeQuery tokenId=${tokenId} value=${queryPrice.toString()} tx=${tx.hash}`);
  return tx.hash as string;
}

// Baca metadata mentor dari on-chain
export async function getMentorMeta(tokenId: number) {
  const provider = getProvider();
  const addr = process.env.CONTRACT_INFT;
  if (!addr) throw new Error("CONTRACT_INFT not set");
  const contract = new ethers.Contract(addr, INFT_ABI, provider);
  const m = await contract.mentors(tokenId);
  return {
    creator: m.creator as string,
    storageRef: m.storageRef as string,
    name: m.name as string,
    category: m.category as string,
    confidenceScore: Number(m.confidenceScore),
    gapCount: Number(m.gapCount),
    totalQueries: Number(m.totalQueries),
    status: Number(m.status),
    lastUpdatedAt: Number(m.lastUpdatedAt),
    mintedAt: Number(m.mintedAt),
  };
}

import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

const INDEXER_URL =
  process.env.ZG_INDEXER_URL ??
  "https://indexer-storage-testnet-turbo.0g.ai";
const RPC_URL =
  process.env.ZG_RPC_URL ?? "https://evmrpc-testnet.0g.ai";

function getSigner() {
  if (!process.env.ORACLE_PRIVATE_KEY)
    throw new Error("ORACLE_PRIVATE_KEY not set");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
}

// AES-256-GCM: key di-derive dari mentorId agar tiap mentor punya enkripsi berbeda.
// Format ciphertext: [iv(12)] + [authTag(16)] + [ciphertext]
function deriveKey(mentorId: string): Buffer {
  return crypto
    .createHash("sha256")
    .update(`aimentor-${mentorId}-${process.env.ORACLE_PRIVATE_KEY ?? ""}`)
    .digest();
}

function encrypt(plaintext: string, mentorId: string): Buffer {
  const key = deriveKey(mentorId);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

function decrypt(data: Buffer, mentorId: string): string {
  const key = deriveKey(mentorId);
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}

// Upload knowledge mentor ke 0G Storage (encrypted).
// Returns rootHash yang disimpan on-chain di AIMentorINFT.storageRef
export async function uploadKnowledge(
  mentorId: string,
  content: string
): Promise<{ rootHash: string; sizeBytes: number }> {
  const indexer = new Indexer(INDEXER_URL);
  const signer = getSigner();

  const encrypted = encrypt(content, mentorId);
  const sizeBytes = encrypted.length;

  // MemData untuk upload in-memory tanpa perlu file sementara
  const memData = new MemData(new Uint8Array(encrypted));
  const [result, uploadErr] = await indexer.upload(memData, RPC_URL, signer);
  if (uploadErr) throw uploadErr;

  // upload() returns single or multi-root result depending on file size
  const rootHash = "rootHash" in result ? result.rootHash : result.rootHashes[0];
  const txHash = "txHash" in result ? result.txHash : result.txHashes[0];
  console.log(`[storage] uploaded mentorId=${mentorId} rootHash=${rootHash} tx=${txHash}`);
  return { rootHash, sizeBytes };
}

// Download dan decrypt knowledge dari 0G Storage
export async function downloadKnowledge(
  mentorId: string,
  rootHash: string
): Promise<string> {
  const indexer = new Indexer(INDEXER_URL);
  const tmpPath = path.join(
    os.tmpdir(),
    `mentor-dl-${mentorId}-${Date.now()}.bin`
  );

  try {
    const err = await indexer.download(rootHash, tmpPath, false);
    if (err) throw err;
    const data = await fs.readFile(tmpPath);
    return decrypt(data, mentorId);
  } finally {
    await fs.unlink(tmpPath).catch(() => {});
  }
}

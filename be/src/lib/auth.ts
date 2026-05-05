import { ethers } from "ethers";

const QUERY_SIGNATURE_MAX_AGE_MS = 5 * 60 * 1000;

export function buildQueryAccessMessage(params: {
  tokenId: number;
  question: string;
  userAddress: string;
  signedAt: number;
}) {
  const questionHash = ethers.keccak256(ethers.toUtf8Bytes(params.question));
  return [
    "AI Mentor Marketplace query access",
    `Token ID: ${params.tokenId}`,
    `Question Hash: ${questionHash}`,
    `User: ${ethers.getAddress(params.userAddress)}`,
    `Signed At: ${params.signedAt}`,
  ].join("\n");
}

export function verifyQueryAccessSignature(params: {
  tokenId: number;
  question: string;
  userAddress: string;
  signature: string;
  signedAt: number;
}) {
  if (!ethers.isAddress(params.userAddress)) {
    return { ok: false, error: "Invalid userAddress" };
  }

  if (!Number.isFinite(params.signedAt)) {
    return { ok: false, error: "Invalid signedAt" };
  }

  const ageMs = Math.abs(Date.now() - params.signedAt);
  if (ageMs > QUERY_SIGNATURE_MAX_AGE_MS) {
    return { ok: false, error: "Signature expired" };
  }

  try {
    const message = buildQueryAccessMessage(params);
    const recovered = ethers.verifyMessage(message, params.signature);
    const expected = ethers.getAddress(params.userAddress);

    if (ethers.getAddress(recovered) !== expected) {
      return { ok: false, error: "Signature signer does not match userAddress" };
    }

    return { ok: true, signer: expected };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

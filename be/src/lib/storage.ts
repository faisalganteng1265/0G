import { SealClient, SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex, toHex } from "@mysten/sui/utils";
import { WalrusClient } from "@mysten/walrus";
import { CONFIG_ID, getClient, getOracleKeypair, PACKAGE_ID } from "./sui";

const WALRUS_EPOCHS = Number(process.env.WALRUS_EPOCHS ?? "5");
const SEAL_THRESHOLD = Number(process.env.SEAL_THRESHOLD ?? "1");
const SEAL_KEY_SERVER_IDS = (process.env.SEAL_KEY_SERVER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

let sealClient: SealClient | null = null;
function getSealClient(): SealClient {
  if (!sealClient) {
    sealClient = new SealClient({
      suiClient: getClient(),
      serverConfigs: SEAL_KEY_SERVER_IDS.map((objectId) => ({ objectId, weight: 1 })),
      verifyKeyServers: false,
    });
  }
  return sealClient;
}

let walrusClient: WalrusClient | null = null;
function getWalrusClient(): WalrusClient {
  if (!walrusClient) {
    const network = (process.env.SUI_NETWORK ?? "testnet") as "testnet" | "mainnet";
    walrusClient = new WalrusClient({ network, suiClient: getClient() });
  }
  return walrusClient;
}

// Seal identity is namespaced to the mentor's `MentorState` object id, so
// each mentor's knowledge has an independent on-chain access policy (see
// sc/sources/seal_policy.move's `seal_approve`) instead of a shared AES key.
function sealIdForState(stateId: string): Uint8Array {
  return fromHex(stateId.startsWith("0x") ? stateId.slice(2) : stateId);
}

// Encrypts via Seal (decryption gated by the mentor's on-chain share/oracle/
// allow-list policy, not by a key the backend hands out) then stores the
// ciphertext on Walrus. Returns the blob id anchored on-chain via
// `oracleUpdateBlobId`.
export async function uploadKnowledge(
  stateId: string,
  content: string
): Promise<{ blobId: string; sizeBytes: number }> {
  const plaintext = new TextEncoder().encode(content);
  const { encryptedObject } = await getSealClient().encrypt({
    threshold: SEAL_THRESHOLD,
    packageId: PACKAGE_ID,
    id: toHex(sealIdForState(stateId)),
    data: plaintext,
  });

  const { blobId } = await getWalrusClient().writeBlob({
    blob: encryptedObject,
    deletable: true,
    epochs: WALRUS_EPOCHS,
    signer: getOracleKeypair(),
  });

  return { blobId, sizeBytes: encryptedObject.length };
}

// Downloads the ciphertext from Walrus and asks Seal's key-servers to
// decrypt it under the backend's own oracle session — approved via the
// oracle-bypass branch of `seal_approve` (see sc/sources/seal_policy.move).
export async function downloadKnowledge(
  stateId: string,
  sharePoolId: string,
  blobId: string
): Promise<string> {
  const ciphertext = await getWalrusClient().readBlob({ blobId });

  const sessionKey = await SessionKey.create({
    address: getOracleKeypair().toSuiAddress(),
    packageId: PACKAGE_ID,
    ttlMin: 10,
    suiClient: getClient(),
  });
  const { signature } = await getOracleKeypair().signPersonalMessage(sessionKey.getPersonalMessage());
  sessionKey.setPersonalMessageSignature(signature);

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::seal_policy::seal_approve`,
    arguments: [
      tx.pure.vector("u8", Array.from(sealIdForState(stateId))),
      tx.object(stateId),
      tx.object(sharePoolId),
      tx.object(CONFIG_ID),
    ],
  });
  const txBytes = await tx.build({ client: getClient(), onlyTransactionKind: true });

  const plaintext = await getSealClient().decrypt({ data: ciphertext, sessionKey, txBytes });
  return new TextDecoder().decode(plaintext);
}

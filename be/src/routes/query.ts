import { Router, Request, Response } from "express";
import { z } from "zod";
import { downloadKnowledge } from "../lib/storage";
import { runInference } from "../lib/compute";
import { verifyQueryAccessSignature } from "../lib/auth";
import {
  checkQueryAccess,
  getMentorMeta,
  incrementGap,
  recordQuery,
  triggerQueryRevenue,
  updateConfidence,
  verifyQuerySettlement,
} from "../lib/contracts";

const router = Router();
const consumedSettlementTxs = new Set<string>();

const QueryBody = z.object({
  tokenId: z.coerce.number().int().nonnegative(),
  question: z.string().min(1).max(2000),
  userAddress: z.string().optional(),
  signature: z.string().optional(),
  signedAt: z.coerce.number().int().optional(),
  settlementTxHash: z.string().optional(),
});

// POST /query
// Body JSON: { tokenId, question, userAddress, signature, signedAt, settlementTxHash }
// Flow: get storageRef on-chain → verify subscription/share access → download from 0G Storage
// → TEE inference via 0G Compute → distribute revenue → update confidence on-chain
// → return answer + TEE proof
router.post("/", async (req: Request, res: Response) => {
  const parsed = QueryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { tokenId, question, userAddress, signature, signedAt, settlementTxHash } = parsed.data;

  try {
    // 1. Fetch mentor metadata dari on-chain (kalau contract belum deploy, gunakan mock)
    let mentorMeta: Awaited<ReturnType<typeof getMentorMeta>>;
    if (process.env.CONTRACT_INFT) {
      mentorMeta = await getMentorMeta(tokenId);
    } else {
      mentorMeta = {
        creator: "0x0000000000000000000000000000000000000000",
        storageRef: process.env.DEMO_STORAGE_REF ?? "",
        name: `AI Mentor #${tokenId}`,
        category: "General",
        confidenceScore: 80,
        gapCount: 0,
        totalQueries: 0,
        status: 2, // READY
        lastUpdatedAt: Math.floor(Date.now() / 1000),
        mintedAt: Math.floor(Date.now() / 1000),
      };
    }

    if (!mentorMeta.storageRef) {
      res.status(404).json({ error: "Mentor has no knowledge uploaded yet" });
      return;
    }

    // 2. Verify wallet ownership before trusting userAddress from the client.
    const signatureRequired =
      Boolean(process.env.CONTRACT_MARKETPLACE || process.env.CONTRACT_ACCESS_SHARES || process.env.CONTRACT_REVENUE) &&
      process.env.REQUIRE_QUERY_SIGNATURE !== "false";

    if (signatureRequired) {
      if (!userAddress || !signature || !signedAt) {
        res.status(401).json({
          error: "Missing query signature. Sign the query access message before calling /query.",
        });
        return;
      }

      const verified = verifyQueryAccessSignature({
        tokenId,
        question,
        userAddress,
        signature,
        signedAt,
      });

      if (!verified.ok) {
        res.status(401).json({ error: verified.error });
        return;
      }
    }

    // 3. Gate query execution by on-chain access: active subscription or shares.
    const access = await checkQueryAccess(tokenId, userAddress);
    if (!access.hasAccess) {
      res.status(403).json({
        error: "Query access denied. Buy shares or subscribe before querying this mentor.",
        access,
      });
      return;
    }

    // 4. Verify user-paid settlement before spending compute.
    //    FE should send a marketplace.executeQuery(tokenId) transaction first.
    const settlementRequired =
      Boolean(process.env.CONTRACT_MARKETPLACE) &&
      process.env.REQUIRE_QUERY_SETTLEMENT !== "false";

    let revenueTxHash: string | null = null;
    let revenueRecordedQuery = false;

    if (settlementRequired) {
      if (!userAddress || !settlementTxHash) {
        res.status(402).json({
          error: "Missing settlementTxHash. Execute /market/tx/execute-query with the user wallet before calling /query.",
        });
        return;
      }

      const normalizedSettlementTxHash = settlementTxHash.toLowerCase();
      if (consumedSettlementTxs.has(normalizedSettlementTxHash)) {
        res.status(409).json({ error: "Settlement transaction has already been used" });
        return;
      }

      const settlement = await verifyQuerySettlement(tokenId, userAddress, settlementTxHash);
      if (!settlement.ok) {
        res.status(402).json({ error: settlement.error });
        return;
      }

      consumedSettlementTxs.add(normalizedSettlementTxHash);
      revenueTxHash = settlementTxHash;
      revenueRecordedQuery = true;
    }

    const mentorId = `${tokenId}`;

    // 5. Download & decrypt knowledge dari 0G Storage
    const knowledgeContext = await downloadKnowledge(mentorId, mentorMeta.storageRef);

    // 6. Jalankan inference di 0G Compute (TEE mode)
    const result = await runInference(question, knowledgeContext, mentorMeta.name);

    // 7. Hitung confidence berdasarkan panjang jawaban dan TEE verification
    //    Ini simplified oracle logic — di production pakai retrieval score dari RAG
    const hasAnswer = result.answer.length > 50;
    const signalsLowConfidence =
      result.answer.toLowerCase().includes("i don't know") ||
      result.answer.toLowerCase().includes("not enough information") ||
      result.answer.toLowerCase().includes("knowledge base does not contain");

    const newConfidence = signalsLowConfidence ? 30 : hasAnswer ? 85 : 50;

    // 8. Trigger marketplace revenue distribution on-chain when settlement is not user-paid.
    //    executeQuery() also records the query count, so avoid recordQuery() twice.
    if (process.env.CONTRACT_MARKETPLACE && !settlementRequired) {
      try {
        revenueTxHash = await triggerQueryRevenue(tokenId);
        revenueRecordedQuery = Boolean(revenueTxHash);
      } catch (err) {
        console.error("[query] revenue distribution failed:", err);
        if (process.env.REQUIRE_QUERY_REVENUE !== "false") {
          res.status(502).json({
            error: "Inference succeeded, but on-chain revenue distribution failed",
            detail: String(err),
          });
          return;
        }
      }
    }

    // 9. Push oracle updates on-chain (fire-and-forget agar tidak delay response)
    if (process.env.CONTRACT_INFT) {
      Promise.all([
        revenueRecordedQuery ? Promise.resolve() : recordQuery(tokenId),
        updateConfidence(tokenId, newConfidence),
        signalsLowConfidence ? incrementGap(tokenId) : Promise.resolve(),
      ]).catch((err) => console.error("[query] oracle update failed:", err));
    }

    res.json({
      ok: true,
      answer: result.answer,
      teeVerified: result.teeVerified,
      chatId: result.chatId,
      providerAddress: result.providerAddress,
      model: result.model,
      mentor: {
        tokenId,
        name: mentorMeta.name,
        category: mentorMeta.category,
        storageRef: mentorMeta.storageRef,
      },
      access,
      revenue: {
        txHash: revenueTxHash,
        recordedQuery: revenueRecordedQuery,
      },
      oracle: {
        confidenceUpdated: newConfidence,
        gapFlagged: signalsLowConfidence,
      },
    });
  } catch (err) {
    console.error("[query] error:", err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;

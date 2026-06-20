import { Router, Request, Response } from "express";
import { z } from "zod";
import { downloadKnowledge } from "../lib/storage.js";
import { NO_KNOWLEDGE_TAG, runInference } from "../lib/compute.js";
import { recallMemory, rememberExchange } from "../lib/memory.js";
import {
  checkQueryAccess,
  getMentorState,
  oracleIncrementGap,
  oracleRecordQuery,
  oracleUpdateConfidence,
  verifyQuerySettlement,
} from "../lib/sui.js";

const router = Router();
const consumedSettlementTxs = new Set<string>();

const QueryBody = z.object({
  stateId: z.string().regex(/^0x[0-9a-fA-F]+$/),
  question: z.string().min(1).max(2000),
  settlementTxDigest: z.string().min(1),
});

// POST /query
// Body JSON: { stateId, question, settlementTxDigest }
// Flow: verify on-chain settlement (this also proves who the querier is and
// that they hold shares, since `marketplace::execute_query` gates on share
// balance) -> download + Seal-decrypt knowledge from Walrus -> Atoma TEE
// inference -> push confidence/gap/query-count updates on-chain.
router.post("/", async (req: Request, res: Response) => {
  const parsed = QueryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { stateId, question, settlementTxDigest } = parsed.data;

  try {
    const mentorState = await getMentorState(stateId);
    if (!mentorState.blobId) {
      res.status(404).json({ error: "Mentor has no knowledge uploaded yet" });
      return;
    }

    // 1. Verify settlement: derives the real querier address from the tx
    //    itself and confirms `execute_query` succeeded against this mentor.
    const normalizedDigest = settlementTxDigest.toLowerCase();
    if (consumedSettlementTxs.has(normalizedDigest)) {
      res.status(409).json({ error: "Settlement transaction has already been used" });
      return;
    }
    const settlement = await verifyQuerySettlement(stateId, settlementTxDigest);
    if (!settlement.ok || !settlement.userAddress) {
      res.status(402).json({ error: settlement.error });
      return;
    }
    consumedSettlementTxs.add(normalizedDigest);

    // 2. Defense-in-depth share check (the real gate already happened
    //    on-chain inside `execute_query`, and again at Seal's key-servers).
    const access = await checkQueryAccess(stateId, settlement.userAddress);
    if (!access.hasAccess) {
      res.status(403).json({ error: "Query access denied. Buy shares before querying this mentor.", access });
      return;
    }

    // 3. Download + Seal-decrypt knowledge from Walrus.
    const knowledgeContext = await downloadKnowledge(stateId, mentorState.sharePoolId, mentorState.blobId);

    // 3b. Recall past exchanges between this specific querier and this
    // mentor (Walrus Memory / MemWal) — durable, cross-session memory, not
    // just a one-shot knowledge-base lookup.
    const memoryContext = await recallMemory(stateId, settlement.userAddress, question);

    // 4. Run inference inside an Atoma confidential-compute (TEE) node.
    const result = await runInference(question, knowledgeContext, "Mentor", memoryContext);

    // 5. Confidence scoring: the model is instructed to lead with a literal
    //    tag (not an English phrase) when it can't answer confidently, so
    //    this works regardless of what language it replies in.
    const signalsLowConfidence = result.answer.trim().startsWith(NO_KNOWLEDGE_TAG);
    const displayAnswer = signalsLowConfidence
      ? result.answer.replace(NO_KNOWLEDGE_TAG, "").trim()
      : result.answer;
    const hasAnswer = displayAnswer.length > 50;
    const newConfidence = signalsLowConfidence ? 30 : hasAnswer ? 85 : 50;

    // 6. Fire-and-forget oracle writes — don't delay the response on these.
    // Sequential, not Promise.all: each call submits a tx that mutates the
    // owned OracleCap object, and Sui rejects concurrent txs that lock the
    // same object version ("already locked by a different transaction").
    (async () => {
      await oracleRecordQuery(stateId);
      await oracleUpdateConfidence(stateId, newConfidence);
      if (signalsLowConfidence) await oracleIncrementGap(stateId);
    })().catch((err) => console.error("[query] oracle update failed:", err));

    // Fire-and-forget memory write — store this exchange for next time.
    rememberExchange(stateId, settlement.userAddress, question, displayAnswer);

    res.json({
      ok: true,
      answer: displayAnswer,
      teeVerified: result.teeVerified,
      chatId: result.chatId,
      model: result.model,
      mentor: { stateId, blobId: mentorState.blobId },
      access,
      settlement: { txDigest: settlementTxDigest, querier: settlement.userAddress },
      oracle: { confidenceUpdated: newConfidence, gapFlagged: signalsLowConfidence },
      memory: { recalled: memoryContext.length > 0 },
    });
  } catch (err) {
    console.error("[query] error:", err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;

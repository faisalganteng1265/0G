import { Router, Request, Response } from "express";
import { z } from "zod";
import { updateConfidence, incrementGap, resolveGap, signTransferProof, signCloneProof } from "../lib/contracts";
import { getKnowledgeKeyBytes } from "../lib/storage";
import { listServices } from "../lib/compute";

const router = Router();

const TokenBody = z.object({ tokenId: z.coerce.number().int().nonnegative() });

const ConfidenceBody = TokenBody.extend({
  score: z.coerce.number().int().min(0).max(100),
});

// GET /oracle/services — list semua service yang tersedia di 0G Compute
router.get("/services", async (_req: Request, res: Response) => {
  try {
    const services = await listServices();
    res.json({ ok: true, services });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /oracle/confidence — manual update confidence score on-chain
router.post("/confidence", async (req: Request, res: Response) => {
  const parsed = ConfidenceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const txHash = await updateConfidence(parsed.data.tokenId, parsed.data.score);
    res.json({ ok: true, txHash });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /oracle/gap/increment — flag blind spot baru
router.post("/gap/increment", async (req: Request, res: Response) => {
  const parsed = TokenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const txHash = await incrementGap(parsed.data.tokenId);
    res.json({ ok: true, txHash });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /oracle/gap/resolve — mark gap sebagai resolved setelah mentor update knowledge
router.post("/gap/resolve", async (req: Request, res: Response) => {
  const parsed = TokenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const txHash = await resolveGap(parsed.data.tokenId);
    res.json({ ok: true, txHash });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /oracle/sign-transfer
// FE panggil ini sebelum SC transfer() untuk dapat sealedKey + proof dari oracle.
// Body: { mentorId: string, tokenId: number, from: string, to: string }
const SignTransferBody = z.object({
  mentorId: z.string().min(1),
  tokenId: z.coerce.number().int().nonnegative(),
  from: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  to: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
});

router.post("/sign-transfer", async (req: Request, res: Response) => {
  const parsed = SignTransferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const { mentorId, tokenId, from, to } = parsed.data;
    const sealedKey = getKnowledgeKeyBytes(mentorId);
    const proof = await signTransferProof(from, to, tokenId, sealedKey);
    res.json({ ok: true, sealedKey: "0x" + sealedKey.toString("hex"), proof });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /oracle/sign-clone
// FE panggil ini sebelum SC clone() untuk dapat sealedKey + proof dari oracle.
// Body: { mentorId: string, tokenId: number, to: string }
const SignCloneBody = z.object({
  mentorId: z.string().min(1),
  tokenId: z.coerce.number().int().nonnegative(),
  to: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
});

router.post("/sign-clone", async (req: Request, res: Response) => {
  const parsed = SignCloneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const { mentorId, tokenId, to } = parsed.data;
    const sealedKey = getKnowledgeKeyBytes(mentorId);
    const proof = await signCloneProof(to, tokenId, sealedKey);
    res.json({ ok: true, sealedKey: "0x" + sealedKey.toString("hex"), proof });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;

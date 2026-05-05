import { Router, Request, Response } from "express";
import { z } from "zod";
import { ethers } from "ethers";
import { buildQueryAccessMessage } from "../lib/auth";
import {
  buildBuySharesTx,
  buildExecuteQueryTx,
  buildSubscribeTx,
  getMarketAccess,
  getMarketQuote,
} from "../lib/contracts";

const router = Router();

const TokenQuery = z.object({
  tokenId: z.coerce.number().int().nonnegative(),
});

const AddressQuery = TokenQuery.extend({
  userAddress: z.string().refine((value) => ethers.isAddress(value), "Invalid userAddress"),
});

const QuoteQuery = TokenQuery.extend({
  amount: z.coerce.number().int().positive().default(1),
});

const QueryMessageBody = z.object({
  tokenId: z.coerce.number().int().nonnegative(),
  question: z.string().min(1).max(2000),
  userAddress: z.string().refine((value) => ethers.isAddress(value), "Invalid userAddress"),
  signedAt: z.coerce.number().int().optional(),
});

const SubscribeTxBody = TokenQuery.extend({
  valueWei: z.string().regex(/^\d+$/).optional(),
});

const BuySharesTxBody = TokenQuery.extend({
  amount: z.coerce.number().int().positive(),
  valueWei: z.string().regex(/^\d+$/).optional(),
});

// POST /market/query-message
// FE signs this exact message, then sends signature + signedAt to POST /query.
router.post("/query-message", (req: Request, res: Response) => {
  const parsed = QueryMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const signedAt = parsed.data.signedAt ?? Date.now();
  const message = buildQueryAccessMessage({ ...parsed.data, signedAt });
  res.json({ ok: true, message, signedAt });
});

// GET /market/access?tokenId=0&userAddress=0x...
router.get("/access", async (req: Request, res: Response) => {
  const parsed = AddressQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const access = await getMarketAccess(parsed.data.tokenId, parsed.data.userAddress);
    res.json({ ok: true, access });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /market/quote?tokenId=0&amount=10
router.get("/quote", async (req: Request, res: Response) => {
  const parsed = QuoteQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const quote = await getMarketQuote(parsed.data.tokenId, parsed.data.amount);
    res.json({ ok: true, quote });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /market/tx/subscribe
// Returns tx payload for FE wallet.sendTransaction(tx).
router.post("/tx/subscribe", async (req: Request, res: Response) => {
  const parsed = SubscribeTxBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const quote = await getMarketQuote(parsed.data.tokenId, 1);
    const valueWei = parsed.data.valueWei ?? quote.subscriptionPriceWei;
    res.json({ ok: true, tx: buildSubscribeTx(parsed.data.tokenId, valueWei), quote });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /market/tx/buy-shares
// Returns tx payload for FE wallet.sendTransaction(tx).
router.post("/tx/buy-shares", async (req: Request, res: Response) => {
  const parsed = BuySharesTxBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const quote = await getMarketQuote(parsed.data.tokenId, parsed.data.amount);
    if (!quote.buySharesCostWei) {
      res.status(500).json({ error: "CONTRACT_ACCESS_SHARES is required to quote buy shares" });
      return;
    }

    const valueWei = parsed.data.valueWei ?? quote.buySharesCostWei;
    res.json({
      ok: true,
      tx: buildBuySharesTx(parsed.data.tokenId, parsed.data.amount, valueWei),
      quote,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /market/tx/execute-query
// Optional FE-driven settlement tx. Backend /query can still settle after inference.
router.post("/tx/execute-query", async (req: Request, res: Response) => {
  const parsed = SubscribeTxBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const quote = await getMarketQuote(parsed.data.tokenId, 1);
    const valueWei = parsed.data.valueWei ?? quote.queryPriceWei;
    res.json({ ok: true, tx: buildExecuteQueryTx(parsed.data.tokenId, valueWei), quote });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;

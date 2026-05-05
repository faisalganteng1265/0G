import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { uploadKnowledge } from "../lib/storage";
import { updateStorageRef } from "../lib/contracts";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const UploadBody = z.object({
  mentorId: z.string().min(1),
  tokenId: z.coerce.number().int().nonnegative(),
});

// POST /upload
// Form-data: mentorId (string), tokenId (number), file (binary) atau text (string)
// Encrypt → upload ke 0G Storage → simpan rootHash on-chain
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  const parsed = UploadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { mentorId, tokenId } = parsed.data;

  // Terima file binary atau plain text di body
  let content: string;
  if (req.file) {
    content = req.file.buffer.toString("utf8");
  } else if (typeof req.body.text === "string" && req.body.text.length > 0) {
    content = req.body.text;
  } else {
    res.status(400).json({ error: "Provide either a file or text field" });
    return;
  }

  try {
    // 1. Encrypt + upload ke 0G Storage
    const { rootHash, sizeBytes } = await uploadKnowledge(mentorId, content);

    // 2. Simpan rootHash on-chain di AIMentorINFT (initial confidence = 50)
    //    Kalau contract belum deploy, lewati dan tetap return rootHash
    let txHash: string | null = null;
    if (process.env.CONTRACT_INFT) {
      txHash = await updateStorageRef(tokenId, rootHash, 50);
    }

    res.json({
      ok: true,
      rootHash,
      sizeBytes,
      txHash,
      message: `Knowledge uploaded to 0G Storage. rootHash stored${txHash ? " on-chain" : " (contract not set)"}.`,
    });
  } catch (err) {
    console.error("[upload] error:", err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;

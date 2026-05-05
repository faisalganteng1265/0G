import "dotenv/config";
import express from "express";
import cors from "cors";
import uploadRouter from "./routes/upload";
import queryRouter from "./routes/query";
import oracleRouter from "./routes/oracle";
import marketRouter from "./routes/market";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/upload", uploadRouter);
app.use("/query", queryRouter);
app.use("/oracle", oracleRouter);
app.use("/market", marketRouter);

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] endpoints:`);
  console.log(`  POST /upload          — upload knowledge ke 0G Storage`);
  console.log(`  POST /query           — TEE inference via 0G Compute`);
  console.log(`  GET  /market/access   — check subscription/share access`);
  console.log(`  GET  /market/quote    — subscription/share/query prices`);
  console.log(`  POST /market/query-message`);
  console.log(`  POST /market/tx/subscribe`);
  console.log(`  POST /market/tx/buy-shares`);
  console.log(`  GET  /oracle/services — list 0G Compute services`);
  console.log(`  POST /oracle/confidence`);
  console.log(`  POST /oracle/gap/increment`);
  console.log(`  POST /oracle/gap/resolve`);
});

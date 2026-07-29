import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { c402Middleware, spentCache } from './middleware/c402.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY || "";
const PAYOUT_ADDRESS = process.env.PAYOUT_ADDRESS;
const CARDANO_NETWORK = "preprod";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const BLOCKFROST_API_URL = "https://cardano-preprod.blockfrost.io/api/v0";

if (!PAYOUT_ADDRESS) {
  console.error("[C402] PAYOUT_ADDRESS is required in backend/.env");
  process.exit(1);
}

app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: [
    'X-C402-Price', 'X-C402-Address', 'X-C402-Reference', 'X-C402-Network',
    'x-c402-price', 'x-c402-address', 'x-c402-reference', 'x-c402-network'
  ]
}));
app.use(express.json());

console.log("----------------------------------------------------------------");
console.log("[C402 Gateway Startup Diagnostics]");
console.log(BLOCKFROST_KEY ? "✓ BLOCKFROST_KEY configured" : "⚠ BLOCKFROST_KEY missing: protected requests return 503");
console.log(`✓ Merchant payout address: ${PAYOUT_ADDRESS}`);
console.log(`✓ Cardano network: ${CARDANO_NETWORK}`);
console.log("----------------------------------------------------------------");

const gatewayConfig = {
  blockfrostProjectId: BLOCKFROST_KEY,
  developerAddress: PAYOUT_ADDRESS,
  priceLovelaces: 1000000
};

const withReceipt = (res, payload) => ({
  status: "Success",
  timestamp: new Date().toISOString(),
  receipt: res.locals.receipt,
  payload
});

app.get('/api/v1/generate-code', c402Middleware(gatewayConfig), async (req, res) => {
  const userCerebrasKey = req.headers['x-cerebras-key'] || process.env.CEREBRAS_KEY;
  if (!userCerebrasKey) {
    return res.status(503).json({ error: "Service Unavailable", message: "CEREBRAS_KEY is required for live AI responses." });
  }

  try {
    const response = await axios.post("https://api.cerebras.ai/v1/chat/completions", {
      model: "llama-3.3-70b",
      messages: [
        { role: "system", content: "You are an expert Cardano smart contract assistant. Output ONLY raw Aiken code." },
        { role: "user", content: req.query.prompt || "Write a secure Cardano Aiken validator script for payment verification." }
      ],
      temperature: 0.2,
      max_tokens: 400
    }, { headers: { Authorization: `Bearer ${userCerebrasKey}`, "Content-Type": "application/json" } });

    return res.json(withReceipt(res, {
      language: "Aiken",
      module: "payment_escrow",
      code: response.data.choices[0].message.content.trim()
    }));
  } catch (err) {
    console.error("[Cerebras Error]:", err.message);
    return res.status(502).json({ error: "Bad Gateway", message: "Cerebras AI request failed." });
  }
});

app.get('/api/v1/block-details', c402Middleware({ ...gatewayConfig, priceLovelaces: 1000000 }), async (req, res) => {
  if (!BLOCKFROST_KEY) return res.status(503).json({ error: "Service Unavailable", message: "BLOCKFROST_KEY is required." });
  try {
    const response = await axios.get(`${BLOCKFROST_API_URL}/blocks/latest`, { headers: { project_id: BLOCKFROST_KEY } });
    return res.json(withReceipt(res, {
      network: CARDANO_NETWORK,
      block_height: response.data.height,
      slot: response.data.slot,
      epoch: response.data.epoch,
      hash: response.data.hash
    }));
  } catch (err) {
    console.error("[Blockfrost Error]:", err.message);
    return res.status(502).json({ error: "Bad Gateway", message: "Blockfrost ledger request failed." });
  }
});

app.get('/api/v1/cardano/protocol-params', async (req, res) => {
  if (!BLOCKFROST_KEY) return res.status(503).json({ error: "Service Unavailable", message: "BLOCKFROST_KEY is required." });
  try {
    const response = await axios.get(`${BLOCKFROST_API_URL}/epochs/latest/parameters`, { headers: { project_id: BLOCKFROST_KEY } });
    return res.json(response.data);
  } catch (err) {
    console.error("[Protocol Params Error]:", err.message);
    return res.status(502).json({ error: "Bad Gateway", message: "Failed to fetch Cardano protocol parameters." });
  }
});

const requireAdmin = (req, res, next) => {
  if (!ADMIN_TOKEN) return res.status(503).json({ error: "Admin endpoints disabled." });
  const auth = req.headers.authorization || '';
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const a = Buffer.from(provided);
  const b = Buffer.from(ADMIN_TOKEN);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(403).json({ error: "Forbidden" });
  next();
};

app.get('/api/v1/admin/spent-cache', requireAdmin, (req, res) => {
  res.json({ spentHashes: Array.from(spentCache), count: spentCache.size });
});

app.delete('/api/v1/admin/spent-cache', requireAdmin, (req, res) => {
  spentCache.clear();
  res.json({ status: "Success", message: "Spent cache cleared." });
});

app.listen(PORT, () => {
  console.log(`[C402 Gateway] Express server active at http://localhost:${PORT}`);
});

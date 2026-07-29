import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { c402Middleware, spentCache } from './middleware/c402.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions = {
  origin: true,
  credentials: true,
  exposedHeaders: [
    'X-C402-Price', 'X-C402-Address', 'X-C402-Reference', 'X-C402-Status',
    'x-c402-price', 'x-c402-address', 'x-c402-reference', 'x-c402-status'
  ]
};

app.use(cors(corsOptions));
app.use(express.json());

const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY || "";
const PAYOUT_ADDRESS = process.env.PAYOUT_ADDRESS || "addr_test1qrf9x2y4u9asqpwldjge937cnu2c7d9bc029ac1bf58cd";
const CARDANO_NETWORK = process.env.CARDANO_NETWORK || "preprod";
const BLOCKFROST_API_URL = "https://cardano-preprod.blockfrost.io/api/v0";

console.log("----------------------------------------------------------------");
console.log("[C402 Gateway Startup Diagnostics]");
if (!BLOCKFROST_KEY) {
  console.warn("⚠ [WARNING] BLOCKFROST_KEY is not defined in .env!");
  console.warn("  Requests with payment proofs will be rejected until BLOCKFROST_KEY is configured.");
} else {
  console.log("✓ BLOCKFROST_KEY config loaded successfully.");
}
console.log(`✓ Merchant payout address: ${PAYOUT_ADDRESS}`);
console.log("----------------------------------------------------------------");

const gatewayConfig = {
  blockfrostProjectId: BLOCKFROST_KEY,
  developerAddress: PAYOUT_ADDRESS,
  priceLovelaces: 100000 // 0.1 ADA
};

// Route A: Live Llama-3 Coder API
app.get('/api/v1/generate-code', c402Middleware(gatewayConfig), async (req, res) => {
  const userCerebrasKey = req.headers['x-cerebras-key'] || process.env.CEREBRAS_KEY;
  const prompt = req.query.prompt || "Write a secure Cardano Aiken validator script for payment verification.";

  if (!userCerebrasKey) {
    return res.json({
      status: "Success (Boilerplate Fallback)",
      timestamp: new Date().toISOString(),
      payload: {
        language: "Aiken",
        module: "payment_escrow",
        code: `validator {\n  fn authorize(datum: RefId, ctx: ScriptContext) {\n    list.has(ctx.transaction.inputs, datum)\n  }\n}`
      }
    });
  }

  try {
    const response = await axios.post("https://api.cerebras.ai/v1/chat/completions", {
      model: "llama-3.3-70b",
      messages: [
        { role: "system", content: "You are an expert Cardano smart contract assistant. Output ONLY the raw Aiken contract code, no explanations, no markdown formatting." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 400
    }, {
      headers: {
        "Authorization": `Bearer ${userCerebrasKey}`,
        "Content-Type": "application/json"
      }
    });

    const aiCode = response.data.choices[0].message.content.trim();

    res.json({
      status: "Success (Live Cerebras Llama-3)",
      timestamp: new Date().toISOString(),
      payload: {
        language: "Aiken",
        module: "payment_escrow",
        code: aiCode
      }
    });
  } catch (err) {
    console.error("[Cerebras Backend Error]:", err.message);
    res.status(500).json({ error: "Gateway proxy failed to reach Cerebras AI." });
  }
});

// Route B: Real Cardano Ledger Block Details (Blockfrost Integration)
app.get('/api/v1/block-details', c402Middleware({ ...gatewayConfig, priceLovelaces: 50000 }), async (req, res) => {
  try {
    if (BLOCKFROST_KEY) {
      const response = await axios.get(`${BLOCKFROST_API_URL}/blocks/latest`, {
        headers: { 'project_id': BLOCKFROST_KEY }
      });
      
      return res.json({
        status: "Success (Live Ledger Data)",
        timestamp: new Date().toISOString(),
        payload: {
          network: CARDANO_NETWORK,
          block_height: response.data.height,
          slot: response.data.slot,
          epoch: response.data.epoch,
          hash: response.data.hash
        }
      });
    }
  } catch (err) {
    console.warn("[Blockfrost Ledger Check Error]:", err.message);
  }

    // Boilerplate response when no Blockfrost API key is configured
    res.json({
      status: "Success (Boilerplate Fallback)",
    timestamp: new Date().toISOString(),
    payload: {
      network: "preprod",
      block_height: 1048576,
      slot: 45892010,
      active_validators: 420
    }
  });
});

// Expose Live Spent Cache list for UI synchronization
app.get('/api/v1/spent-cache', (req, res) => {
  res.json({
    spentHashes: Array.from(spentCache)
  });
});

app.delete('/api/v1/spent-cache', (req, res) => {
  spentCache.clear();
  res.json({ status: "Success", message: "Spent cache database reset." });
});

app.listen(PORT, () => {
  console.log(`[C402 Gateway] Express Proxy Server active at http://localhost:${PORT}`);
  console.log(`[C402 Gateway] Protected endpoint: GET http://localhost:${PORT}/api/v1/generate-code`);
  console.log(`[C402 Gateway] Protected endpoint: GET http://localhost:${PORT}/api/v1/block-details`);
});

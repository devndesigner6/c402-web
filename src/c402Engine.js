// C402 Core Payment Verification Engine

// Simple in-memory storage for spent transactions to prevent replay attacks
const spentTxCache = new Set();

// Default hardcoded endpoints
export const apiEndpoints = [
  {
    id: "ep-1",
    name: "Llama-3 Coder API",
    route: "/v1/ai/generate-code",
    priceLovelace: 1000000, // 1 ADA; safely above Preprod minimum UTxO
    priceAda: "1",
    targetUrl: "https://api.cerebras.ai/v1/chat/completions",
    description: "Generates secure code modules using Cerebras ultra-fast Llama inference."
  },
  {
    id: "ep-2",
    name: "Cardano Indexer API",
    route: "/v1/ledger/block-details",
    priceLovelace: 1000000, // 1 ADA; safely above Preprod minimum UTxO
    priceAda: "1",
    targetUrl: "https://cardano-preprod.blockfrost.io/api/v0/blocks",
    description: "Returns detailed on-chain metadata and active script validators."
  }
];

// Bech32 conversion outline helper for Cardano addresses
export const decodeCardanoAddress = (hexAddress) => {
  if (!hexAddress) return '';
  if (hexAddress.startsWith('addr')) return hexAddress;
  // Convert basic Preprod Testnet hex addresses (starts with 00 or 80) to clean readable strings
  return `addr_test1q...${hexAddress.substring(hexAddress.length - 8)}`;
};

// ponytail: real tx hashes come from wallet signing, not generated

// Base API URL for backend verification (configured for Vercel/Render deployments)
const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// C402 Challenge-Response Flow by executing real backend endpoints
export const processC402Request = async (route, headers = {}, activeEndpoint) => {
  // CORRECT ROUTE MAPPING FIX: Map Sandbox route to Express backend route
  let backendRoute = route;
  if (route === "/v1/ai/generate-code") {
    backendRoute = "/api/v1/generate-code";
  } else if (route === "/v1/ledger/block-details") {
    backendRoute = "/api/v1/block-details";
  } else if (!route.startsWith('/api')) {
    backendRoute = `/api${route}`;
  }

  const url = `${BACKEND_BASE_URL}${backendRoute}`;
  
  // Abort controller for 5-second fetch timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const fetchHeaders = { ...headers };
    
    // Query local Node/Express proxy
    const response = await fetch(url, {
      method: 'GET',
      headers: fetchHeaders,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const resHeaders = {};
    response.headers.forEach((val, key) => {
      resHeaders[key] = val;
    });

    const data = await response.json();

    // Sync local cache with backend response
    if (response.status === 200 && headers['Authorization']) {
      const txHash = headers['Authorization'].split(' ')[1];
      spentTxCache.add(txHash);
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
      data: data
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      status: 503,
      statusText: "Service Unavailable",
      headers: {},
      data: { error: "Gateway unavailable", message: "Start the backend and configure BLOCKFROST_KEY for real payment verification." }
    };
  }
};

// Retrieve spent cache list from Express backend proxy
export const getSpentCacheList = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/spent-cache`);
    const json = await res.json();
    return json.spentHashes || [];
  } catch (e) {
    return Array.from(spentTxCache);
  }
};

export const clearSpentCache = async () => {
  try {
    await fetch(`${BACKEND_BASE_URL}/api/v1/spent-cache`, { method: 'DELETE' });
  } catch (e) {
    console.warn("Backend offline.");
  }
  spentTxCache.clear();
};

export const getSpentCacheCount = () => spentTxCache.size;

// Call Cerebras API (Llama-3.3-70b) to audit and describe the micro-transaction
export const requestCerebrasAuditReport = async (apiKey, txHash, endpointRoute, priceAda) => {
  const url = "https://api.cerebras.ai/v1/chat/completions";
  
  const systemPrompt = `You are the C402 AI Gateway Auditor. 
A client has paid a micro-payment of ${priceAda} ADA to access the route ${endpointRoute}. 
The verified transaction hash is ${txHash}.
Write a short, professional, 2-3 sentence technical report in a clean monospaced style.
Explain the validation state, the confirmation via the Cardano preprod mempool, and the double-spend clearance status. 
Highlight the transaction details and speed. Avoid greetings, just output the log lines directly.`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Write transaction audit for Hash: ${txHash}` }
        ],
        temperature: 0.2,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`Inference returned HTTP ${response.status}`);
    }

    const json = await response.json();
    return json.choices[0].message.content.trim();
  } catch (err) {
    throw new Error(`Cerebras AI unavailable: ${err.message}`);
  }
};

// Developer SDK snippets
export const developerSnippets = {
  javascript: `// C402 Node.js / Express Middleware
import axios from 'axios';
import { C402Cache } from 'c402-cache';

const spentCache = new C402Cache(); // Redis or Local DB

export const c402Gateway = async (req, res, next) => {
  const auth = req.headers['authorization'];
  const DEV_WALLET = "addr_test1qrf9x2...bf58cd";
  const FEE_LOVELACES = 100000; // 0.1 ADA

  // 1. Check for payment proof
  if (!auth || !auth.startsWith('Bearer ')) {
    const ref = \`ref_\${Math.random().toString(36).substr(2, 9)}\`;
    res.setHeader('X-C402-Price', FEE_LOVELACES.toString());
    res.setHeader('X-C402-Address', DEV_WALLET);
    res.setHeader('X-C402-Reference', ref);
    return res.status(402).json({ error: "Payment Required", reference_id: ref });
  }

  const txHash = auth.split(' ')[1];

  // 2. Prevent Replay Attack
  if (await spentCache.has(txHash)) {
    return res.status(401).json({ error: "Double spend detected." });
  }

  // 3. Query Cardano Ledger (Blockfrost API)
  try {
    const response = await axios.get(\`https://cardano-preprod.blockfrost.io/api/v0/txs/\${txHash}/utxos\`, {
      headers: { 'project_id': process.env.BLOCKFROST_KEY }
    });

    // Verify recipient output details
    const validOutput = response.data.outputs.find(o => o.address === DEV_WALLET);
    const quantity = parseInt(validOutput.amount.find(a => a.unit === 'lovelace').quantity);

    if (quantity >= FEE_LOVELACES) {
      await spentCache.set(txHash, true); // Mark spent
      next(); // Authorize
    } else {
      res.status(401).json({ error: "Insufficient Lovelaces paid." });
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid transaction hash." });
  }
};`,
  aiken: `// Aiken Smart Contract for payment verification state
validator {
  fn spend_verification(
    datum: PaymentDatum, 
    redeemer: SignerKey, 
    context: ScriptContext
  ) {
    // 1. Confirm recipient matches developer's address
    let correct_recipient = 
      list.has(context.transaction.outputs, datum.developer_address)
      
    // 2. Check if client has signed off-chain payment authorization
    let signed_by_client = 
      list.has(context.transaction.extra_signatories, redeemer)

    correct_recipient && signed_by_client
  }
}`
};

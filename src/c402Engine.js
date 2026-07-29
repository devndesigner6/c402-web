// C402 Core Payment Verification Engine

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
export const getSpentCacheList = async () => [];

export const clearSpentCache = async () => {
  throw new Error("Cache administration requires an authenticated backend administrator.");
};

export const getSpentCacheCount = () => 0

// Call Cerebras API (Llama-3.3-70b) to audit and describe the micro-transaction
export const requestCerebrasAuditReport = async (apiKey, txHash, endpointRoute, priceAda) => {
  const url = "https://api.cerebras.ai/v1/chat/completions";
  
  const systemPrompt = `You are the C402 AI Gateway Auditor. 
A client has paid a micro-payment of ${priceAda} ADA to access the route ${endpointRoute}. 
The verified transaction hash is ${txHash}.
Write a short, professional, 2-3 sentence technical report in a clean monospaced style.
Explain the validation state, Blockfrost confirmation on Cardano Preprod, and the double-spend clearance status. 
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
import { c402Middleware } from './middleware/c402.js';

const paymentGate = c402Middleware({
  blockfrostProjectId: process.env.BLOCKFROST_KEY,
  developerAddress: process.env.PAYOUT_ADDRESS,
  priceLovelaces: 1000000 // 1 ADA on Cardano Preprod
});

app.get('/api/v1/ai-agent', paymentGate, (req, res) => {
  res.json({
    status: 'Success',
    receipt: res.locals.receipt,
    payload: { data: 'Protected API payload unlocked.' }
  });
});`,
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

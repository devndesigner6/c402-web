import crypto from 'crypto';
import axios from 'axios';

export const spentCache = new Set();
const challenges = new Map();
const BLOCKFROST_API_URL = "https://cardano-preprod.blockfrost.io/api/v0";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [reference, challenge] of challenges.entries()) {
    if (now - challenge.createdAt > CHALLENGE_TTL_MS) challenges.delete(reference);
  }
}, 60 * 1000).unref?.();

export const c402Middleware = (config) => {
  const {
    blockfrostProjectId,
    developerAddress,
    priceLovelaces
  } = config;

  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const referenceId = crypto.randomUUID();
      challenges.set(referenceId, {
        address: developerAddress,
        price: priceLovelaces,
        route: req.path,
        createdAt: Date.now()
      });

      res.setHeader('X-C402-Price', priceLovelaces.toString());
      res.setHeader('X-C402-Address', developerAddress);
      res.setHeader('X-C402-Reference', referenceId);
      res.setHeader('X-C402-Network', 'preprod');

      return res.status(402).json({
        error: "Payment Required",
        protocol: "c402-v1",
        network: "preprod",
        asset: "lovelace",
        amount: priceLovelaces,
        recipient_address: developerAddress,
        reference_id: referenceId,
        expires_in_seconds: Math.floor(CHALLENGE_TTL_MS / 1000),
        message: `Pay ${priceLovelaces / 1000000} ADA and retry with Authorization: Bearer <tx_hash>.`
      });
    }

    const txHash = authHeader.slice('Bearer '.length).trim().toLowerCase();
    const reference = req.headers['x-c402-reference'];

    try {
      if (!blockfrostProjectId) {
        return res.status(503).json({
          error: "Service Unavailable",
          message: "BLOCKFROST_KEY is required for Cardano payment verification."
        });
      }

      if (!/^[a-f0-9]{64}$/.test(txHash)) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid Cardano transaction hash format."
        });
      }

      const challenge = reference && challenges.get(reference);
      if (!challenge) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Missing, invalid, or expired C402 payment reference."
        });
      }

      if (challenge.address !== developerAddress || challenge.price !== priceLovelaces || challenge.route !== req.path) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Payment reference does not match this protected endpoint."
        });
      }

      if (spentCache.has(txHash)) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Transaction hash has already been spent. Replay attack blocked."
        });
      }

      const txResponse = await axios.get(`${BLOCKFROST_API_URL}/txs/${txHash}`, {
        headers: { 'project_id': blockfrostProjectId }
      });

      if (!txResponse.data?.block_height) {
        return res.status(425).json({
          error: "Too Early",
          message: "Transaction submitted but not indexed yet. Wait for Cardano Preprod confirmation and retry."
        });
      }

      const metadataResponse = await axios.get(`${BLOCKFROST_API_URL}/txs/${txHash}/metadata`, {
        headers: { 'project_id': blockfrostProjectId }
      });
      const c402Metadata = metadataResponse.data.find(item => item.label === '402');
      const metadata = c402Metadata?.json_metadata;
      if (metadata?.protocol !== 'c402-v1' || metadata?.reference !== reference || metadata?.recipient !== developerAddress || Number(metadata?.amount_lovelaces) !== priceLovelaces) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Transaction metadata does not match the C402 payment challenge."
        });
      }

      const utxoResponse = await axios.get(`${BLOCKFROST_API_URL}/txs/${txHash}/utxos`, {
        headers: { 'project_id': blockfrostProjectId }
      });

      const targetOutput = utxoResponse.data.outputs.find(output => output.address === developerAddress);
      if (!targetOutput) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Transaction did not pay the designated merchant address."
        });
      }

      const lovelaceEntry = targetOutput.amount.find(a => a.unit === 'lovelace');
      const amountPaid = Number(lovelaceEntry?.quantity || 0);

      if (amountPaid < priceLovelaces) {
        return res.status(401).json({
          error: "Unauthorized",
          message: `Insufficient payment amount. Expected: ${priceLovelaces} Lovelaces, Paid: ${amountPaid}.`
        });
      }

      spentCache.add(txHash);
      challenges.delete(reference);
      res.locals.receipt = {
        tx_hash: txHash,
        reference_id: reference,
        network: "preprod",
        recipient_address: developerAddress,
        amount_lovelaces: amountPaid,
        block_height: txResponse.data.block_height,
        slot: txResponse.data.slot,
        verified_at: new Date().toISOString()
      };
      next();
    } catch (err) {
      const status = err.response?.status === 404 ? 425 : 502;
      console.error("[C402 Gateway Error]:", err.message);
      return res.status(status).json({
        error: status === 425 ? "Too Early" : "Bad Gateway",
        message: status === 425
          ? "Transaction not indexed by Blockfrost yet. Wait and retry."
          : "Failed to verify transaction on Cardano Preprod."
      });
    }
  };
};

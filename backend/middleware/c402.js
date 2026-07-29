import axios from 'axios';

// Expose the spent cache set to allow administrative stats querying
export const spentCache = new Set();

const BLOCKFROST_API_URL = "https://cardano-preprod.blockfrost.io/api/v0";

export const c402Middleware = (config) => {
  const { 
    blockfrostProjectId, 
    developerAddress, 
    priceLovelaces 
  } = config;

  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // 1. Check if Authorization header is present
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const referenceId = `ref_${Math.random().toString(36).substr(2, 9)}`;
      
      // Return standard challenge response headers
      res.setHeader('X-C402-Price', priceLovelaces.toString());
      res.setHeader('X-C402-Address', developerAddress);
      res.setHeader('X-C402-Reference', referenceId);
      
      return res.status(402).json({
        error: "Payment Required",
        message: `This API endpoint requires a micro-payment of ${priceLovelaces / 1000000} ADA.`,
        price_lovelaces: priceLovelaces,
        recipient_address: developerAddress,
        reference_id: referenceId
      });
    }

    const txHash = authHeader.split(' ')[1];

    try {
      // 2. Double-Spend / Replay protection check
      if (spentCache.has(txHash)) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "Transaction hash has already been spent. Replay attack blocked." 
        });
      }

      // 3. Real Live Cardano Ledger Verification via Blockfrost
      if (!blockfrostProjectId) {
        throw new Error("Missing Blockfrost API Key configuration.");
      }

      // Fetch transaction UTXO outputs
      const response = await axios.get(`${BLOCKFROST_API_URL}/txs/${txHash}/utxos`, {
        headers: { 'project_id': blockfrostProjectId }
      });

      // Find if any output paid the developer payout address
      const targetOutput = response.data.outputs.find(
        output => output.address === developerAddress
      );

      if (!targetOutput) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "Transaction did not pay the designated merchant address." 
        });
      }

      // Extract amount paid in Lovelaces
      const amountPaid = parseInt(
        targetOutput.amount.find(a => a.unit === 'lovelace').quantity
      );

      if (amountPaid < priceLovelaces) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: `Insufficient payment amount. Expected: ${priceLovelaces} Lovelaces, Paid: ${amountPaid}.` 
        });
      }

      // 5. Success: Mark transaction as spent, forward request
      spentCache.add(txHash);
      next();
    } catch (err) {
      console.error("[C402 Gateway Error]:", err.message);
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Failed to verify transaction hash on Cardano Preprod Testnet." 
      });
    }
  };
};

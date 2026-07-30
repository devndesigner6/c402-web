# Deployment

## 1. Create production secrets

Copy `backend/.env.example` to `backend/.env` for local use. Never commit `backend/.env` or expose these values as `VITE_*` variables.

Required backend values:

- `PORT`: Render supplies this automatically; keep `8080` locally.
- `PAYOUT_ADDRESS`: your Cardano **Preprod** merchant address. Use the address that should receive payments.
- `BLOCKFROST_KEY`: a Blockfrost **Cardano Preprod** project ID.
- `CEREBRAS_KEY`: Cerebras API key for live protected AI responses.
- `ADMIN_TOKEN`: a long random token for authenticated cache administration.

### How to get the keys

- **Blockfrost:** create an account at <https://blockfrost.io>, create a Cardano Preprod project, and copy its `preprod...` project ID.
- **Cerebras:** create an account at <https://cloud.cerebras.ai>, create an API key, and keep it only on Render. The browser can supply a demo key through the Sandbox, but production should use `CEREBRAS_KEY` server-side.
- **Admin token:** generate one locally with a password manager or a random generator. Example PowerShell:

```powershell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Do not use the example payout address or placeholder keys in production.

## 2. Deploy the backend to Render

Create a **Web Service** from the GitHub repository:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment: Node
- Add `PAYOUT_ADDRESS`, `BLOCKFROST_KEY`, `CEREBRAS_KEY`, `ADMIN_TOKEN`, and `ALLOWED_ORIGINS` as environment variables. Set `ALLOWED_ORIGINS` to the exact Vercel URL, for example `https://your-project.vercel.app`.
- Render sets `PORT`; the server already reads it.

After deploy, verify:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/v1/generate-code
```

It should return `402 Payment Required`, not a fake success response. Save the Render service URL.

## 3. Deploy the frontend to Vercel

Import the same repository as a Vercel project:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com`

Do not put `BLOCKFROST_KEY`, `CEREBRAS_KEY`, `PAYOUT_ADDRESS`, or `ADMIN_TOKEN` in Vercel. Only `VITE_API_URL` belongs in the frontend deployment.

If Vercel does not rewrite SPA routes automatically, add a `vercel.json` rewrite to serve `index.html` for client-side routes.

## 4. Configure CORS

Set `ALLOWED_ORIGINS` on Render to the exact Vercel URL, for example:

```text
ALLOWED_ORIGINS=https://your-project.vercel.app
```

For local testing, include `http://localhost:5173` as a comma-separated origin. Add a custom domain only when it is known, then redeploy Render.

## 5. Test the real flow

1. Open the Vercel URL in a normal browser tab, not an iframe.
2. Install Lace or Eternl and switch it to Cardano Preprod.
3. Get test ADA from the Cardano faucet: <https://docs.cardano.org/cardano-testnet/tools/faucet>.
4. Open Sandbox and click **Call Protected API**.
5. Confirm the 402 challenge shows the merchant address and 1 ADA price.
6. Click **Submit Payment in Wallet** and approve the transaction.
7. Wait for Blockfrost indexing if the first retry returns HTTP 425.
8. Confirm the successful response contains a `receipt` with `tx_hash`, amount, block, slot, network, and `verified_at`.
9. Use the transaction hash to verify the payment on a Cardano Preprod explorer.

## 6. About a 15-minute Render cron job

A cron job is not needed to run this API. Render Web Services respond to requests; a cron job that merely wakes the service does not replace the web service and can add unnecessary cost.

If you still need a health check, use an external monitor such as UptimeRobot or Better Stack to request:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/v1/generate-code
```

Expect HTTP 402 without payment; that proves the service is alive. If using Render Cron, create a separate Cron Job with:

- Schedule: `*/15 * * * *`
- Command: `curl -fsS https://YOUR-RENDER-SERVICE.onrender.com/api/v1/generate-code || exit 1`

This is optional and should not be used to hide configuration or payment failures.

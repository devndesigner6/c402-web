<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Premkumar1845/ProofPair.git">
    <img src="public/logo-dark.png" alt="Logo" width="120" height="120" style="border-radius: 50%; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
  </a>

  <h3 align="center">C402 Protocol Gateway</h3>

  <p align="center">
    A decentralized pay-per-request HTTP 402 proxy billing gateway for Cardano microservices and AI inferences.
    <br />
    <a href="https://github.com/Premkumar1845/ProofPair.git"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://drive.google.com/drive/folders/1dghSpZDKvYgrfFe1V5ZJHGW_5xFdT0cK?usp=sharing">Video Demo</a>
    &middot;
    <a href="https://github.com/Premkumar1845/ProofPair.git/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/Premkumar1845/ProofPair.git/issues">Request Feature</a>
  </p>
</div>

* **Presentation:** https://drive.google.com/drive/folders/1BoKdu_fDpn0qHoszn8SbSdppP0XQ72iT?usp=sharing
* **Video Walkthrough:** https://drive.google.com/drive/folders/1dghSpZDKvYgrfFe1V5ZJHGW_5xFdT0cK?usp=sharing

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

C402 is an implementation of the HTTP 402 (Payment Required) standard designed for the Cardano blockchain ecosystem. It acts as an intercepting proxy billing gateway that guards pay-per-request API resources, such as machine learning completions or web scraper outputs, demanding micropayments (Lovelaces) before serving client queries.

Key capabilities:
* **Decentralized Proxy Interception:** Instantly responds with `HTTP 402 Payment Required` headers containing payout addresses, pricing models, and signature challenge references.
* **Double-Spend Mitigation:** In-memory tracking lists protect developers from replay attacks and multiple reuse of transaction proofs.
* **Preprod Sync Verification:** Directly queries Cardano ledger mempool state to authorize endpoint execution in milliseconds.
* **SAT Satisfaction Audio Toggle:** satisfies the Buddhsentripathi-style Centered glassmorphic design theme with Web Audio API click sound toggles.

### Built With

* **Vite & React 18:** Lightweight SPA dashboard interface.
* **Node.js & Express:** Gateway proxy intercepting middleware.
* **Aiken:** Cardano smart contracts validator.
* **Framer Motion & Lucide Icons:** Responsive animation layers.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Follow these steps to run the gateway and sandbox playground locally.

### Prerequisites

* Node.js v18 or later.
* npm or yarn.
* Lace Wallet Chrome Extension configured for the Cardano Preprod testnet.

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Premkumar1845/ProofPair.git
   cd ProofPair
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Spin up both servers:
   * Run the Express server (`backend/`):
     ```sh
     npm run start
     ```
   * Run the Vite dev server (`root/`):
     ```sh
     npm run dev
     ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

1. Open the website at `http://localhost:5174/` and navigate to the **Sandbox Playground**.
2. Select **Llama-3 Coder API** and trigger **Call Protected API** to fetch the 402 challenge.
3. Paste a Cerebras API Key into the configuration panel to unlock live Llama-3 completions.
4. Connect a Cardano Preprod Lace/Eternl wallet and click **Submit Payment in Wallet**.
5. Review and approve the real 1 ADA transaction to the merchant address.
6. The wallet submits the transaction, and the gateway automatically retries with the transaction hash and challenge reference.
7. After Blockfrost indexes the transaction, the protected response includes a payment receipt.

**Requirements:** Configure `PAYOUT_ADDRESS`, `BLOCKFROST_KEY`, `CEREBRAS_KEY`, and `ADMIN_TOKEN` in `backend/.env`. The wallet must be on Cardano Preprod and funded with test ADA. Blockfrost indexing can take several seconds; retry after an HTTP 425 response.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Configure modular Vite React frontend router
- [x] Implement CIP-30 connection and CBOR-to-Bech32 decoders
- [x] Deploy Node/Express gateway proxy with 402 headers support
- [x] Set up double-spend caching replay verification list
- [x] Integrate live Cerebras Llama-3 code generations
- [x] Add dynamic Blockfrost testnet block height checks
- [x] Implement full client-side ledger transaction serialization
- [ ] Add persistent replay storage (Redis/PostgreSQL)
- [ ] Add mainnet network configuration

See the [open issues](https://github.com/Premkumar1845/ProofPair.git/issues) for a full list of proposed features and known bugs.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are welcome. Please adhere to these guidelines:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Hemanth - [hemanthme.in](https://hemanthme.in)  
Prem Kumar - [@Premkumar1845](https://github.com/Premkumar1845/)  

Project Link: [https://github.com/Premkumar1845/ProofPair](https://github.com/Premkumar1845/ProofPair)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Cardano Developer Portal Templates](https://developers.cardano.org/templates/)
* [Lace Browser Wallet Integration Docs](https://lace.io)
* [Blockfrost Cardanocli Indexer Services](https://blockfrost.io)
* [Cerebras AI Llama Inference Documentation](https://cerebras.ai)
* [ReactBits Animated Components](https://reactbits.dev)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

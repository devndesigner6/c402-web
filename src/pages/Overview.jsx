import React from 'react';
import { ArrowRight, Cpu, Lock, GitBranch, Terminal, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { 
  ShinyText, 
  BlurText, 
  SpotlightCard, 
  SplitText, 
  Magnet 
} from '../components/ReactBitsComponents';
import Strands from '../components/Strands';

export default function Overview({ setCurrentPage }) {
  return (
    <>
      {/* Hero Section */}
      <section className="border-bottom-layout" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* WebGL Strands Procedural Wave Animation Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
          <Strands
            colors={["#ffde03","#7C3AED","#06B6D4"]}
            count={3}
            speed={0.4}
            amplitude={1.2}
            waviness={1.0}
            thickness={0.8}
            glow={2.5}
            taper={3}
            spread={1.2}
            intensity={0.6}
            saturation={2}
            opacity={0.35}
            scale={1.3}
            glass={false}
            refraction={1}
            dispersion={1}
            glassSize={1}
            hueShift={0}
          />
        </div>
        <div className="container-custom" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '99px', marginBottom: '24px' }}>
            <span className="badge-verified" style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '0.65rem' }}>
              <ShinyText text="CEREBRAS POWERED" speed={1.5} />
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
              C402: Pay-As-You-Use HTTP 402 API Gateway Protocol
            </span>
          </div>

          <h1 style={{ fontSize: '4.2rem', lineHeight: '1.05', maxWidth: '950px', margin: '0 auto 20px auto', letterSpacing: '-0.03em' }}>
            <SplitText text="C402: Monetize your microservices with Lovelace micropayments." />
          </h1>

          <p style={{ color: 'var(--fg-muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 36px auto', lineHeight: '1.6', fontWeight: '300' }}>
            <BlurText text="C402 intercepts API requests, issues a Payment Required challenge, and verifies real Cardano Preprod payments through Blockfrost. No subscriptions or accounts are required for the client." delay={0.01} />
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Magnet range={50}>
              <button 
                onClick={() => setCurrentPage('sandbox')} 
                className="btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 20px' }}
              >
                Launch Sandbox Playground <ArrowRight size={14} />
              </button>
            </Magnet>
            
            <Magnet range={50}>
              <button 
                onClick={() => setCurrentPage('dashboard')} 
                className="btn-secondary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 20px' }}
              >
                Open Developer Console
              </button>
            </Magnet>
          </div>
        </div>
      </section>

      {/* Value Grid Section */}
      <section className="border-bottom-layout" style={{ padding: '60px 0', backgroundColor: 'transparent' }}>
        <div className="container-custom">
          <h2 style={{ fontSize: '2.5rem', color: 'var(--fg-color)', textAlign: 'center', marginBottom: '40px' }}>
            Why charge per-call on <span className="font-serif-italic" style={{ color: 'var(--fg-muted)' }}>Cardano?</span>
          </h2>

          <div className="soldiff-grid border-layout" style={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
            
            <div className="soldiff-col-4 border-right-layout">
              <SpotlightCard style={{ padding: '32px', height: '100%' }}>
                <Cpu size={24} style={{ color: 'var(--accent-green)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '12px' }}>Sub-Cent Micropayments</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', lineHeight: '1.5' }}>
                  Credit cards charge high fixed merchant processing fees (e.g., $0.30) that make charging $0.01 per call impossible. Cardano fees are constant and predictable.
                </p>
              </SpotlightCard>
            </div>

            <div className="soldiff-col-4 border-right-layout">
              <SpotlightCard style={{ padding: '32px', height: '100%' }}>
                <Lock size={24} style={{ color: 'var(--accent-amber)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '12px' }}>Replay Protection Cache</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', lineHeight: '1.5' }}>
                  Built-in node cache indices record spent transaction hashes, ensuring clients can't submit the same payment proof twice.
                </p>
              </SpotlightCard>
            </div>

            <div className="soldiff-col-4">
              <SpotlightCard style={{ padding: '32px', height: '100%' }}>
                <GitBranch size={24} style={{ color: 'var(--accent-red)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '12px' }}>Wallet-Native Access</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', lineHeight: '1.5' }}>
                  Clients pay from their Cardano wallet instead of creating subscriptions, accounts, or prepaid API-credit balances.
                </p>
              </SpotlightCard>
            </div>

          </div>
        </div>
      </section>

      {/* Live Statistics Banner */}
      <section className="border-bottom-layout" style={{ padding: '40px 0', backgroundColor: 'transparent' }}>
        <div className="container-custom" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-numbers)' }}>
              <ShinyText text="Preprod" speed={2} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Cardano Network</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-numbers)' }}>
              <ShinyText text="1 ADA" speed={2.5} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Standard Ledger Fee</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-numbers)' }}>
              <ShinyText text="100%" speed={3} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', textTransform: 'uppercase', marginTop: '4px' }}>eUTxO Transaction Determinism</div>
          </div>

        </div>
      </section>

      {/* Protocol Architecture Workflow (Scroll down explaining section) */}
      <section className="border-bottom-layout" style={{ padding: '80px 0', backgroundColor: 'transparent' }}>
        <div className="container-custom">
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--fg-color)', marginBottom: '12px' }}>
              How the C402 Protocol <span className="font-serif-italic" style={{ color: 'var(--fg-muted)' }}>Operates</span>
            </h2>
            <p style={{ color: 'var(--fg-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
              A standard challenge-response pipeline mapped directly to Cardano ledger checkpoints and ultra-fast AI inference.
            </p>
          </div>

          <div className="soldiff-grid border-layout" style={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
            
            {/* Step 1 */}
            <div className="soldiff-col-3 border-right-layout" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-bitmap)', fontSize: '2.5rem', lineHeight: '1', fontWeight: '400' }}>01</span>
                <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Request</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: '600' }}>HTTP 402 Issued</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', lineHeight: '1.4' }}>
                Client requests a resource. Gateway proxy intercepts request and returns 402 headers detailing recipient merchant wallet, cost in Lovelaces, and UUID challenge.
              </p>
            </div>

            {/* Step 2 */}
            <div className="soldiff-col-3 border-right-layout" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-bitmap)', fontSize: '2.5rem', lineHeight: '1', fontWeight: '400' }}>02</span>
                <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Wallet</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: '600' }}>CIP-30 Payment</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', lineHeight: '1.4' }}>
                Lace or Eternl builds, signs, and submits a real ADA transaction on Cardano Preprod. The wallet returns the transaction hash for the automatic retry.
              </p>
            </div>

            {/* Step 3 */}
            <div className="soldiff-col-3 border-right-layout" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-bitmap)', fontSize: '2.5rem', lineHeight: '1', fontWeight: '400' }}>03</span>
                <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Gateway</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: '600' }}>Mempool Audit</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', lineHeight: '1.4' }}>
                Client retries with the transaction hash and challenge reference. The gateway verifies the confirmed transaction through Blockfrost and rejects reused hashes.
              </p>
            </div>

            {/* Step 4 */}
            <div className="soldiff-col-3" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-bitmap)', fontSize: '2.5rem', lineHeight: '1', fontWeight: '400' }}>04</span>
                <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>AI Release</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: '600' }}>Cerebras Llama-3</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', lineHeight: '1.4' }}>
                Verified session releases API proxy block. Real Cerebras Llama-3 inference executes code generation and returns smart contract modules instantly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Developer Terminal Integration Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'transparent' }}>
        <div className="container-custom">
          <div className="soldiff-grid border-layout" style={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
            
            {/* Left Box: Code snippets description */}
            <div className="soldiff-col-5 border-right-layout" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                <Terminal size={14} /> Zero-Friction Middleware
              </div>
              <h3 style={{ fontSize: '2.2rem', color: 'var(--fg-color)', marginBottom: '16px', lineHeight: '1.1' }}>
                Drop C402 into <span className="font-serif-italic" style={{ color: 'var(--fg-muted)' }}>any Express stack</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                C402 is packaged as an npm middleware module. It intercepts routing targets, processes ledger assertions, manages replay caches, and parses inputs in 6 lines of code.
              </p>

              <button 
                onClick={() => setCurrentPage('docs')}
                className="btn-secondary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Read Integration Specs <ArrowRight size={12} />
              </button>
            </div>

            {/* Right Box: Terminal preview */}
            <div className="soldiff-col-7" style={{ backgroundColor: 'var(--card-bg)', position: 'relative' }}>
              <SpotlightCard style={{ height: '100%', width: '100%', padding: '30px' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-red)', borderRadius: '50%' }} />
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-amber)', borderRadius: '50%' }} />
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-green)', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.65rem', color: '#555', marginLeft: '10px', fontFamily: 'var(--font-mono)' }}>c402-middleware-setup.js</span>
                </div>

                <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#a1a1aa', overflowX: 'auto', lineHeight: '1.5' }}>
                  <code>{`// Initialize API protection in 3 steps
import express from 'express';
import { c402Middleware } from 'c402-gateway-node';

const app = express();

const paymentGate = c402Middleware({
  blockfrostProjectId: process.env.BLOCKFROST_KEY,
  developerAddress: "addr_test1qrf9x2...",
  priceLovelaces: 1000000 // 1 ADA on Cardano Preprod
});

// Endpoint automatically wrapped in HTTP 402 checks!
app.get('/api/v1/ai-agent', paymentGate, (req, res) => {
  res.json({ data: "API payload unlocked successfully." });
});`}</code>
                </pre>
              </SpotlightCard>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

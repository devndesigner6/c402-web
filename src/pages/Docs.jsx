import React from 'react';
import { BookOpen, Code, Copy, Check } from 'lucide-react';
import { developerSnippets } from '../c402Engine';

export default function Docs({ codeTab, setCodeTab, copied, handleCopy }) {
  return (
    <section className="border-bottom-layout" style={{ backgroundColor: 'transparent', padding: '40px 0' }}>
      <div className="container-custom">
        
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--fg-color)', marginBottom: '8px' }}>
            Developer <span className="font-serif-italic">Documentation</span>
          </h2>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem' }}>
            Reference guides, header challenges, and Aiken validator blueprints.
          </p>
        </div>

        <div className="soldiff-grid border-layout" style={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
          
          {/* Left Side: Text Documentation */}
          <div className="soldiff-col-6 border-right-layout" style={{ padding: '32px', backgroundColor: 'rgba(255,255,255,0.001)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <BookOpen size={16} style={{ color: 'var(--fg-muted)' }} />
              <span className="font-mono-text" style={{ textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: '600' }}>C402 Protocol Specification</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--fg-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div>
                <h3 style={{ color: 'var(--fg-color)', fontSize: '1.2rem', marginBottom: '8px' }}>1. The Challenge Loop</h3>
                <p>
                  When a client requests a protected endpoint without credentials, the gateway proxy returns an <code>HTTP 402 Payment Required</code> status code along with custom headers containing the merchant address, the cost of the call in Lovelaces, and a unique reference UUID.
                </p>
              </div>

              <div>
                <h3 style={{ color: 'var(--fg-color)', fontSize: '1.2rem', marginBottom: '8px' }}>2. Build, Sign &amp; Submit</h3>
                <p>
                  The client uses a CIP-30 wallet on Cardano Preprod to build a real ADA transaction to the challenged merchant address. The wallet signs and submits it, returning a transaction hash. The client retries with <code>Authorization: Bearer [tx_hash]</code> and <code>X-C402-Reference: [reference]</code>.
                </p>
              </div>

              <div>
                <h3 style={{ color: 'var(--fg-color)', fontSize: '1.2rem', marginBottom: '8px' }}>3. Blockfrost Verification &amp; Receipt</h3>
                <p>
                  The gateway verifies the real transaction on Cardano Preprod, checks the merchant output and amount, confirms Blockfrost indexing, binds the payment to the challenge reference, and returns a receipt containing the transaction hash, block, slot, amount, and verification time. Reusing a verified hash is rejected with <code>HTTP 401 Replay Attack</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Code snippets compiler panel */}
          <div className="soldiff-col-6" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <div className="border-bottom-layout" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.005)' }}>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => setCodeTab('middleware')}
                  className="font-mono-text"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: codeTab === 'middleware' ? 'var(--fg-color)' : 'var(--fg-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: codeTab === 'middleware' ? '600' : '400',
                    borderBottom: codeTab === 'middleware' ? '1px solid var(--fg-color)' : 'none',
                    paddingBottom: '4px'
                  }}
                >
                  express-middleware.js
                </button>
                <button 
                  onClick={() => setCodeTab('aiken')}
                  className="font-mono-text"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: codeTab === 'aiken' ? 'var(--fg-color)' : 'var(--fg-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: codeTab === 'aiken' ? '600' : '400',
                    borderBottom: codeTab === 'aiken' ? '1px solid var(--fg-color)' : 'none',
                    paddingBottom: '4px'
                  }}
                >
                  c402_validator.ak
                </button>
              </div>

              <button 
                onClick={() => handleCopy(developerSnippets[codeTab])}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--fg-muted)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem'
                }}
              >
                {copied ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre style={{ 
              flex: 1, 
              padding: '24px', 
              overflow: 'auto', 
              fontSize: '0.78rem',
              lineHeight: '1.6',
              fontFamily: 'var(--font-mono)',
              color: 'var(--fg-color)',
              backgroundColor: 'var(--bg-color)'
            }}>
              <code>
                {developerSnippets[codeTab]}
              </code>
            </pre>
          </div>

        </div>

      </div>
    </section>
  );
}

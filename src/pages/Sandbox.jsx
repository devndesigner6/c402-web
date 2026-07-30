import React, { useState } from 'react';
import { 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  Fingerprint, 
  CheckCircle, 
  Terminal, 
  Database, 
  Cpu, 
  Lock, 
  Check, 
  Key
} from 'lucide-react';
import { 
  ShinyText, 
  DecryptedText, 
  SpotlightCard, 
  Magnet 
} from '../components/ReactBitsComponents';

export default function Sandbox({
  apiEndpoints,
  selectedEndpoint,
  setSelectedEndpoint,
  requestHeaders,
  setRequestHeaders,
  responseState,
  setResponseState,
  paymentChallenge,
  setPaymentChallenge,
  signedTxHash,
  setSignedTxHash,
  isCallingApi,
  triggerApiCall,
  resetCache,
  signPayment,
  isSigning,
  connectedWallet,
  gatewayLogs,
  spentDbList,
  isCerebrasLoading,
  cerebrasReport,
  apiKey,
  setApiKey,
  isKeySaved,
  setIsKeySaved
}) {
  const [localKey, setLocalKey] = useState(apiKey);

  const handleEndpointChange = (e) => {
    const ep = apiEndpoints.find(item => item.id === e.target.value);
    setSelectedEndpoint(ep);
    setResponseState(null);
    setPaymentChallenge(null);
    setSignedTxHash('');
    setRequestHeaders({ 'Accept': 'application/json' });
  };

  const handleSaveKey = () => {
    if (localKey.trim()) {
      localStorage.setItem('CEREBRAS_API_KEY', localKey.trim());
      setApiKey(localKey.trim());
      setIsKeySaved(true);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('CEREBRAS_API_KEY');
    setApiKey('');
    setLocalKey('');
    setIsKeySaved(false);
  };

  return (
    <section className="border-bottom-layout" style={{ backgroundColor: 'transparent', padding: '40px 0' }}>
      <div className="container-custom">
        
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '8px' }}>
              Interactive API <span className="font-serif-italic" style={{ color: 'var(--fg-muted)' }}>Sandbox</span>
            </h2>
            <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem' }}>
              Test pay-per-call integration. Trigger challenges, sign payments, and inspect response payloads.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Magnet range={30}>
              <button onClick={resetCache} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={12} /> Reset Cache
              </button>
            </Magnet>
          </div>
        </div>

        <div className="soldiff-grid border-layout" style={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
          
          {/* Left Side: Client Console */}
          <div className="soldiff-col-5 border-right-layout" style={{ backgroundColor: 'rgba(255,255,255,0.002)', position: 'relative' }}>
            <SpotlightCard style={{ height: '100%', width: '100%' }}>
              <div className="border-bottom-layout" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <span className="font-mono-text" style={{ textTransform: 'uppercase', color: '#fff', fontWeight: '600' }}>
                  <DecryptedText text="C402 CLIENT PLAYGROUND" speed={40} hoverScramble={true} />
                </span>
                <span style={{ fontSize: '0.75rem', padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--fg-muted)' }}>
                  Client Sandbox
                </span>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Cerebras AI Key Config Section */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '14px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                    <Key size={12} style={{ color: 'var(--accent-amber)' }} /> Cerebras AI Configuration
                  </label>
                  {isKeySaved ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge-verified" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={10} /> Real Llama-3 Active
                      </span>
                      <button 
                        onClick={handleClearKey}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-red)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Clear Key
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                        <input 
                          type="password" 
                          placeholder="Paste Cerebras API Key..." 
                          value={localKey}
                          onChange={(e) => setLocalKey(e.target.value)}
                          style={{ flex: 1, backgroundColor: '#000', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px 10px', color: '#fff', fontSize: '0.75rem', outline: 'none' }}
                        />
                        <button 
                          onClick={handleSaveKey}
                          className="btn-primary" 
                          style={{ height: '28px', padding: '0 10px', fontSize: '0.7rem' }}
                        >
                          Save
                        </button>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--fg-muted)', lineHeight: '1.3' }}>
                        A Cerebras key is required for the live paid AI response. The gateway never substitutes a sample response.
                      </div>
                    </div>
                  )}
                </div>

                {/* Endpoint select */}
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--fg-muted)', display: 'block', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                    Target API Endpoint
                  </label>
                  <select 
                    value={selectedEndpoint.id}
                    onChange={handleEndpointChange}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--fg-color)',
                      padding: '10px',
                      fontSize: '0.8rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {apiEndpoints.map(ep => (
                      <option key={ep.id} value={ep.id}>{ep.name} ({ep.priceAda} ADA)</option>
                    ))}
                  </select>
                </div>

                {/* URL */}
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--fg-muted)', display: 'block', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                    Request URL & Method
                  </label>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', backgroundColor: '#000', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '4px' }}>
                    <span className="badge-verified" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>GET</span>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                      https://api.c402.dev{selectedEndpoint.route}
                    </span>
                  </div>
                </div>

                {/* Headers */}
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--fg-muted)', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                    Active Headers
                  </label>
                  <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--fg-muted)' }}>
                    <div>Accept: application/json</div>
                    {requestHeaders['Authorization'] && requestHeaders['Authorization'].split(' ')[1] && (
                      <div style={{ color: 'var(--accent-green)', marginTop: '4px', wordBreak: 'break-all' }}>
                        Authorization: Bearer {requestHeaders['Authorization'].split(' ')[1].substring(0, 20)}...
                      </div>
                    )}
                    {apiKey && (
                      <div style={{ color: 'var(--accent-amber)', marginTop: '4px' }}>
                        X-Cerebras-Key: Present (Saved)
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button inside Magnet */}
                <Magnet range={40} style={{ display: 'block', width: '100%' }}>
                  <button 
                    onClick={triggerApiCall}
                    className="btn-primary"
                    style={{ height: '42px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    disabled={isCallingApi}
                  >
                    {isCallingApi ? <RefreshCw size={16} className="spin-animation" /> : <Play size={16} />}
                    {isCallingApi ? 'Checking Proxy...' : 'Call Protected API'}
                  </button>
                </Magnet>

                {/* 402 Challenge Popup */}
                {paymentChallenge && (
                  <div style={{ border: '1px solid rgba(245,158,11,0.2)', backgroundColor: 'var(--accent-amber-bg)', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)' }}>
                      <AlertTriangle size={16} />
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                        <DecryptedText text="HTTP 402 PAYMENT REQUIRED" speed={30} />
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>
                      Endpoint locked. Connect a Cardano Preprod wallet, submit the requested ADA payment, and wait for on-chain verification.
                    </div>

                    <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-numbers)', display: 'flex', flexDirection: 'column', gap: '4px', color: '#bbb' }}>
                      <div>Merchant: <span style={{ color: '#fff' }}>{paymentChallenge.address ? `${paymentChallenge.address.substring(0, 12)}...${paymentChallenge.address.substring(paymentChallenge.address.length - 8 || 45)}` : 'N/A'}</span></div>
                      <div>Cost: <span style={{ color: '#fff' }}>{paymentChallenge.price || '0'} Lovelaces ({selectedEndpoint.priceAda} ADA)</span></div>
                      <div>Ref: <span style={{ color: '#fff' }}>{paymentChallenge.reference || 'N/A'}</span></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {!signedTxHash ? (
                        <Magnet range={30} style={{ display: 'block', width: '100%' }}>
                          <button 
                            onClick={signPayment}
                            className="btn-secondary" 
                            style={{ borderColor: 'var(--accent-amber)', color: '#fff', width: '100%', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            disabled={isSigning}
                          >
                            {isSigning ? <RefreshCw size={14} className="spin-animation" /> : <Fingerprint size={14} />}
                            Submit Payment in Wallet
                          </button>
                        </Magnet>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: '600' }}>
                          <CheckCircle size={14} /> Transaction submitted; waiting for on-chain verification.
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', marginTop: '4px' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                          Real Cardano transactions only. Configure BLOCKFROST_KEY in backend/.env
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </SpotlightCard>
          </div>

          {/* Right Side: Gateway Status Monitor */}
          <div className="soldiff-col-7" style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Gateway log header */}
            <div className="border-bottom-layout" style={{ padding: '16px 24px', backgroundColor: 'rgba(255,255,255,0.005)' }}>
              <span className="font-mono-text" style={{ textTransform: 'uppercase', color: '#fff', fontWeight: '600' }}>
                <DecryptedText text="PROXY VERIFICATION LOGS" speed={40} hoverScramble={true} />
              </span>
            </div>

            {/* Gateway log stream */}
            <div className="border-bottom-layout" style={{ 
              height: '180px', 
              overflowY: 'auto', 
              backgroundColor: 'var(--bg-color)', 
              padding: '16px 24px', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem',
              color: 'var(--fg-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {gatewayLogs.length === 0 && (
                <div style={{ color: '#444', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px', height: '100%' }}>
                  <Terminal size={14} /> Server active. Listening for requests on Preprod network...
                </div>
              )}
              {gatewayLogs.map((log, i) => (
                <div 
                  key={i} 
                  style={{
                    color: log.includes('✓') ? 'var(--accent-green)' : log.includes('❌') || log.includes('⚠') ? 'var(--accent-amber)' : '#888'
                  }}
                >
                  {log}
                </div>
              ))}
            </div>

            {/* Spent list & Cerebras AI */}
            <div className="soldiff-grid" style={{ flex: 1 }}>
              
              {/* Spent cache column */}
              <div className="soldiff-col-5 border-right-layout" style={{ borderBottom: 'none' }}>
                <div className="border-bottom-layout" style={{ padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.005)' }}>
                  <span className="font-mono-text" style={{ textTransform: 'uppercase', color: 'var(--fg-muted)', fontSize: '0.7rem', fontWeight: '600' }}>Double-Spend Cache</span>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', height: '220px', overflowY: 'auto' }}>
                  {spentDbList.length === 0 ? (
                    <div style={{ fontSize: '0.72rem', color: '#444', fontStyle: 'italic' }}>
                      Replay cache details are available only to authenticated administrators.
                    </div>
                  ) : (
                    spentDbList.map((hash, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '4px', fontFamily: 'var(--font-numbers)', fontSize: '0.7rem', color: 'var(--fg-color)' }}>
                        <Database size={10} style={{ color: 'var(--accent-red)' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hash.substring(0, 18)}...</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Output code parser */}
              <div className="soldiff-col-7" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="border-bottom-layout" style={{ padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.005)' }}>
                  <span className="font-mono-text" style={{ textTransform: 'uppercase', color: 'var(--fg-muted)', fontSize: '0.7rem', fontWeight: '600' }}>Inference Audit Report</span>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                  {responseState ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--fg-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>HTTP Status</span>
                        <span 
                          className="font-mono-text" 
                          style={{ 
                            color: responseState.status === 200 ? 'var(--accent-green)' : responseState.status === 402 ? 'var(--accent-amber)' : 'var(--accent-red)',
                            fontWeight: '700'
                          }}
                        >
                          <ShinyText text={`${responseState.status} ${responseState.statusText}`} speed={2} />
                        </span>
                      </div>

                      <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '12px', maxHeight: '110px', overflowY: 'auto' }}>
                        <pre style={{ margin: 0, fontSize: '0.72rem', color: 'var(--fg-color)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                          <code>{JSON.stringify(responseState.data, null, 2)}</code>
                        </pre>
                      </div>

                      {responseState.status === 200 && responseState.data?.receipt && (
                        <div style={{ marginTop: '12px', border: '1px solid rgba(16,185,129,0.1)', backgroundColor: 'var(--accent-green-bg)', padding: '10px', borderRadius: '4px' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--fg-muted)', marginBottom: '6px' }}>Verified payment receipt</div>
                          <a href={`https://preprod.cardanoscan.io/transaction/${responseState.data.receipt.tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)', fontSize: '0.7rem', wordBreak: 'break-all' }}>
                            View transaction on Cardano Preprod explorer ↗
                          </a>
                        </div>
                      )}

                      {responseState.status === 200 && (
                        <div style={{ marginTop: '12px', border: '1px solid rgba(16,185,129,0.1)', backgroundColor: 'var(--accent-green-bg)', padding: '10px', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '0.7rem', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>
                            <Cpu size={12} /> Cerebras AI Audit report
                          </div>
                          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#eee', lineHeight: '1.4' }}>
                            {isCerebrasLoading ? 'Querying Cerebras llama-3.3-70b...' : (cerebrasReport || 'Payment verified by Blockfrost. Transaction marked spent.')}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#444', gap: '8px', fontSize: '0.78rem', fontStyle: 'italic', textAlign: 'center' }}>
                      <Terminal size={24} style={{ opacity: 0.3 }} />
                      <span>Send a request to run header audits.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

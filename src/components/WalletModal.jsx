import React from 'react';
import { Wallet } from 'lucide-react';

export default function WalletModal({ installedWallets, connectWallet, setShowWalletModal }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#050505', border: '1px solid var(--border-color)', 
        borderRadius: '8px', padding: '24px', width: '320px', display: 'flex', 
        flexDirection: 'column', gap: '16px'
      }}>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={18} /> Connect Wallet
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', lineHeight: '1.4' }}>
          Select an injected Cardano wallet to build, sign, and submit a Preprod payment transaction.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {installedWallets.length === 0 ? (
            <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--fg-muted)', textAlign: 'center' }}>
              No Cardano wallet detected. Install Nami, Eternl, or Lace browser extension.
            </div>
          ) : (
            installedWallets.map(w => (
              <button
                key={w.name}
                onClick={() => connectWallet(w.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', 
                  backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', 
                  borderRadius: '6px', color: '#fff', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'; }}
              >
                {w.icon && <img src={w.icon} alt={w.displayName} style={{ width: '18px', height: '18px' }} />}
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{w.displayName}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--fg-muted)', marginLeft: 'auto' }}>v{w.version}</span>
              </button>
            ))
          )}
        </div>

        <button 
          onClick={() => setShowWalletModal(false)}
          className="btn-secondary" 
          style={{ width: '100%', height: '36px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

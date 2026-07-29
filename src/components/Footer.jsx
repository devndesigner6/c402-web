import React from 'react';
import { Heart, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ padding: '60px 0', backgroundColor: '#050505', borderTop: '1px solid var(--border-color)' }}>
      <div className="container-custom" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '30px' }}>
          
          {/* Left Block: Authors and Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '8px', marginBottom: '12px', flexWrap: 'nowrap' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                C402<span className="font-serif-italic" style={{ fontWeight: '400', color: 'var(--fg-muted)' }}>.</span>
              </span>
              <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--accent-green)', padding: '1px 8px', borderRadius: '99px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                BUILT ON CARDANO
              </span>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              Made with <Heart size={10} style={{ color: 'var(--accent-red)', fill: 'var(--accent-red)' }} /> by 
              <a href="https://hemanthme.in" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>
                Hemanth
              </a> 
              &amp; 
              <a href="https://github.com/devndesigner6/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>
                Prem Kumar
              </a>
            </p>
            <div style={{ fontSize: '0.72rem', color: '#555' }}>
              © 2026 C402 Protocol. Released under Open Source MIT License.
            </div>
          </div>

          {/* Right Block: Links & Repos */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--fg-muted)' }}>
              <span>OSS Repo:</span>
              <a 
                href="https://github.com/devndesigner6/c402-web.git" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: '#fff', 
                  textDecoration: 'none', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem'
                }}
              >
                <Github size={11} /> c402-web.git
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a 
                href="https://x.com/hemanttbuilds" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: 'var(--fg-muted)', 
                  textDecoration: 'none', 
                  fontSize: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px' 
                }}
              >
                {/* Modern X logo SVG */}
                <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" style={{ display: 'inline-block' }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>@hemanttbuilds</span>
              </a>
              
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--accent-green)', borderRadius: '50%' }} />
                Gateway Sync Active
              </span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}

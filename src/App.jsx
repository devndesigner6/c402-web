import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WalletModal from './components/WalletModal';
import Overview from './pages/Overview';
import Sandbox from './pages/Sandbox';
import Console from './pages/Console';
import Docs from './pages/Docs';
import {
  apiEndpoints,
  processC402Request,
  getSpentCacheList,
  clearSpentCache,
  requestCerebrasAuditReport,
  decodeCardanoAddress
} from './c402Engine';
import { buildPaymentTx } from './cardanoTx';

export default function App() {
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('c402-theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('c402-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Navigation state: 'landing' | 'sandbox' | 'dashboard' | 'docs'
  const [currentPage, setCurrentPage] = useState('landing');
  const [isInIframe, setIsInIframe] = useState(false);

  // Key configurations
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('CEREBRAS_API_KEY') || '');
  const [isKeySaved, setIsKeySaved] = useState(() => !!localStorage.getItem('CEREBRAS_API_KEY'));

  // Sandbox active state
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0]);
  const [requestHeaders, setRequestHeaders] = useState({ 'Accept': 'application/json' });
  const [responseState, setResponseState] = useState(null); 
  
  // Real CIP-30 Wallet Connection State
  const [installedWallets, setInstalledWallets] = useState([]);
  const [connectedWallet, setConnectedWallet] = useState(null); 
  const [walletApi, setWalletApi] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Wallet payment challenge state
  const [paymentChallenge, setPaymentChallenge] = useState(null); 
  const [signedTxHash, setSignedTxHash] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  
  // Loading & logs
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [gatewayLogs, setGatewayLogs] = useState([]);
  const [spentDbList, setSpentDbList] = useState([]);
  const [cerebrasReport, setCerebrasReport] = useState('');
  const [isCerebrasLoading, setIsCerebrasLoading] = useState(false);

  // Developer Console state with LocalStorage persistence
  const [myEndpoints, setMyEndpoints] = useState(() => {
    const saved = localStorage.getItem('C402_DEV_ENDPOINTS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved endpoints, loading default.");
      }
    }
    return [
      {
        id: "ep-1",
        name: "Llama-3 Coder API",
        route: "/v1/ai/generate-code",
        priceLovelace: 100000,
        priceAda: "0.1",
        targetUrl: "https://api.cerebras.ai/v1/chat/completions",
        calls: 142,
        earnings: "14.2"
      },
      {
        id: "ep-2",
        name: "Cardano Indexer API",
        route: "/v1/ledger/block-details",
        priceLovelace: 50000,
        priceAda: "0.05",
        targetUrl: "https://cardano-preprod.blockfrost.io/api/v0/blocks",
        calls: 89,
        earnings: "4.45"
      }
    ];
  });

  const [newEpName, setNewEpName] = useState('');
  const [newEpRoute, setNewEpRoute] = useState('');
  const [newEpTarget, setNewEpTarget] = useState('');
  const [newEpPrice, setNewEpPrice] = useState('0.1');

  // General App states
  const [codeTab, setCodeTab] = useState('javascript');
  const [copied, setCopied] = useState(false);

  // Save developer endpoints to local storage
  useEffect(() => {
    localStorage.setItem('C402_DEV_ENDPOINTS', JSON.stringify(myEndpoints));
  }, [myEndpoints]);

  const syncSpentList = async () => {
    const list = await getSpentCacheList();
    setSpentDbList(list);
  };

  // Sync cache and detect CIP-30 wallets on load
  useEffect(() => {
    syncSpentList();
    detectCardanoWallets();
    setIsInIframe(window.self !== window.top);
  }, []);

  // Dynamically merge core endpoints and custom user endpoints for the Sandbox select dropdown
  const allEndpoints = React.useMemo(() => {
    const merged = [...apiEndpoints];
    myEndpoints.forEach(item => {
      if (!merged.find(m => m.id === item.id)) {
        merged.push({
          id: item.id,
          name: item.name,
          route: item.route,
          priceLovelace: item.priceLovelace,
          priceAda: item.priceAda,
          targetUrl: item.targetUrl,
          description: `Custom endpoint proxying to ${item.targetUrl}`
        });
      }
    });
    return merged;
  }, [myEndpoints]);

  // Detect installed wallets via window.cardano
  const detectCardanoWallets = () => {
    if (typeof window !== 'undefined' && window.cardano) {
      const wallets = [];
      const supported = ['nami', 'eternl', 'lace', 'vespr', 'yoroi', 'flint'];
      
      supported.forEach(name => {
        if (window.cardano[name]) {
          wallets.push({
            name,
            displayName: name.charAt(0).toUpperCase() + name.slice(1),
            icon: window.cardano[name].icon,
            version: window.cardano[name].apiVersion
          });
        }
      });

      Object.keys(window.cardano).forEach(key => {
        if (!supported.includes(key) && window.cardano[key] && window.cardano[key].name) {
          wallets.push({
            name: key,
            displayName: window.cardano[key].name,
            icon: window.cardano[key].icon,
            version: window.cardano[key].apiVersion
          });
        }
      });

      const unique = Array.from(new Set(wallets.map(w => w.name)))
        .map(name => wallets.find(w => w.name === name));

      setInstalledWallets(unique);
    }
  };

  // Connect to selected Cardano Wallet
  const connectWallet = async (walletName) => {
    setIsConnecting(true);
    setShowWalletModal(false);
    try {
      const timestamp = new Date().toLocaleTimeString();
      setGatewayLogs(prev => [
        `[${timestamp}] [Client] Requesting connection to ${walletName} wallet...`,
        ...prev
      ]);

      const api = await window.cardano[walletName].enable();
      setConnectedWallet(walletName);
      setWalletApi(api);

      const addresses = await api.getUsedAddresses();
      if (addresses && addresses.length > 0) {
        // Decode CBOR Hex address to human readable Bech32 addr format
        const cleanAddr = decodeCardanoAddress(addresses[0]);
        setWalletAddress(cleanAddr);
      }

      try {
        const balanceHex = await api.getBalance();
        const balanceVal = parseInt(balanceHex, 16);
        if (!isNaN(balanceVal)) {
          setWalletBalance((balanceVal / 1000000).toFixed(2));
        } else {
          setWalletBalance("Unavailable");
        }
      } catch (err) {
        setWalletBalance("Unavailable");
      }

      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Client] Connected to ${walletName}. Wallet active.`,
        ...prev
      ]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Client] ❌ Connection failed: ${err.message}`,
        ...prev
      ]);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setConnectedWallet(null);
    setWalletApi(null);
    setWalletAddress('');
    setWalletBalance('');
  };

  // Execute C402 HTTP Request (Forwarding Cerebras key in headers)
  const triggerApiCall = async (headerOverrides = {}) => {
    setIsCallingApi(true);
    setResponseState(null);
    
    const timestamp = new Date().toLocaleTimeString();
    setGatewayLogs(prev => [
      `[${timestamp}] [Client] GET ${selectedEndpoint.route}`,
      ...prev
    ]);

    // Append configured API key in request headers
    const activeHeaders = { ...requestHeaders, ...headerOverrides };
    if (apiKey) {
      activeHeaders['X-Cerebras-Key'] = apiKey;
    }

    const result = await processC402Request(selectedEndpoint.route, activeHeaders, selectedEndpoint);
    
    setResponseState(result);
    setIsCallingApi(false);

    const resTimestamp = new Date().toLocaleTimeString();

    if (result.status === 402) {
      setGatewayLogs(prev => [
        `[${resTimestamp}] [Gateway] ⚠ HTTP 402 Payment Required - Challenge Issued for ${selectedEndpoint.route}`,
        ...prev
      ]);
      setPaymentChallenge({
        price: result.headers['x-c402-price'] || result.headers['X-C402-Price'],
        address: result.headers['x-c402-address'] || result.headers['X-C402-Address'],
        reference: result.headers['x-c402-reference'] || result.headers['X-C402-Reference'],
        network: result.headers['x-c402-network'] || result.headers['X-C402-Network'] || 'preprod'
      });
    } else if (result.status === 401) {
      setGatewayLogs(prev => [
        `[${resTimestamp}] [Gateway] ❌ HTTP 401 Unauthorized - ${result.data.error}: ${result.data.message}`,
        ...prev
      ]);
    } else if (result.status === 200) {
      setGatewayLogs(prev => [
        `[${resTimestamp}] [Gateway] ✓ HTTP 200 OK - Payment verified. Data payload returned successfully.`,
        ...prev
      ]);
      syncSpentList();
      const verifiedTxHash = activeHeaders['Authorization']?.split(' ')[1];
      if (verifiedTxHash) triggerCerebrasAudit(verifiedTxHash);
      
      // Update local dev console statistics
      setMyEndpoints(prev => prev.map(ep => {
        if (ep.route === selectedEndpoint.route) {
          const calls = ep.calls + 1;
          const earnings = (parseFloat(ep.earnings) + parseFloat(ep.priceAda)).toFixed(2);
          return { ...ep, calls, earnings };
        }
        return ep;
      }));
    }
  };

  // Build & submit real Cardano transaction via CIP-30
  const signPayment = async () => {
    if (!walletApi) {
      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Wallet] ❌ Connect a Cardano wallet first`,
        ...prev
      ]);
      return;
    }

    if (!paymentChallenge) {
      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Wallet] ❌ No payment challenge available`,
        ...prev
      ]);
      return;
    }

    setIsSigning(true);

    try {
      const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

      // 1. Fetch protocol params
      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Wallet] Fetching protocol parameters...`,
        ...prev
      ]);

      const paramsRes = await fetch(`${BACKEND_BASE_URL}/api/v1/cardano/protocol-params`);
      if (!paramsRes.ok) throw new Error("Failed to fetch protocol parameters. Check BLOCKFROST_KEY.");
      const protocolParams = await paramsRes.json();

      // 2. Build transaction
      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Wallet] Building payment (${paymentChallenge.price} Lovelaces)...`,
        ...prev
      ]);

      const unsignedTxHex = await buildPaymentTx(
        walletApi,
        paymentChallenge.address,
        paymentChallenge.price,
        protocolParams
      );

      // 3. Sign transaction
      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Wallet] Requesting signature from ${connectedWallet}...`,
        ...prev
      ]);

      const signedTxHex = await walletApi.signTx(unsignedTxHex, true);

      // 4. Submit to Cardano
      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Wallet] Submitting to Cardano Preprod...`,
        ...prev
      ]);

      const txHash = await walletApi.submitTx(signedTxHex);
      setSignedTxHash(txHash);

      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Wallet] ✓ Transaction submitted: ${txHash.substring(0, 16)}...`,
        `[${new Date().toLocaleTimeString()}] [Gateway] Retrying with payment proof...`,
        ...prev
      ]);

      // 5. Update headers with tx hash + reference, retry API call
      setRequestHeaders(prev => ({
        ...prev,
        'Authorization': `Bearer ${txHash}`,
        'X-C402-Reference': paymentChallenge.reference
      }));

      await triggerApiCall({
        'Authorization': `Bearer ${txHash}`,
        'X-C402-Reference': paymentChallenge.reference
      });

    } catch (err) {
      console.error("Payment failed:", err);
      setGatewayLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Wallet] ❌ ${err.message}`,
        ...prev
      ]);
    } finally {
      setIsSigning(false);
    }
  };

  // Call Cerebras AI for transaction audit
  const triggerCerebrasAudit = async (txHash) => {
    setIsCerebrasLoading(true);
    setCerebrasReport('');
    
    try {
      const report = await requestCerebrasAuditReport(
        apiKey, 
        txHash, 
        selectedEndpoint.route, 
        selectedEndpoint.priceAda
      );
      setCerebrasReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCerebrasLoading(false);
    }
  };

  // Reset Node spent index cache
  const resetCache = async () => {
    setGatewayLogs(prev => [
      `[${new Date().toLocaleTimeString()}] [Node Admin] Cache reset is disabled in the public client. Use the authenticated admin API.`,
      ...prev
    ]);
  };

  // Handle adding new endpoint in Developer Dashboard (Sanitizing routes)
  const handleAddEndpoint = (e) => {
    e.preventDefault();
    if (!newEpName || !newEpRoute || !newEpTarget) return;

    // Sanitize Route: Force leading slash, lowercase, strip spaces and trailing slashes
    let cleanRoute = newEpRoute.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanRoute.startsWith('/')) {
      cleanRoute = `/${cleanRoute}`;
    }
    if (cleanRoute.endsWith('/') && cleanRoute.length > 1) {
      cleanRoute = cleanRoute.slice(0, -1);
    }

    const newEp = {
      id: `ep-${Date.now()}`,
      name: newEpName.trim(),
      route: cleanRoute,
      priceLovelace: parseFloat(newEpPrice) * 1000000,
      priceAda: parseFloat(newEpPrice).toString(),
      targetUrl: newEpTarget.trim(),
      calls: 0,
      earnings: "0.00"
    };

    setMyEndpoints(prev => [...prev, newEp]);

    setNewEpName('');
    setNewEpRoute('');
    setNewEpTarget('');
    setNewEpPrice('0.1');

    setGatewayLogs(prev => [
      `[${new Date().toLocaleTimeString()}] [Node Admin] Registered clean route: ${newEp.route} -> ${newEp.targetUrl}`,
      ...prev
    ]);
  };

  // Delete developer endpoint
  const handleDeleteEndpoint = (id) => {
    setMyEndpoints(prev => prev.filter(ep => ep.id !== id));
  };

  // Copy code handler
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="c402-app-wrapper" style={{ paddingTop: isInIframe ? '120px' : '90px' }}>
      {isInIframe && (
        <div style={{ 
          backgroundColor: 'var(--accent-amber-bg)', 
          borderBottom: '1px solid rgba(245,158,11,0.2)', 
          padding: '8px 12px', 
          textAlign: 'center', 
          fontSize: '0.72rem', 
          color: 'var(--accent-amber)', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          zIndex: 2000,
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️ Running in an iframe. Cardano CIP-30 wallet connection may fail due to browser security restrictions.</span>
          <a href={window.location.href} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', fontWeight: '600' }}>
            Open in new tab
          </a>
        </div>
      )}
      
      <Header 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        connectedWallet={connectedWallet}
        walletBalance={walletBalance}
        disconnectWallet={disconnectWallet}
        setShowWalletModal={setShowWalletModal}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {currentPage === 'landing' && (
        <Overview setCurrentPage={setCurrentPage} />
      )}

      {currentPage === 'sandbox' && (
        <Sandbox 
          apiEndpoints={allEndpoints}
          selectedEndpoint={selectedEndpoint}
          setSelectedEndpoint={setSelectedEndpoint}
          requestHeaders={requestHeaders}
          setRequestHeaders={setRequestHeaders}
          responseState={responseState}
          setResponseState={setResponseState}
          paymentChallenge={paymentChallenge}
          setPaymentChallenge={setPaymentChallenge}
          signedTxHash={signedTxHash}
          setSignedTxHash={setSignedTxHash}
          isCallingApi={isCallingApi}
          triggerApiCall={triggerApiCall}
          resetCache={resetCache}
          signPayment={signPayment}
          isSigning={isSigning}
          connectedWallet={connectedWallet}
          gatewayLogs={gatewayLogs}
          spentDbList={spentDbList}
          isCerebrasLoading={isCerebrasLoading}
          cerebrasReport={cerebrasReport}
          apiKey={apiKey}
          setApiKey={setApiKey}
          isKeySaved={isKeySaved}
          setIsKeySaved={setIsKeySaved}
        />
      )}

      {currentPage === 'dashboard' && (
        <Console 
          myEndpoints={myEndpoints}
          handleAddEndpoint={handleAddEndpoint}
          handleDeleteEndpoint={handleDeleteEndpoint}
          newEpName={newEpName}
          setNewEpName={setNewEpName}
          newEpRoute={newEpRoute}
          setNewEpRoute={setNewEpRoute}
          newEpTarget={newEpTarget}
          setNewEpTarget={setNewEpTarget}
          newEpPrice={newEpPrice}
          setNewEpPrice={setNewEpPrice}
        />
      )}

      {currentPage === 'docs' && (
        <Docs 
          codeTab={codeTab}
          setCodeTab={setCodeTab}
          copied={copied}
          handleCopy={handleCopy}
        />
      )}

      <Footer />

      {showWalletModal && (
        <WalletModal 
          installedWallets={installedWallets}
          connectWallet={connectWallet}
          setShowWalletModal={setShowWalletModal}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import {
  WalletProvider,
  ConnectionProvider,
  useWallet
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

import MemoForm from './components/MemoForm';
import MemoList from './components/MemoList';

import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

function App() {
  const [network, setNetwork] = useState('devnet');
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 text-gray-800">
            <header className="p-6 shadow-sm bg-white flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-blue-700">📝 MemoMint</h1>
                <p className="text-sm text-gray-500">Send memos on Solana blockchain</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="devnet">Devnet</option>
                  <option value="testnet">Testnet</option>
                  <option value="mainnet-beta">Mainnet</option>
                </select>
                <WalletMultiButton />
              </div>
            </header>

            <main className="max-w-2xl mx-auto p-4">
              <AppContent />
            </main>

            <footer className="text-center text-xs text-gray-500 py-6">
              Built with ❤️ for the Codigo x Superteam Nigeria DevQuest
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function AppContent() {
  const { connected } = useWallet();
  const [memos, setMemos] = useState([]);

  useEffect(() => {
    if (connected) {
      // Replace with actual fetch logic if you connect your deployed program
      setMemos([
        {
          id: 1,
          text: 'Welcome to MemoMint!',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          text: 'Connect your wallet to create memos on Solana.',
          timestamp: new Date().toISOString()
        }
      ]);
    } else {
      setMemos([]);
    }
  }, [connected]);

  const addMemo = (memo) => {
    setMemos([memo, ...memos]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-4">
      {connected ? (
        <>
          <MemoForm onMemoSubmit={addMemo} />
          <MemoList memos={memos} />
        </>
      ) : (
        <div className="text-center text-gray-600">
          <p className="text-lg">🔐 Please connect your wallet to begin.</p>
        </div>
      )}
    </div>
  );
}

export default App;

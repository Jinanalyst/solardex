import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TokenSwap } from '../components/TokenSwap';
import { LiquidityPool } from '../components/LiquidityPool';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [view, setView] = useState<'swap' | 'pool'>('swap');

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [publicKey, connection]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <nav className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Solana DEX
          </h1>
          <div className="flex items-center space-x-4">
            {connected && (
              <div className="text-sm text-gray-400">
                Balance: {balance.toFixed(4)} SOL
              </div>
            )}
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-gray-700">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                view === 'swap'
                  ? 'bg-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setView('swap')}
            >
              Swap
            </button>
            <button
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                view === 'pool'
                  ? 'bg-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setView('pool')}
            >
              Pool
            </button>
          </div>

          {!connected ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-4">
                Connect your Phantom or Solflare wallet to start trading
              </p>
              <WalletMultiButton />
            </div>
          ) : view === 'swap' ? (
            <TokenSwap connection={connection} publicKey={publicKey} />
          ) : (
            <LiquidityPool connection={connection} publicKey={publicKey} />
          )}
        </div>
      </main>
    </div>
  );
}

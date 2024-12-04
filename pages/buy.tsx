import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useTokenTransfer } from '../hooks/useTokenTransfer';
import { Token } from '../types/dex';

const BuyPage: FC = () => {
  const { publicKey } = useWallet();
  const { buyToken, loading } = useTokenTransfer();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'sol' | 'usdc'>('sol');

  const handleBuy = async () => {
    if (!selectedToken || !amount) return;

    try {
      await buyToken(
        new PublicKey(selectedToken.mint),
        parseFloat(amount) * Math.pow(10, selectedToken.decimals),
        selectedToken.price
      );
      
      // Reset form
      setAmount('');
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          Connect wallet to buy tokens
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Buy Tokens</h1>

        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
          {/* Token Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Token
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                // Add your token list here with prices
                { 
                  symbol: 'SOL', 
                  name: 'Solana', 
                  mint: 'native',
                  price: 0, // Current market price
                  decimals: 9
                },
                // Add more tokens
              ].map((token) => (
                <button
                  key={token.mint}
                  onClick={() => setSelectedToken(token)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedToken?.mint === token.mint
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-lg font-medium">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                  {token.price > 0 && (
                    <div className="text-sm text-green-400">
                      ${token.price.toFixed(2)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                min="0"
                step="any"
              />
              {selectedToken && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {selectedToken.symbol}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Pay with
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('sol')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  paymentMethod === 'sol'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-lg font-medium">SOL</div>
                <div className="text-sm text-gray-400">Solana</div>
              </button>
              <button
                onClick={() => setPaymentMethod('usdc')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  paymentMethod === 'usdc'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-lg font-medium">USDC</div>
                <div className="text-sm text-gray-400">USD Coin</div>
              </button>
            </div>
          </div>

          {/* Price Summary */}
          {selectedToken && amount && (
            <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Price per token</span>
                <span>${selectedToken.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Amount</span>
                <span>{amount} {selectedToken.symbol}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Network fee</span>
                <span>0.00005 SOL</span>
              </div>
              <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-medium">
                  ${(selectedToken.price * parseFloat(amount || '0')).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            disabled={!selectedToken || !amount || loading}
            className={`w-full p-4 rounded-lg font-medium transition-all duration-200 ${
              !selectedToken || !amount || loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>

        {/* Recent Purchases */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>
          <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
            {/* Add your purchase history component here */}
            <div className="text-center text-gray-400">
              No recent purchases
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useTokenTransfer } from '../hooks/useTokenTransfer';
import { Token } from '../types/dex';

const SendPage: FC = () => {
  const { publicKey } = useWallet();
  const { sendToken, sendSOL, loading } = useTokenTransfer();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);

  // Validate Solana address
  const validateAddress = (address: string) => {
    try {
      new PublicKey(address);
      setIsValidAddress(true);
    } catch {
      setIsValidAddress(false);
    }
  };

  const handleSend = async () => {
    if (!selectedToken || !recipientAddress || !amount || !isValidAddress) return;

    try {
      if (selectedToken.symbol === 'SOL') {
        await sendSOL(recipientAddress, parseFloat(amount));
      } else {
        await sendToken(
          new PublicKey(selectedToken.mint),
          recipientAddress,
          parseFloat(amount) * Math.pow(10, selectedToken.decimals)
        );
      }
      
      // Reset form
      setRecipientAddress('');
      setAmount('');
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          Connect wallet to send tokens
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Send Tokens</h1>

        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
          {/* Token Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Token
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { symbol: 'SOL', name: 'Solana', mint: 'native' },
                // Add your token list here
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
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
                validateAddress(e.target.value);
              }}
              className="w-full p-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Solana address"
            />
            {recipientAddress && !isValidAddress && (
              <p className="mt-1 text-sm text-red-400">
                Please enter a valid Solana address
              </p>
            )}
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

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!selectedToken || !isValidAddress || !amount || loading}
            className={`w-full p-4 rounded-lg font-medium transition-all duration-200 ${
              !selectedToken || !isValidAddress || !amount || loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
            {/* Add your transaction history component here */}
            <div className="text-center text-gray-400">
              No recent transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendPage;

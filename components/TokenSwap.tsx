import { FC, useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TokenSelect } from './TokenSelect';
import { useMultiDexSwap } from '../hooks/useMultiDexSwap';
import { Token, SwapRoute } from '../types/dex';

interface TokenSwapProps {
  connection: Connection;
  publicKey: PublicKey | null;
}

const DEFAULT_TOKENS: Token[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: '11111111111111111111111111111111',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  }
];

const FEE_CONSTANTS = {
  FEE_BPS: 0.3,
  MIN_FEE_SOL: 0.0001,
  MAX_FEE_SOL: 0.01,
};

export const TokenSwap: FC<TokenSwapProps> = ({ connection, publicKey }) => {
  const { state, getQuotes, executeSwap } = useMultiDexSwap();
  const [inputToken, setInputToken] = useState<Token>(DEFAULT_TOKENS[0]);
  const [outputToken, setOutputToken] = useState<Token>(DEFAULT_TOKENS[1]);
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1.0');
  const [selectedRoute, setSelectedRoute] = useState<SwapRoute | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!amount || !inputToken || !outputToken) return;
      
      const quotes = await getQuotes(
        inputToken,
        outputToken,
        parseFloat(amount),
        parseFloat(slippage)
      );

      if (quotes) {
        setSelectedRoute(quotes.bestRoute);
      }
    };

    fetchQuotes();
  }, [amount, inputToken, outputToken, slippage]);

  const handleSwap = async () => {
    if (!selectedRoute || !publicKey) return;
    
    try {
      const txid = await executeSwap(selectedRoute);
      console.log('Swap successful:', txid);
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">From</label>
          <div className="relative">
            <TokenSelect
              tokens={DEFAULT_TOKENS}
              selectedToken={inputToken}
              onSelect={setInputToken}
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-4 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
            />
          </div>
        </div>

        <button
          onClick={() => {
            const temp = inputToken;
            setInputToken(outputToken);
            setOutputToken(temp);
          }}
          className="w-full p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200"
        >
          ↓
        </button>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">To</label>
          <div className="relative">
            <TokenSelect
              tokens={DEFAULT_TOKENS}
              selectedToken={outputToken}
              onSelect={setOutputToken}
            />
            <input
              type="number"
              value={selectedRoute?.outputAmount.toFixed(6) || ''}
              disabled
              placeholder="0.00"
              className="w-full p-4 bg-gray-700/50 rounded-lg mt-2"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Slippage Tolerance (%)</label>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            min="0.1"
            max="100"
            step="0.1"
            className="w-full p-4 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedRoute && (
          <div className="p-4 bg-gray-700/30 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Route</span>
              <span className="font-medium">{selectedRoute.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price Impact</span>
              <span className="font-medium">{selectedRoute.priceImpact.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Minimum Received</span>
              <span className="font-medium">
                {(selectedRoute.outputAmount * (1 - selectedRoute.slippage / 100)).toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction Fee</span>
              <span className="font-medium text-blue-400">
                {selectedRoute.fee.toFixed(4)} SOL
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-400 text-center">
              A fee of {(FEE_CONSTANTS.FEE_BPS / 100).toFixed(2)}% (min: {FEE_CONSTANTS.MIN_FEE_SOL} SOL, max: {FEE_CONSTANTS.MAX_FEE_SOL} SOL) will be charged for this swap
            </div>
          </div>
        )}

        <button
          onClick={handleSwap}
          disabled={!publicKey || !selectedRoute || state.loading}
          className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.loading ? 'Swapping...' : 'Swap'}
        </button>
      </div>
    </div>
  );
};

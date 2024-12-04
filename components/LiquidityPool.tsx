import { FC, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TokenSelect } from './TokenSelect';

interface LiquidityPoolProps {
  connection: Connection;
  publicKey: PublicKey | null;
}

export const LiquidityPool: FC<LiquidityPoolProps> = ({ connection, publicKey }) => {
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');

  const handleAddLiquidity = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }
    // Implement add liquidity logic here
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <TokenSelect label="Token A" />
        <input
          type="number"
          value={tokenAAmount}
          onChange={(e) => setTokenAAmount(e.target.value)}
          placeholder="0.00"
          className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <TokenSelect label="Token B" />
        <input
          type="number"
          value={tokenBAmount}
          onChange={(e) => setTokenBAmount(e.target.value)}
          placeholder="0.00"
          className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="p-4 bg-gray-700 rounded">
        <h3 className="text-lg font-semibold mb-2">Pool Information</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>Pool Share: -</p>
          <p>Token A Pooled: -</p>
          <p>Token B Pooled: -</p>
        </div>
      </div>

      <button
        onClick={handleAddLiquidity}
        disabled={!publicKey}
        className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
      >
        {publicKey ? 'Add Liquidity' : 'Connect Wallet to Add Liquidity'}
      </button>
    </div>
  );
};

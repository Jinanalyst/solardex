import { FC } from 'react';
import { useLiquidityPools } from '../hooks/useLiquidityPools';
import { useWallet } from '@solana/wallet-adapter-react';

const PoolsPage: FC = () => {
  const { pools, userPositions, loading, error, addLiquidity, removeLiquidity } = useLiquidityPools();
  const { publicKey } = useWallet();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Liquidity Pools</h1>
      
      {/* User Positions */}
      {publicKey && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPositions.map((position) => (
              <div key={position.poolId} className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Pool</span>
                  <span className="font-medium">{position.poolId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">LP Amount</span>
                  <span className="font-medium">{position.lpAmount.toFixed(6)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Value</span>
                  <span className="font-medium">${position.value.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => removeLiquidity(position.poolId, position.lpAmount, 0.5)}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-700/80 rounded-lg transition-all duration-200"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => addLiquidity(position.poolId, 0, 0, 0.5)}
                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 rounded-lg transition-all duration-200"
                  >
                    Add More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Pools */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">All Pools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map((pool) => (
            <div key={pool.id} className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex justify-between mb-4">
                <span className="font-medium">{pool.token0.symbol}/{pool.token1.symbol}</span>
                <span className="text-blue-400">{pool.protocol}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">TVL</span>
                <span className="font-medium">${pool.tvl.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">24h Volume</span>
                <span className="font-medium">${pool.volume24h.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-400">APY</span>
                <span className="font-medium text-green-400">{pool.apy.toFixed(2)}%</span>
              </div>
              <button
                onClick={() => addLiquidity(pool.id, 0, 0, 0.5)}
                className="w-full px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 rounded-lg transition-all duration-200"
              >
                Add Liquidity
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PoolsPage;

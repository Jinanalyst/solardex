import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLiquidityPools } from '../hooks/useLiquidityPools';
import { useFarming } from '../hooks/useFarming';
import { useConcentratedLiquidity } from '../hooks/useConcentratedLiquidity';
import { useLimitOrders } from '../hooks/useLimitOrders';

interface PortfolioStats {
  totalValue: number;
  liquidityValue: number;
  farmingValue: number;
  concentratedValue: number;
  pendingRewards: number;
}

const PortfolioPage: FC = () => {
  const { publicKey } = useWallet();
  const { userPositions } = useLiquidityPools();
  const { userFarms } = useFarming();
  const { positions: clPositions } = useConcentratedLiquidity();
  const { orders } = useLimitOrders();
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    liquidityValue: 0,
    farmingValue: 0,
    concentratedValue: 0,
    pendingRewards: 0,
  });

  // Calculate portfolio stats
  useEffect(() => {
    if (!publicKey) return;

    const liquidityValue = userPositions.reduce((sum, pos) => sum + pos.value, 0);
    const farmingValue = userFarms.reduce((sum, farm) => sum + (farm.userStaked || 0), 0);
    const concentratedValue = clPositions.reduce(
      (sum, pos) => sum + pos.token0Amount + pos.token1Amount,
      0
    );
    const pendingRewards = userFarms.reduce(
      (sum, farm) => sum + (farm.pendingRewards || 0),
      0
    );

    setStats({
      totalValue: liquidityValue + farmingValue + concentratedValue,
      liquidityValue,
      farmingValue,
      concentratedValue,
      pendingRewards,
    });
  }, [publicKey, userPositions, userFarms, clPositions]);

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          Connect wallet to view portfolio
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Portfolio</h1>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="text-gray-400">Total Value</div>
          <div className="text-2xl font-semibold">${stats.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="text-gray-400">Liquidity Value</div>
          <div className="text-2xl font-semibold">${stats.liquidityValue.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="text-gray-400">Farming Value</div>
          <div className="text-2xl font-semibold">${stats.farmingValue.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="text-gray-400">Pending Rewards</div>
          <div className="text-2xl font-semibold text-yellow-400">
            ${stats.pendingRewards.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Liquidity Positions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Liquidity Positions</h2>
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
              <div className="flex justify-between">
                <span className="text-gray-400">Value</span>
                <span className="font-medium">${position.value.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farming Positions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Farming Positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userFarms.map((farm) => (
            <div key={farm.poolId} className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex justify-between mb-4">
                <span className="font-medium">{farm.rewardToken.symbol} Farm</span>
                <span className="text-blue-400">{farm.protocol}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Staked</span>
                <span className="font-medium">{farm.userStaked?.toFixed(6)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Pending Rewards</span>
                <span className="font-medium text-yellow-400">
                  {farm.pendingRewards?.toFixed(6)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concentrated Liquidity Positions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Concentrated Positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clPositions.map((position) => (
            <div key={position.tokenId} className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex justify-between mb-4">
                <span className="text-gray-400">Position ID</span>
                <span className="font-medium">{position.tokenId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Price Range</span>
                <span className="font-medium">
                  {position.lowerTick} - {position.upperTick}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Status</span>
                <span className={position.inRange ? 'text-green-400' : 'text-red-400'}>
                  {position.inRange ? 'In Range' : 'Out of Range'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open Orders */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Open Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex justify-between mb-4">
                <span className="font-medium">
                  {order.inputToken.symbol}/{order.outputToken.symbol}
                </span>
                <span className="text-blue-400">{order.status}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Price</span>
                <span className="font-medium">{order.price.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="font-medium">{order.inputAmount.toFixed(6)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;

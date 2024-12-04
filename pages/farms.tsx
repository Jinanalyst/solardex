import { FC } from 'react';
import { useFarming } from '../hooks/useFarming';
import { useWallet } from '@solana/wallet-adapter-react';

const FarmsPage: FC = () => {
  const { farms, userFarms, loading, error, stake, unstake, claimRewards } = useFarming();
  const { publicKey } = useWallet();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Yield Farming</h1>

      {/* User Farms */}
      {publicKey && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Farms</h2>
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
                  <span className="text-gray-400">APR</span>
                  <span className="font-medium text-green-400">{farm.apr.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Pending Rewards</span>
                  <span className="font-medium text-yellow-400">
                    {farm.pendingRewards?.toFixed(6)} {farm.rewardToken.symbol}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => unstake(farm.poolId, farm.userStaked || 0)}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-700/80 rounded-lg transition-all duration-200"
                  >
                    Unstake
                  </button>
                  <button
                    onClick={() => claimRewards(farm.poolId)}
                    className="px-4 py-2 bg-yellow-600/80 hover:bg-yellow-700/80 rounded-lg transition-all duration-200"
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Farms */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Farms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((farm) => (
            <div key={farm.poolId} className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex justify-between mb-4">
                <span className="font-medium">{farm.rewardToken.symbol} Farm</span>
                <span className="text-blue-400">{farm.protocol}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Total Staked</span>
                <span className="font-medium">{farm.totalStaked.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">APR</span>
                <span className="font-medium text-green-400">{farm.apr.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-400">Rewards</span>
                <span className="font-medium">
                  {farm.rewardPerSecond.toFixed(6)} {farm.rewardToken.symbol}/sec
                </span>
              </div>
              <button
                onClick={() => stake(farm.poolId, 0)}
                className="w-full px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 rounded-lg transition-all duration-200"
              >
                Stake
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmsPage;

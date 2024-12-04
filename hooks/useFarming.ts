import { useEffect, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { FeeManager } from '../utils/feeManager';
import { FarmInfo, LiquidityPool } from '../types/liquidity';

export const useFarming = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [farms, setFarms] = useState<FarmInfo[]>([]);
  const [userFarms, setUserFarms] = useState<FarmInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feeManager = useMemo(() => new FeeManager(connection), [connection]);

  // Fetch all available farms
  const fetchFarms = async () => {
    setLoading(true);
    try {
      // Fetch farms from different protocols
      const [raydiumFarms, orcaFarms, meteoraFarms] = await Promise.all([
        fetchRaydiumFarms(),
        fetchOrcaFarms(),
        fetchMeteoraFarms(),
      ]);

      const allFarms = [...raydiumFarms, ...orcaFarms, ...meteoraFarms];
      setFarms(allFarms);
    } catch (err) {
      setError('Failed to fetch farms');
      console.error('Error fetching farms:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's staked positions
  const fetchUserFarms = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const userPositions = await Promise.all(
        farms.map(async (farm) => {
          const userStaked = await fetchUserStakedAmount(farm.poolId);
          return {
            ...farm,
            userStaked,
          };
        })
      );

      setUserFarms(userPositions.filter(farm => farm.userStaked && farm.userStaked > 0));
    } catch (err) {
      setError('Failed to fetch user farms');
      console.error('Error fetching user farms:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stake LP tokens in a farm
  const stake = async (farmId: string, amount: number) => {
    if (!publicKey || !signTransaction) throw new Error('Wallet not connected');

    setLoading(true);
    try {
      const farm = farms.find(f => f.poolId === farmId);
      if (!farm) throw new Error('Farm not found');

      // Create stake transaction
      const transaction = new Transaction();

      // Add fee transfer instruction
      const feeAmount = feeManager.calculateFee(amount);
      await feeManager.addFeeToTransaction(
        transaction,
        publicKey,
        feeAmount
      );

      // Add stake instructions based on protocol
      if (farm.protocol === 'Raydium') {
        // Add Raydium stake instructions
      } else if (farm.protocol === 'Orca') {
        // Add Orca stake instructions
      } else if (farm.protocol === 'Meteora') {
        // Add Meteora stake instructions
      }

      // Sign and send transaction
      const signedTx = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      // Refresh user farms
      await fetchUserFarms();

      return txid;
    } catch (err) {
      setError('Failed to stake');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Unstake LP tokens from a farm
  const unstake = async (farmId: string, amount: number) => {
    if (!publicKey || !signTransaction) throw new Error('Wallet not connected');

    setLoading(true);
    try {
      const farm = userFarms.find(f => f.poolId === farmId);
      if (!farm) throw new Error('Farm position not found');

      // Create unstake transaction
      const transaction = new Transaction();

      // Add fee transfer instruction
      const feeAmount = feeManager.calculateFee(amount);
      await feeManager.addFeeToTransaction(
        transaction,
        publicKey,
        feeAmount
      );

      // Add unstake instructions based on protocol
      if (farm.protocol === 'Raydium') {
        // Add Raydium unstake instructions
      } else if (farm.protocol === 'Orca') {
        // Add Orca unstake instructions
      } else if (farm.protocol === 'Meteora') {
        // Add Meteora unstake instructions
      }

      // Sign and send transaction
      const signedTx = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      // Refresh user farms
      await fetchUserFarms();

      return txid;
    } catch (err) {
      setError('Failed to unstake');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Claim rewards from a farm
  const claimRewards = async (farmId: string) => {
    if (!publicKey || !signTransaction) throw new Error('Wallet not connected');

    setLoading(true);
    try {
      const farm = userFarms.find(f => f.poolId === farmId);
      if (!farm) throw new Error('Farm position not found');

      // Create claim rewards transaction
      const transaction = new Transaction();

      // Add fee transfer instruction
      const feeAmount = feeManager.calculateFee(0.01); // Minimum fee for reward claim
      await feeManager.addFeeToTransaction(
        transaction,
        publicKey,
        feeAmount
      );

      // Add claim rewards instructions based on protocol
      if (farm.protocol === 'Raydium') {
        // Add Raydium claim instructions
      } else if (farm.protocol === 'Orca') {
        // Add Orca claim instructions
      } else if (farm.protocol === 'Meteora') {
        // Add Meteora claim instructions
      }

      // Sign and send transaction
      const signedTx = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      // Refresh user farms
      await fetchUserFarms();

      return txid;
    } catch (err) {
      setError('Failed to claim rewards');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Calculate pending rewards for a farm
  const calculatePendingRewards = async (farmId: string) => {
    const farm = userFarms.find(f => f.poolId === farmId);
    if (!farm) throw new Error('Farm position not found');

    try {
      // Calculate pending rewards based on protocol
      if (farm.protocol === 'Raydium') {
        // Calculate Raydium pending rewards
      } else if (farm.protocol === 'Orca') {
        // Calculate Orca pending rewards
      } else if (farm.protocol === 'Meteora') {
        // Calculate Meteora pending rewards
      }

      return {
        amount: 0, // Placeholder
        value: 0, // USD value
      };
    } catch (err) {
      console.error('Error calculating pending rewards:', err);
      throw err;
    }
  };

  // Initialize
  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (publicKey) {
      fetchUserFarms();
    }
  }, [publicKey, farms]);

  return {
    farms,
    userFarms,
    loading,
    error,
    stake,
    unstake,
    claimRewards,
    calculatePendingRewards,
    refreshFarms: fetchFarms,
    refreshUserFarms: fetchUserFarms,
  };
};

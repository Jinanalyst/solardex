import { PublicKey } from '@solana/web3.js';
import { Token } from './dex';

export interface LiquidityPool {
  id: string;
  protocol: 'Raydium' | 'Orca' | 'Meteora';
  token0: Token;
  token1: Token;
  lpMint: string;
  tvl: number;
  volume24h: number;
  fee: number;
  token0Price: number;
  token1Price: number;
  token0Reserve: number;
  token1Reserve: number;
  lpTotalSupply: number;
  apy: number;
}

export interface UserPosition {
  poolId: string;
  lpAmount: number;
  token0Amount: number;
  token1Amount: number;
  value: number; // USD value
}

export interface PoolStats {
  id: string;
  volume24h: number;
  fees24h: number;
  apy: number;
  tvl: number;
  token0Price: number;
  token1Price: number;
}

export interface PoolTransaction {
  txHash: string;
  type: 'swap' | 'addLiquidity' | 'removeLiquidity';
  timestamp: number;
  token0Amount: number;
  token1Amount: number;
  token0Symbol: string;
  token1Symbol: string;
  account: string;
  fee: number;
}

export interface FarmInfo {
  poolId: string;
  rewardToken: Token;
  rewardPerSecond: number;
  totalStaked: number;
  userStaked?: number;
  apr: number;
}

export interface ConcentratedLiquidityPosition {
  poolId: string;
  tokenId: string;
  lowerTick: number;
  upperTick: number;
  liquidity: number;
  token0Amount: number;
  token1Amount: number;
  inRange: boolean;
  fee: number;
}

export interface PriceRange {
  min: number;
  max: number;
  current: number;
  token0Symbol: string;
  token1Symbol: string;
}

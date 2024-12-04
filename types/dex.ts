import { PublicKey } from '@solana/web3.js';

export interface Token {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoURI?: string;
}

export interface SwapRoute {
  protocol: 'Jupiter' | 'Raydium';
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  marketInfos?: any;
  slippage: number;
  fee: number;
}

export interface QuoteResponse {
  routes: SwapRoute[];
  bestRoute: SwapRoute;
}

export interface SwapState {
  inputToken?: Token;
  outputToken?: Token;
  inputAmount: string;
  routes: SwapRoute[];
  selectedRoute?: SwapRoute;
  slippage: number;
  loading: boolean;
  error?: string;
  fee: number | null;
}

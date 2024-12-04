import { useEffect, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Jupiter, RouteInfo } from '@jup-ag/core';
import { TokenSwap, TOKEN_SWAP_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { PublicKey, Transaction } from '@solana/web3.js';
import { SwapState, Token, SwapRoute, QuoteResponse } from '../types/dex';
import { FeeManager } from '../utils/feeManager';

const JUPITER_CONFIG = {
  cluster: 'mainnet-beta',
};

export const useMultiDexSwap = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [jupiter, setJupiter] = useState<Jupiter | null>(null);
  const [state, setState] = useState<SwapState>({
    inputAmount: '',
    routes: [],
    slippage: 1,
    loading: false,
    fee: null,
  });

  const feeManager = useMemo(() => new FeeManager(connection), [connection]);

  // Initialize Jupiter
  useEffect(() => {
    const init = async () => {
      if (!connection || !publicKey) return;

      try {
        const jupiterInstance = await Jupiter.load({
          connection,
          cluster: JUPITER_CONFIG.cluster,
          user: publicKey,
        });
        setJupiter(jupiterInstance);
      } catch (error) {
        console.error('Error initializing Jupiter:', error);
      }
    };

    init();
  }, [connection, publicKey]);

  const getJupiterQuote = async (
    inputMint: string,
    outputMint: string,
    amount: number,
    slippage: number
  ) => {
    if (!jupiter) return null;

    try {
      const routes = await jupiter.computeRoutes({
        inputMint: new PublicKey(inputMint),
        outputMint: new PublicKey(outputMint),
        amount,
        slippageBps: slippage * 100,
      });

      // Calculate fee for the transaction
      const feeAmount = feeManager.calculateFee(amount);

      return routes.routesInfos.map((route: RouteInfo) => ({
        protocol: 'Jupiter' as const,
        inputAmount: amount,
        outputAmount: Number(route.outAmount),
        priceImpact: route.priceImpactPct,
        marketInfos: route.marketInfos,
        slippage,
        fee: feeAmount,
      }));
    } catch (error) {
      console.error('Error getting Jupiter quote:', error);
      return null;
    }
  };

  const getRaydiumQuote = async (
    inputMint: string,
    outputMint: string,
    amount: number,
    slippage: number
  ) => {
    try {
      // Calculate fee for the transaction
      const feeAmount = feeManager.calculateFee(amount);

      // Implement Raydium quote logic here
      return [{
        protocol: 'Raydium' as const,
        inputAmount: amount,
        outputAmount: 0, // Replace with actual calculation
        priceImpact: 0,
        slippage,
        fee: feeAmount,
      }];
    } catch (error) {
      console.error('Error getting Raydium quote:', error);
      return null;
    }
  };

  const getQuotes = async (
    inputToken: Token,
    outputToken: Token,
    amount: number,
    slippage: number
  ): Promise<QuoteResponse | null> => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const [jupiterRoutes, raydiumRoutes] = await Promise.all([
        getJupiterQuote(inputToken.mint, outputToken.mint, amount, slippage),
        getRaydiumQuote(inputToken.mint, outputToken.mint, amount, slippage),
      ]);

      const allRoutes = [
        ...(jupiterRoutes || []),
        ...(raydiumRoutes || []),
      ].sort((a, b) => b.outputAmount - a.outputAmount);

      const bestRoute = allRoutes[0];

      setState(prev => ({
        ...prev,
        routes: allRoutes,
        selectedRoute: bestRoute,
        loading: false,
        fee: bestRoute?.fee || null,
      }));

      return {
        routes: allRoutes,
        bestRoute,
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch quotes',
      }));
      return null;
    }
  };

  const executeSwap = async (route: SwapRoute) => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      if (route.protocol === 'Jupiter' && jupiter) {
        // Get Jupiter swap transaction
        const { transactions } = await jupiter.exchange({
          routeInfo: route.marketInfos,
        });

        // Add fee transfer to the transaction
        const transactionWithFee = await feeManager.addFeeToTransaction(
          transactions.swapTransaction,
          publicKey,
          route.inputAmount
        );

        // Sign and send transaction
        const signedTx = await signTransaction(transactionWithFee);
        const txid = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(txid);

        setState(prev => ({ ...prev, loading: false }));
        return txid;
      } else if (route.protocol === 'Raydium') {
        // Implement Raydium swap execution with fee
        throw new Error('Raydium swap not implemented yet');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Swap failed',
      }));
      throw error;
    }
  };

  return {
    state,
    getQuotes,
    executeSwap,
  };
};

import { useEffect, useState, useMemo } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LiquidityPool } from '../types/liquidity';

interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartConfig {
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  limit: number;
}

export const usePriceChart = (pool?: LiquidityPool) => {
  const { connection } = useConnection();
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ChartConfig>({
    interval: '1h',
    limit: 100,
  });

  // Fetch historical price data
  const fetchPriceData = async () => {
    if (!pool) return;

    setLoading(true);
    try {
      // Fetch from multiple sources for accuracy
      const [jupiterData, raydiumData, orcaData] = await Promise.all([
        fetchJupiterPrices(),
        fetchRaydiumPrices(),
        fetchOrcaPrices(),
      ]);

      // Aggregate and normalize price data
      const aggregatedData = aggregatePriceData(
        jupiterData,
        raydiumData,
        orcaData
      );

      setPriceData(aggregatedData);
    } catch (err) {
      setError('Failed to fetch price data');
      console.error('Error fetching price data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get TradingView chart configuration
  const getTradingViewConfig = () => {
    if (!pool) return null;

    return {
      symbol: `${pool.token0.symbol}/${pool.token1.symbol}`,
      interval: config.interval,
      container_id: 'tradingview_chart',
      library_path: '/charting_library/',
      locale: 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'solana_dex',
      user_id: 'public_user',
      fullscreen: false,
      autosize: true,
      studies_overrides: {},
      theme: 'Dark',
    };
  };

  // Calculate price statistics
  const getPriceStats = () => {
    if (priceData.length === 0) return null;

    const last24h = priceData.filter(
      d => d.timestamp > Date.now() - 24 * 60 * 60 * 1000
    );

    const currentPrice = priceData[priceData.length - 1].close;
    const openPrice = last24h[0]?.open || 0;
    const highPrice = Math.max(...last24h.map(d => d.high));
    const lowPrice = Math.min(...last24h.map(d => d.low));
    const priceChange = ((currentPrice - openPrice) / openPrice) * 100;

    return {
      currentPrice,
      openPrice,
      highPrice,
      lowPrice,
      priceChange,
    };
  };

  // Calculate technical indicators
  const calculateIndicators = () => {
    if (priceData.length === 0) return null;

    const prices = priceData.map(d => d.close);
    
    return {
      sma20: calculateSMA(prices, 20),
      sma50: calculateSMA(prices, 50),
      rsi: calculateRSI(prices, 14),
      macd: calculateMACD(prices),
    };
  };

  // Utility functions for technical analysis
  const calculateSMA = (prices: number[], period: number) => {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  const calculateRSI = (prices: number[], period: number) => {
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);

    const avgGain = calculateSMA(gains, period)[0];
    const avgLoss = calculateSMA(losses, period)[0];

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateMACD = (prices: number[]) => {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12.map((value, i) => value - ema26[i]);
    const signalLine = calculateEMA(macdLine, 9);
    const histogram = macdLine.map((value, i) => value - signalLine[i]);

    return {
      macdLine,
      signalLine,
      histogram,
    };
  };

  const calculateEMA = (prices: number[], period: number) => {
    const multiplier = 2 / (period + 1);
    const ema = [prices[0]];

    for (let i = 1; i < prices.length; i++) {
      ema.push(
        (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
      );
    }

    return ema;
  };

  // Update chart configuration
  const updateConfig = (newConfig: Partial<ChartConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
    }));
  };

  // Initialize
  useEffect(() => {
    if (pool) {
      fetchPriceData();
      const interval = setInterval(fetchPriceData, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [pool, config.interval]);

  return {
    priceData,
    loading,
    error,
    config,
    updateConfig,
    getTradingViewConfig,
    getPriceStats,
    calculateIndicators,
    refreshPriceData: fetchPriceData,
  };
};

import { FC, useState } from 'react';
import { usePriceChart } from '../hooks/usePriceChart';
import { useLimitOrders } from '../hooks/useLimitOrders';
import { useWallet } from '@solana/wallet-adapter-react';
import { Token } from '../types/dex';

const TradePage: FC = () => {
  const { publicKey } = useWallet();
  const [selectedPair, setSelectedPair] = useState<{token0: Token, token1: Token} | null>(null);
  const { priceData, loading: chartLoading, getTradingViewConfig } = usePriceChart();
  const { 
    orders, 
    orderBook, 
    loading: orderLoading, 
    placeLimitOrder, 
    cancelOrder 
  } = useLimitOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-4">
        {/* Trading Chart */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm h-[600px]">
            {selectedPair ? (
              <div id="tradingview_chart" className="w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a trading pair to view chart
              </div>
            )}
          </div>
        </div>

        {/* Order Book */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm h-[600px]">
            <h2 className="text-xl font-semibold mb-4">Order Book</h2>
            <div className="space-y-4">
              {/* Asks */}
              <div className="space-y-1">
                {orderBook.asks.map((order) => (
                  <div key={order.id} className="flex justify-between text-red-400">
                    <span>{order.price.toFixed(6)}</span>
                    <span>{order.inputAmount.toFixed(6)}</span>
                  </div>
                ))}
              </div>

              {/* Current Price */}
              {selectedPair && (
                <div className="text-center py-2 text-xl font-semibold">
                  {priceData[priceData.length - 1]?.close.toFixed(6)}
                </div>
              )}

              {/* Bids */}
              <div className="space-y-1">
                {orderBook.bids.map((order) => (
                  <div key={order.id} className="flex justify-between text-green-400">
                    <span>{order.price.toFixed(6)}</span>
                    <span>{order.inputAmount.toFixed(6)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Limit Orders */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Place Limit Order</h2>
            {publicKey ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Price</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Amount</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <button className="col-span-2 p-2 bg-green-600/80 hover:bg-green-700/80 rounded-lg transition-all duration-200">
                  Place Buy Order
                </button>
                <button className="col-span-2 p-2 bg-red-600/80 hover:bg-red-700/80 rounded-lg transition-all duration-200">
                  Place Sell Order
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                Connect wallet to place orders
              </div>
            )}
          </div>
        </div>

        {/* Open Orders */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
            <div className="space-y-2">
              {orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {order.inputToken.symbol}/{order.outputToken.symbol}
                    </div>
                    <div className="text-sm text-gray-400">
                      {order.price.toFixed(6)} @ {order.inputAmount.toFixed(6)}
                    </div>
                  </div>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="px-3 py-1 bg-red-600/80 hover:bg-red-700/80 rounded-lg text-sm transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePage;

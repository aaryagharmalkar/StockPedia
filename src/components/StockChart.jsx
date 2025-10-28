import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';

export function StockChart({ symbol, currentPrice, change, predictedPrice }) {
  const [activeTab, setActiveTab] = useState('prediction');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [portfolioHoldings, setPortfolioHoldings] = useState([]);
  const [totalOwnedShares, setTotalOwnedShares] = useState(0);

  // Fetch user's portfolio holdings for this stock
  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .eq('symbol', symbol);

        if (error) throw error;

        setPortfolioHoldings(data || []);
        const total = (data || []).reduce((sum, holding) => sum + holding.quantity, 0);
        setTotalOwnedShares(total);
      } catch (err) {
        console.error('Error fetching holdings:', err);
      }
    };

    if (symbol) {
      fetchHoldings();
    }
  }, [symbol]);

  // Generate candlestick data
  const generateCandlestickData = () => {
    const data = [];
    let basePrice = 2300;
    
    for (let i = 0; i < 90; i++) {
      const open = basePrice + (Math.random() - 0.5) * 50;
      const close = open + (Math.random() - 0.5) * 100;
      const high = Math.max(open, close) + Math.random() * 30;
      const low = Math.min(open, close) - Math.random() * 30;
      const volume = Math.random() * 100000 + 50000;
      
      data.push({ open, close, high, low, volume });
      basePrice = close;
    }
    
    return data;
  };

  const [candleData] = useState(generateCandlestickData());

  // Chart dimensions
  const chartWidth = 1000;
  const chartHeight = 320;
  const volumeHeight = 100;
  const padding = { top: 20, right: 80, bottom: 40, left: 60 };

  // Calculate price range
  const allPrices = candleData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;

  // Calculate volume range
  const maxVolume = Math.max(...candleData.map(d => d.volume));

  // Scale functions
  const scaleX = (index) => padding.left + (index / candleData.length) * (chartWidth - padding.left - padding.right);
  const scaleY = (price) => padding.top + ((maxPrice - price) / priceRange) * (chartHeight - padding.top - padding.bottom);
  const scaleVolume = (volume) => (volume / maxVolume) * volumeHeight;

  // Generate months for x-axis
  const months = ['May', 'Jun', 'Jul', 'Sep', 'Sep'];
  
  // Moving average calculation
  const calculateMA = (period) => {
    const ma = [];
    for (let i = 0; i < candleData.length; i++) {
      if (i < period - 1) {
        ma.push(null);
      } else {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += candleData[i - j].close;
        }
        ma.push(sum / period);
      }
    }
    return ma;
  };

  const ma20 = calculateMA(20);

  // Generate MA line path
  const maPath = ma20.map((price, i) => {
    if (price === null) return null;
    return `${scaleX(i)},${scaleY(price)}`;
  }).filter(p => p !== null).join(' L ');

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const num = parseInt(value) || 0;
    setQuantity(Math.max(0, num));
  };

  // Handle buy stock
  const handleBuyStock = async () => {
    if (quantity <= 0) return;

    setProcessing(true);
    try {
      const totalPrice = currentPrice * quantity;
      
      const { data, error } = await supabase
        .from("portfolio")
        .insert([
          {
            symbol: symbol,
            name: symbol, // You might want to pass the full name as a prop
            quantity: quantity,
            buy_price: currentPrice,
            total_cost: totalPrice,
            currency: "INR",
            purchase_date: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      alert(`Successfully bought ${quantity} shares of ${symbol}`);
      setShowBuyModal(false);
      setQuantity(1);
      
      // Refresh holdings
      const { data: holdings } = await supabase
        .from('portfolio')
        .select('*')
        .eq('symbol', symbol);
      setPortfolioHoldings(holdings || []);
      const total = (holdings || []).reduce((sum, holding) => sum + holding.quantity, 0);
      setTotalOwnedShares(total);
    } catch (err) {
      console.error("Error buying stock:", err);
      alert(`Failed to buy stock: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle sell stock
  const handleSellStock = async () => {
    if (quantity <= 0 || quantity > totalOwnedShares) {
      alert('Invalid quantity');
      return;
    }

    setProcessing(true);
    try {
      let remainingToSell = quantity;
      
      // Sell using FIFO (First In First Out)
      for (const holding of portfolioHoldings.sort((a, b) => 
        new Date(a.purchase_date) - new Date(b.purchase_date)
      )) {
        if (remainingToSell <= 0) break;

        if (holding.quantity <= remainingToSell) {
          // Delete entire holding
          const { error } = await supabase
            .from('portfolio')
            .delete()
            .eq('id', holding.id);
          
          if (error) throw error;
          remainingToSell -= holding.quantity;
        } else {
          // Update holding with reduced quantity
          const newQuantity = holding.quantity - remainingToSell;
          const { error } = await supabase
            .from('portfolio')
            .update({
              quantity: newQuantity,
              total_cost: holding.buy_price * newQuantity
            })
            .eq('id', holding.id);
          
          if (error) throw error;
          remainingToSell = 0;
        }
      }

      alert(`Successfully sold ${quantity} shares of ${symbol}`);
      setShowSellModal(false);
      setQuantity(1);
      
      // Refresh holdings
      const { data: holdings } = await supabase
        .from('portfolio')
        .select('*')
        .eq('symbol', symbol);
      setPortfolioHoldings(holdings || []);
      const total = (holdings || []).reduce((sum, holding) => sum + holding.quantity, 0);
      setTotalOwnedShares(total);
    } catch (err) {
      console.error("Error selling stock:", err);
      alert(`Failed to sell stock: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{symbol}</h2>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold">{currentPrice.toLocaleString()}</span>
          <span className={`text-xl ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        </div>
        {totalOwnedShares > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            You own: <span className="text-white font-semibold">{totalOwnedShares} shares</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('prediction')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'prediction'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
          }`}
        >
          Price Prediction
        </button>
        <button
          onClick={() => setActiveTab('technical')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'technical'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
          }`}
        >
          Technical Indicators
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'news'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
          }`}
        >
          News
        </button>
      </div>

      {/* Chart Container */}
      <div className="bg-gray-800 rounded-lg p-4">
        {/* SVG Chart */}
        <svg width="100%" height="450" viewBox={`0 0 ${chartWidth + padding.right} ${chartHeight + volumeHeight + 20}`} className="overflow-visible" preserveAspectRatio="none">
          {/* Price Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * (chartHeight - padding.top - padding.bottom);
            const price = maxPrice - ratio * priceRange;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text x={chartWidth - padding.right + 10} y={y + 4} fill="#9CA3AF" fontSize="12">
                  {price.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Moving Average Line */}
          {maPath && (
            <path
              d={`M ${maPath}`}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
            />
          )}

          {/* Candlesticks */}
          {candleData.map((candle, i) => {
            const x = scaleX(i);
            const candleWidth = 4;
            const isGreen = candle.close >= candle.open;
            const color = isGreen ? '#10B981' : '#EF4444';
            
            const highY = scaleY(candle.high);
            const lowY = scaleY(candle.low);
            const openY = scaleY(candle.open);
            const closeY = scaleY(candle.close);
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY);

            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1"
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={Math.max(bodyHeight, 1)}
                  fill={color}
                />
              </g>
            );
          })}

          {/* Volume Bars */}
          <g transform={`translate(0, ${chartHeight})`}>
            {candleData.map((candle, i) => {
              const x = scaleX(i);
              const barHeight = scaleVolume(candle.volume);
              const isGreen = candle.close >= candle.open;
              const color = isGreen ? '#10B98150' : '#EF444450';

              return (
                <rect
                  key={i}
                  x={x - 2}
                  y={volumeHeight - barHeight}
                  width={4}
                  height={barHeight}
                  fill={color}
                />
              );
            })}
          </g>

          {/* X-axis labels */}
          {months.map((month, i) => {
            const x = padding.left + (i / (months.length - 1)) * (chartWidth - padding.left - padding.right);
            return (
              <text
                key={i}
                x={x}
                y={chartHeight + volumeHeight + 15}
                fill="#9CA3AF"
                fontSize="12"
                textAnchor="middle"
              >
                {month}
              </text>
            );
          })}
        </svg>

        {/* Prediction and Action Buttons */}
        <div className="mt-6">
          <div className="text-xl mb-4">
            <span className="text-gray-400">Predicted: </span>
            <span className="text-white font-bold text-2xl">₹{predictedPrice.toLocaleString()}</span>
          </div>
          
          <div className={`grid gap-4 ${totalOwnedShares > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <button 
              onClick={() => setShowBuyModal(true)}
              className="py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-xl transition-colors"
            >
              Buy
            </button>
            {totalOwnedShares > 0 && (
              <button 
                onClick={() => setShowSellModal(true)}
                className="py-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-xl transition-colors"
              >
                Sell
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Buy {symbol}
              </h3>
              <button
                onClick={() => setShowBuyModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-800">
                ₹{currentPrice?.toFixed(2) || "0.00"}
              </div>
              <div className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{change?.toFixed(2) || "0.00"}%
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xl font-semibold"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="flex-1 text-center text-lg font-semibold border-2 border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-gray-800"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xl font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Cost:</span>
                <span className="text-2xl font-bold text-gray-800">
                  ₹{((currentPrice || 0) * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyStock}
                disabled={processing || quantity <= 0}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : "Confirm Buy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Sell {symbol}
              </h3>
              <button
                onClick={() => setShowSellModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-800">
                ₹{currentPrice?.toFixed(2) || "0.00"}
              </div>
              <div className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{change?.toFixed(2) || "0.00"}%
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Available: {totalOwnedShares} shares
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xl font-semibold"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={totalOwnedShares}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="flex-1 text-center text-lg font-semibold border-2 border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-gray-800"
                />
                <button
                  onClick={() => setQuantity(Math.min(totalOwnedShares, quantity + 1))}
                  className="w-10 h-10 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xl font-semibold"
                >
                  +
                </button>
              </div>
              {quantity > totalOwnedShares && (
                <p className="text-red-500 text-sm mt-2">
                  Cannot sell more than you own
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Value:</span>
                <span className="text-2xl font-bold text-gray-800">
                  ₹{((currentPrice || 0) * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSellModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSellStock}
                disabled={processing || quantity <= 0 || quantity > totalOwnedShares}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : "Confirm Sell"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
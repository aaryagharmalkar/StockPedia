import React, { useState, useEffect } from 'react';

export function StockChart({ symbol, currentPrice, change, predictedPrice }) {
  const [activeTab, setActiveTab] = useState('prediction');

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
          
          <div className="grid grid-cols-4 gap-4">
            <button className="py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-xl transition-colors">
              Buy
            </button>
            <button className="py-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-xl transition-colors">
              Sell
            </button>
            <button className="py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xl transition-colors">
              Predict
            </button>
            <button className="py-4 bg-blue-900 hover:bg-blue-800 rounded-lg font-bold text-xl transition-colors">
              •••
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
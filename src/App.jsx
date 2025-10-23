import React, { useState } from "react";
import { StockTicker } from "./components/StockTicker";
import { MarketWatch } from "./components/MarketWatch";
import { Portfolio } from "./components/Portfolio";
import { StockChart } from "./components/StockChart";
import { Wallet } from "./components/Wallet";

function App() {
  const [selectedStock, setSelectedStock] = useState(null);

  const handleStockSelect = (symbol) => {
    setSelectedStock(symbol);
  };

  const stockData = {
    symbol: selectedStock || "RELIANCE",
    currentPrice: 2715,
    change: 0.52,
    predictedPrice: 2750,
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 overflow-x-hidden">
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stock Ticker */}
        <StockTicker />

        {/* MarketWatch + Wallet Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketWatch onStockSelect={handleStockSelect} selectedStock={selectedStock} />
          </div>
          <div>
            <Wallet />
          </div>
        </div>

        {/* Stock Chart */}
        <StockChart
          symbol={stockData.symbol}
          currentPrice={stockData.currentPrice}
          change={stockData.change}
          predictedPrice={stockData.predictedPrice}
        />

        {/* Portfolio */}
        <Portfolio />
      </div>
    </div>
  );
}

export default App;

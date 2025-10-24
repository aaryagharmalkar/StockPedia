// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { HomePage } from "./components/HomePage";
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
    <Router>
      <div className="min-h-screen w-screen bg-gray-100 overflow-x-hidden">
        {/* Navbar */}
        <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="text-2xl font-bold">StockPedia</div>
          <div className="flex gap-4">
            <Link className="hover:text-gray-300" to="/">Home</Link>
            <Link className="hover:text-gray-300" to="/market-watch">Market Watch</Link>
            <Link className="hover:text-gray-300" to="/portfolio">Portfolio</Link>
            <Link className="hover:text-gray-300" to="/wallet">Wallet</Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className="w-full space-y-6">
          <Routes>
            {/* Home page */}
            <Route path="/" element={<HomePage />} />

            {/* Other sections */}
            <Route
              path="/market-watch"
              element={
                <MarketWatch
                  onStockSelect={handleStockSelect}
                  selectedStock={selectedStock}
                />
              }
            />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route
              path="/stock-chart"
              element={
                <StockChart
                  symbol={stockData.symbol}
                  currentPrice={stockData.currentPrice}
                  change={stockData.change}
                  predictedPrice={stockData.predictedPrice}
                />
              }
            />
            <Route
              path="*"
              element={
                <div className="text-center text-gray-700 mt-20">
                  Page not found
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

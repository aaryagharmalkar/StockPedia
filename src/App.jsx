// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PillNav from "./components/PillNav";
import logo from "./assets/logo.jpg";

import { HomePage } from "./components/HomePage";
import { MarketWatch } from "./components/MarketWatch";
import Portfolio from "./components/Portfolio";
import { Wallet } from "./components/Wallet";
import { StockChart } from "./components/StockChart";
import LoginSignup from "./components/LoginSignup";

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
      {/* Full-page dark gradient background */}
      <div className="min-h-screen w-screen bg-gradient-to-b from-[#0f1626] to-[#1a1a2e] relative overflow-x-hidden">

        {/* Navbar fixed at top-left */}
        <div className="fixed top-4 left-4 z-[999]">
          <PillNav
            logo={logo}
            logoAlt="StockPedia Logo"
            items={[
              { label: "Home", href: "/" },
              { label: "Market Watch", href: "/market-watch" },
              { label: "Portfolio", href: "/portfolio" },
              { label: "Wallet", href: "/wallet" },
            ]}
            activeHref={window.location.pathname}
            className="bg-transparent"
            ease="power2.easeOut"
            baseColor="#0f1626"
            pillColor="#1a1a2e"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#c0c0ff"
          />
        </div>

        {/* Main content */}
        <div className="pt-[5rem] w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />

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

            {/* 👇 Added Login Route */}
            <Route path="/login" element={<LoginSignup />} />

            <Route
              path="*"
              element={
                <div className="text-center text-white mt-20">
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

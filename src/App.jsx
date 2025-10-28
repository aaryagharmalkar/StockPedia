// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PillNav from "./components/PillNav";
import logo from "./assets/logo.jpg";

import { HomePage } from "./components/HomePage";
import { MarketWatch } from "./components/MarketWatch";
import Portfolio from "./components/Portfolio";
import { StockChart } from "./components/StockChart";
import LoginSignup from "./components/LoginSignup";
import Watchlist from "./components/Watchlist"; // ✅ Proper default import

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
      <div className="min-h-screen w-screen bg-gradient-to-b from-[#0f1626] to-[#1a1a2e] relative overflow-x-hidden">
        {/* Navigation Bar */}
        <div className="fixed top-4 left-4 z-[999]">
          <PillNav
            logo={logo}
            logoAlt="StockPedia Logo"
            items={[
              { label: "Home", href: "/" },
              { label: "Market Watch", href: "/market-watch" },
              { label: "Portfolio", href: "/portfolio" },
              { label: "Watchlist", href: "/watchlist" },
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

        {/* Page Content */}
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
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route
              path="/stock-chart"
              element={<StockChart {...stockData} />}
            />
            <Route
              path="*"
              element={
                <div className="text-center text-white mt-20 text-xl">
                  Page Not Found
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

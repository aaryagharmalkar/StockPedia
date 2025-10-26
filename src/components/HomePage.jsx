// src/components/HomePage.jsx
import React from "react";
import { StockCard } from "./StockCard";
import { NewsCard } from "./NewsCard";
import { HeroSection } from "./HeroSection";
import { TrendingUp, TrendingDown, Activity, Newspaper, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Scroll animation variant
const scrollAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Sample data
const indices = [
  { name: "NIFTY", value: 21430, change: 0.8 },
  { name: "BANKNIFTY", value: 46120, change: -0.3 },
  { name: "SENSEX", value: 72450, change: 0.5 },
];

const topGainers = [
  { symbol: "RELIANCE", price: 2350, change: 2.1 },
  { symbol: "TCS", price: 3300, change: 1.8 },
  { symbol: "INFY", price: 1450, change: 1.5 },
];

const topLosers = [
  { symbol: "SBIN", price: 530, change: -1.5 },
  { symbol: "HDFC", price: 2800, change: -0.9 },
  { symbol: "AXISBANK", price: 750, change: -1.2 },
];

const trendingStocks = [
  { symbol: "RELIANCE", price: 2350, change: 2.1 },
  { symbol: "TCS", price: 3300, change: 1.8 },
  { symbol: "INFY", price: 1450, change: 1.5 },
  { symbol: "HCLTECH", price: 1200, change: 0.9 },
  { symbol: "BAJFINANCE", price: 7100, change: 1.1 },
];

const newsHighlights = [
  {
    title: "Markets closed higher today led by IT and Banking sectors",
    source: "Economic Times",
    date: "Oct 24, 2025",
  },
  {
    title: "Reliance outperforms; analysts expect short-term bullish trend",
    source: "Moneycontrol",
    date: "Oct 24, 2025",
  },
  {
    title: "TCS sees strong momentum after quarterly results",
    source: "Business Standard",
    date: "Oct 23, 2025",
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white space-y-8">
      
      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Market Overview */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollAnimation}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Market Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {indices.map((idx) => (
              <motion.div
                key={idx.name}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-gray-600"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-sm font-medium text-gray-400 mb-2">{idx.name}</h3>
                <span className="text-3xl font-bold block mb-2">{idx.value.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  {idx.change >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-lg font-semibold ${idx.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {idx.change >= 0 ? "+" : ""}{idx.change}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Gainers & Losers */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollAnimation}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-900 bg-opacity-30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-xl font-bold">Top Gainers</h3>
            </div>
            <div className="space-y-3">
              {topGainers.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-900 bg-opacity-30 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Top Losers</h3>
            </div>
            <div className="space-y-3">
              {topLosers.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trending Stocks */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollAnimation}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-900 bg-opacity-30 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold">Trending Stocks</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trendingStocks.map((stock) => (
              <motion.div
                key={stock.symbol}
                className="bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-gray-600 flex flex-col items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <h4 className="font-bold text-lg mb-2">{stock.symbol}</h4>
                <span className="text-2xl font-bold mb-2">₹{stock.price.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`font-semibold ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {Math.abs(stock.change)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Market Summary */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollAnimation}
          className="bg-gradient-to-r from-gray-800 to-gray-750 p-6 rounded-xl shadow-lg border border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-900 bg-opacity-30 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold">AI Market Summary</h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Markets closed higher today led by IT and Banking sectors. Reliance, TCS, and HDFC
              outperformed, while SBI and AxisBank saw minor corrections. AI indicates short-term
              bullish trend for TCS and Reliance.
            </p>
          </div>
        </motion.div>

        {/* News Highlights */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollAnimation}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-900 bg-opacity-30 rounded-lg">
              <Newspaper className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold">News Highlights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsHighlights.map((news, idx) => (
              <NewsCard key={idx} news={news} />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

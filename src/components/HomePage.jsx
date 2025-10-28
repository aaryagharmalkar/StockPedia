import React, { useEffect, useState } from "react";
import { StockCard } from "./StockCard";
import { NewsCard } from "./NewsCard";
import { HeroSection } from "./HeroSection";
import { TrendingUp, TrendingDown, Activity, Newspaper, Sparkles, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { StockTicker } from "./StockTicker";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const scrollAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function HomePage() {
  const [stocks, setStocks] = useState([]);
  const [indices, setIndices] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data from backend
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("http://localhost:5050/api/live");
        console.log("Live stock data:", data);

        // Separate indices (NIFTY, SENSEX, BANKNIFTY)
        const indexData = data
          .filter(
            (item) =>
              item.symbol?.includes("^NSEI") ||
              item.symbol?.includes("^BSESN") ||
              item.symbol?.includes("^NSEBANK")
          )
          .map((item) => {
            let displayName = item.name;
            if (item.symbol.includes("^NSEI")) displayName = "NIFTY 50";
            if (item.symbol.includes("^BSESN")) displayName = "SENSEX";
            if (item.symbol.includes("^NSEBANK")) displayName = "BANK NIFTY";
            return { ...item, displayName };
          });

        setIndices(indexData);

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }

        setStocks(data);

        // Sort by percent change
        const sorted = [...data].sort((a, b) => b.percentChange - a.percentChange);
        setTopGainers(sorted.slice(0, 3));
        setTopLosers(sorted.slice(-3).reverse());
        setTrendingStocks(sorted.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error("Error fetching live stock data:", err);
        setError("Failed to fetch live stock data");
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  const newsHighlights = [
    {
      title: "Markets closed higher today led by IT and Banking sectors",
      source: "Economic Times",
      date: "Oct 28, 2025",
    },
    {
      title: "Reliance outperforms; analysts expect short-term bullish trend",
      source: "Moneycontrol",
      date: "Oct 28, 2025",
    },
    {
      title: "TCS sees strong momentum after quarterly results",
      source: "Business Standard",
      date: "Oct 27, 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white space-y-8">
      {/* Hero Section */}
      <HeroSection />

      {/* 🔐 Login Button (fixed top-right corner) */}
      <div className="fixed top-5 right-5 z-50">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition-all"
        >
          <LogIn className="w-5 h-5" />
          Login / Signup
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <StockTicker />

        {/* Error / Loading */}
        {loading && <p className="text-gray-400 text-center">Loading live market data...</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}

        {/* Market Overview */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={scrollAnimation}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Market Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {indices.map((idx) => (
              <motion.div
                key={idx.symbol}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-gray-600"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-sm font-medium text-gray-400 mb-2">{idx.displayName}</h3>
                <span className="text-3xl font-bold block mb-2">
                  {idx.price?.toLocaleString() || "--"}
                </span>
                <div className="flex items-center gap-2">
                  {idx.percentChange >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span
                    className={`text-lg font-semibold ${
                      idx.percentChange >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {idx.percentChange >= 0 ? "+" : ""}
                    {idx.percentChange?.toFixed(2)}%
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
                <span className="text-2xl font-bold mb-2">
                  ₹{stock.price?.toFixed(2) || "0.00"}
                </span>
                <div className="flex items-center gap-1">
                  {stock.percentChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`font-semibold ${
                      stock.percentChange >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {stock.percentChange?.toFixed(2)}%
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
              Markets show strong momentum across multiple sectors. Top gainers include Reliance,
              TCS, and Infosys. AI suggests a short-term bullish trend.
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

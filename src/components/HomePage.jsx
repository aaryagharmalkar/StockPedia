/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { StockCard } from "./StockCard";
import { NewsCard } from "./NewsCard";
import { HeroSection } from "./HeroSection";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Newspaper,
  Sparkles,
  LogIn,
  User,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { StockTicker } from "./StockTicker";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "./SupabaseClient";

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
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        setUsername(profile?.username || user.email.split("@")[0]);
      }
    };
    checkAuth();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else {
        setUser(null);
        setUsername("");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("http://localhost:5050/api/live");

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

        if (!Array.isArray(data)) throw new Error("Invalid data format");
        setStocks(data);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setShowDropdown(false);
    navigate("/");
  };

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
      <HeroSection />

      {/* 🔐 Login/User Profile Button */}
      <div className="fixed top-5 right-5 z-50">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition-all hover:scale-105"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span>{username}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => navigate("/portfolio")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Portfolio
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-2 text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition-all hover:scale-105"
          >
            <LogIn className="w-5 h-5" />
            Login / Signup
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <StockTicker />
        {loading && <p className="text-gray-400 text-center">Loading live market data...</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}

        {/* Market Overview */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scrollAnimation}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-[#B88BFF]" />
            <h2 className="text-2xl font-bold">Market Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {indices.map((idx) => (
              <motion.div
                key={idx.symbol}
                className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-[#B88BFF]/20 to-[#FFD3E0]/20 border border-gray-700 hover:from-[#B88BFF]/30 hover:to-[#FFD3E0]/30 hover:scale-105 transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-sm font-medium text-gray-300 mb-2">{idx.displayName}</h3>
                <span className="text-3xl font-bold block mb-2">{idx.price?.toLocaleString() || "--"}</span>
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

        {/* Gainers / Losers */}
        <motion.div initial="hidden" whileInView="visible" variants={scrollAnimation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{ title: "Top Gainers", stocks: topGainers, color: "green" }, { title: "Top Losers", stocks: topLosers, color: "red" }].map(
            (section, i) => (
              <div
                key={i}
                className="p-6 rounded-xl shadow-lg border border-gray-700 bg-gradient-to-br from-[#B88BFF]/20 to-[#FFD3E0]/20 hover:from-[#B88BFF]/30 hover:to-[#FFD3E0]/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  {section.color === "green" ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <h3 className="text-xl font-bold">{section.title}</h3>
                </div>
                <div className="space-y-3">
                  {section.stocks.map((stock) => (
                    <StockCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              </div>
            )
          )}
        </motion.div>

        {/* Trending Stocks */}
        <motion.div initial="hidden" whileInView="visible" variants={scrollAnimation}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#B88BFF]" />
            <h3 className="text-2xl font-bold">Trending Stocks</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trendingStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="p-5 rounded-xl shadow-lg border border-gray-700 bg-gradient-to-br from-[#B88BFF]/20 to-[#FFD3E0]/20 hover:from-[#B88BFF]/30 hover:to-[#FFD3E0]/30 flex flex-col items-center justify-center transition-all hover:scale-105"
              >
                <h4 className="font-bold text-lg mb-2">{stock.symbol}</h4>
                <span className="text-2xl font-bold mb-2">₹{stock.price?.toFixed(2) || "0.00"}</span>
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
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Market Summary */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={scrollAnimation}
          className="p-6 rounded-xl shadow-lg border border-gray-700 bg-gradient-to-r from-[#B88BFF]/25 to-[#FFD3E0]/25 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#B88BFF]" />
              <h3 className="text-2xl font-bold">AI Market Summary</h3>
            </div>
            <p className="text-gray-200 text-lg leading-relaxed">
              Markets show strong momentum across multiple sectors. Top gainers include Reliance,
              TCS, and Infosys. AI suggests a short-term bullish trend.
            </p>
          </div>
        </motion.div>

        {/* News Highlights */}
        <motion.div initial="hidden" whileInView="visible" variants={scrollAnimation}>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-[#FFD3E0]" />
            <h3 className="text-2xl font-bold">News Highlights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsHighlights.map((news, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl shadow-lg border border-gray-700 bg-gradient-to-br from-[#B88BFF]/20 to-[#FFD3E0]/20 hover:from-[#B88BFF]/30 hover:to-[#FFD3E0]/30 transition-all hover:scale-105"
              >
                <NewsCard news={news} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

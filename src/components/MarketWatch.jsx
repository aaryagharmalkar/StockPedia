import React, { useState, useEffect } from "react";
import { StockChart } from "./StockChart";
import axios from "axios";
import { supabase } from "./SupabaseClient";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import logo from "../assets/logo.jpg"; // ✅ StockPedia logo

export const MarketWatch = ({ onStockSelect, selectedStock }) => {
  const [stocks, setStocks] = useState([]);
  const [chartStock, setChartStock] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchlistSymbols, setWatchlistSymbols] = useState(new Set());
  const [addingToWatchlist, setAddingToWatchlist] = useState(null);

  const userId = localStorage.getItem("user_id");

  // Fetch user's watchlist symbols
  useEffect(() => {
    if (userId) fetchWatchlistSymbols();
  }, [userId]);

  const fetchWatchlistSymbols = async () => {
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("stock_symbol")
        .eq("user_id", userId);

      if (error) throw error;
      const symbols = new Set(data.map((item) => item.stock_symbol));
      setWatchlistSymbols(symbols);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    }
  };

  // Fetch live stock data
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data } = await axios.get("https://stockpedia.onrender.com/api/live");
        setStocks(data);
        if (!chartStock && data.length > 0) {
          setChartStock(selectedStock || data[0]?.symbol);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stocks:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000);
    return () => clearInterval(interval);
  }, [selectedStock, chartStock]);

  const handleSelect = (symbol) => {
    setChartStock(symbol);
    onStockSelect?.(symbol);
  };

  // Add/remove stock in watchlist
  const handleAddToWatchlist = async (stock, e) => {
    e.stopPropagation();
    if (!userId) {
      alert("Please login to manage your watchlist.");
      return;
    }

    setAddingToWatchlist(stock.symbol);
    try {
      if (watchlistSymbols.has(stock.symbol)) {
        await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", userId)
          .eq("stock_symbol", stock.symbol);
        setWatchlistSymbols((prev) => {
          const newSet = new Set(prev);
          newSet.delete(stock.symbol);
          return newSet;
        });
        showToast(`${stock.symbol} removed from watchlist`, "success");
      } else {
        await supabase.from("watchlist").insert({
          user_id: userId,
          stock_symbol: stock.symbol,
        });
        setWatchlistSymbols((prev) => new Set([...prev, stock.symbol]));
        showToast(`${stock.symbol} added to watchlist`, "success");
      }
    } catch (err) {
      showToast("Failed to update watchlist", "error");
    } finally {
      setAddingToWatchlist(null);
    }
  };

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white font-medium`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Search filter
  const excludedSymbols = ["^NSEI", "^BSESN", "^NSEBANK"];
  const filtered = stocks
    .filter(
      (s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.symbol?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((s) => !excludedSymbols.includes(s.symbol.toUpperCase()));

  const stockData = filtered.find((s) => s.symbol === chartStock) || filtered[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1626] to-[#1a1a2e] text-white p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-10"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-wide">Market Watch</h1>
        </div>
        <div className="text-sm text-gray-400">{watchlistSymbols.size} in watchlist</div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 max-w-md mx-auto"
      >
        <input
          type="text"
          placeholder="Search stocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 bg-[#1b2238] text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88BFF]"
        />
      </motion.div>

      {/* Error or Loading */}
      {loading ? (
        <div className="flex justify-center items-center text-gray-300 py-20">
          <Loader2 className="animate-spin w-8 h-8 text-[#B88BFF]" />
          <span className="ml-3">Loading live stocks...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-10">Failed to load: {error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock List */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1 bg-[#141a2e] border border-white/10 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Live Stocks</h2>
            <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
              {filtered.length > 0 ? (
                filtered.map((stock) => {
                  const isInWatchlist = watchlistSymbols.has(stock.symbol);
                  const isAdding = addingToWatchlist === stock.symbol;
                  const isSelected = chartStock === stock.symbol;
                  return (
                    <motion.div
                      key={stock.symbol}
                      whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(184,139,255,0.4)" }}
                      onClick={() => handleSelect(stock.symbol)}
                      className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#B88BFF]/30 to-[#FFD3E0]/30 border border-[#FFD3E0]"
                          : "bg-[#1a1f35] border border-white/10 hover:border-[#B88BFF]/60"
                      }`}
                    >
                      <div>
                        <h3 className="text-lg font-bold">{stock.symbol}</h3>
                        <p className="text-gray-400 text-sm">{stock.name || "N/A"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {stock.currency === "INR" ? "₹" : "$"}
                            {stock.price?.toFixed(2)}
                          </div>
                          <div
                            className={`text-sm ${
                              stock.percentChange >= 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {stock.percentChange >= 0 ? "+" : ""}
                            {stock.percentChange?.toFixed(2)}%
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleAddToWatchlist(stock, e)}
                          disabled={isAdding}
                          className={`p-2 rounded-full transition-all ${
                            isInWatchlist
                              ? "bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] text-black"
                              : "bg-gray-700 hover:bg-[#B88BFF]/30 text-white"
                          } ${isAdding ? "opacity-50 cursor-not-allowed" : ""}`}
                          title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          {isAdding ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Star
                              className={`w-5 h-5 ${
                                isInWatchlist ? "fill-current text-black" : "text-[#FFD3E0]"
                              }`}
                            />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-center">No stocks match your search</p>
              )}
            </div>
          </motion.div>

          {/* Chart Section */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-2 bg-[#141a2e] border border-white/10 rounded-xl p-6 shadow-lg"
          >
            {stockData ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{stockData.symbol}</h2>
                    <p className="text-gray-400">{stockData.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {stockData.currency === "INR" ? "₹" : "$"}
                      {stockData.price?.toFixed(2)}
                    </div>
                    <span
                      className={`text-xl font-semibold ${
                        stockData.percentChange >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {stockData.percentChange >= 0 ? "+" : ""}
                      {stockData.percentChange?.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <StockChart
                  symbol={stockData.symbol}
                  currentPrice={stockData.price}
                  change={stockData.percentChange}
                  predictedPrice={Math.round((stockData.price || 0) * 1.02)}
                />
              </>
            ) : (
              <div className="text-center text-gray-400 py-20">
                Select a stock to view details
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

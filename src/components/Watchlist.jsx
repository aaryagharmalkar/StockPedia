import { useState, useEffect } from "react";
import { supabase } from "./SupabaseClient";
import { StockChart } from "./StockChart";
import axios from "axios";
import { TrendingUp, TrendingDown, X, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg"; // ✅ your StockPedia logo

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [stockData, setStockData] = useState({});
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [addModal, setAddModal] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (userId) {
      fetchWatchlist();
      fetchLiveStockData();
      const interval = setInterval(fetchLiveStockData, 60000);
      return () => clearInterval(interval);
    } else {
      setError("Please login to view watchlist");
      setLoading(false);
    }
  }, [userId]);

  // ✅ Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setWatchlist(data || []);
      if (data && data.length > 0 && !selectedStock) {
        setSelectedStock(data[0].stock_symbol);
      }
    } catch (err) {
      console.error("Error fetching watchlist:", err);
      setError("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch live stock data
  const fetchLiveStockData = async () => {
    try {
      const { data } = await axios.get("http://localhost:5050/api/live");
      const dataMap = {};
      data.forEach(stock => {
        dataMap[stock.symbol] = stock;
      });
      setStockData(dataMap);
    } catch (err) {
      console.error("Error fetching live data:", err);
    }
  };

  // ✅ Add stock
  const handleAdd = async () => {
    if (!newSymbol.trim()) return alert("Enter a stock symbol");
    const symbol = newSymbol.toUpperCase();

    try {
      const { error } = await supabase
        .from("watchlist")
        .insert([{ user_id: userId, stock_symbol: symbol }]);

      if (error) throw error;

      showToast(`${symbol} added to watchlist`, "success");
      fetchWatchlist();
      setNewSymbol("");
      setAddModal(false);
    } catch (err) {
      console.error("Error adding stock:", err);
      showToast("Failed to add stock to watchlist", "error");
    }
  };

  // ✅ Remove stock
  const handleRemove = async (symbol) => {
    try {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", userId)
        .eq("stock_symbol", symbol);

      if (error) throw error;
      fetchWatchlist();
      showToast(`${symbol} removed from watchlist`, "success");
    } catch (err) {
      console.error("Error removing stock:", err);
      showToast("Failed to remove stock", "error");
    }
  };

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white font-medium`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const currentStockData = selectedStock ? stockData[selectedStock] : null;

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f1626] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-[#B88BFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading Watchlist...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f1626] to-[#1a1a2e] flex flex-col items-center justify-center text-white">
        <p className="text-red-400 text-xl mb-4">{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] hover:shadow-[0_0_15px_#B88BFF] rounded-lg font-semibold transition-all"
        >
          Go to Login
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1626] to-[#1a1a2e] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-10"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-wide">My Watchlist</h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Stock List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-[#141a2e] border border-white/20 rounded-xl p-4 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white">Tracked Stocks</h2>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                 {watchlist.length === 0 ? (
    <div className="text-center text-gray-400 py-10 text-lg">
      No stocks in watchlist
    </div>
  ) : (
    watchlist.map((stock) => {
      const liveData = stockData[stock.stock_symbol];
      const isSelected = selectedStock === stock.stock_symbol;
      return (
        <motion.div
          key={stock.id}
          whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(184,139,255,0.5)" }}
          onClick={() => setSelectedStock(stock.stock_symbol)}
          className={`p-4 rounded-xl cursor-pointer border transition-all ${
            isSelected
              ? "border-[#FFD3E0] bg-gradient-to-r from-[#B88BFF]/30 to-[#FFD3E0]/30"
              : "border-white/10 bg-[#1a1f35] hover:border-[#B88BFF]/60"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{stock.stock_symbol}</h3>
              <p className="text-gray-400 text-sm">{liveData?.name || "Loading..."}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(stock.stock_symbol);
              }}
              className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>
          {liveData && (
            <div className="flex justify-between items-center mt-3">
              <span className="text-xl font-bold">
                {liveData.currency === "INR" ? "₹" : "$"}
                {liveData.price?.toFixed(2)}
              </span>
              <div className="flex items-center gap-1">
                {liveData.percentChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span
                  className={`font-semibold ${
                    liveData.percentChange >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {liveData.percentChange >= 0 ? "+" : ""}
                  {liveData.percentChange?.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </motion.div>
      );
    })
  )}
</div>
            </div>
          </motion.div>

          {/* Right Panel - Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {currentStockData ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(184,139,255,0.4)" }}
                  className="bg-[#141a2e] border border-white/20 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold">{selectedStock}</h2>
                      <p className="text-gray-400">{currentStockData.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">
                        {currentStockData.currency === "INR" ? "₹" : "$"}
                        {currentStockData.price?.toFixed(2)}
                      </div>
                      <span
                        className={`text-2xl font-semibold ${currentStockData.percentChange >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                      >
                        {currentStockData.percentChange >= 0 ? "+" : ""}
                        {currentStockData.percentChange?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Open", value: currentStockData.open },
                      { label: "High", value: currentStockData.high },
                      { label: "Low", value: currentStockData.low },
                      { label: "Volume", value: currentStockData.volume?.toLocaleString() },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="bg-[#1b2238] border border-white/10 rounded-lg p-4 text-center"
                      >
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className="text-lg font-bold">
                          {stat.label !== "Volume"
                            ? `${currentStockData.currency === "INR" ? "₹" : "$"}${stat.value}`
                            : stat.value || "N/A"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(184,139,255,0.4)" }}
                  className="bg-[#141a2e] border border-white/20 rounded-xl p-6"
                >
                  <StockChart
                    symbol={selectedStock}
                    currentPrice={currentStockData.price}
                    change={currentStockData.percentChange}
                    predictedPrice={Math.round(currentStockData.price * 1.02)}
                  />
                </motion.div>
              </>
            ) : (
              <div className="bg-[#141a2e] border border-white/20 rounded-xl p-12 text-center text-gray-400 text-lg">
                Select a stock to view details
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Watchlist;

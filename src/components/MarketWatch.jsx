import React, { useState, useEffect } from "react";
import { StockChart } from "./StockChart";
import axios from "axios";

export const MarketWatch = ({ onStockSelect, selectedStock }) => {
  const [stocks, setStocks] = useState([]);
  const [chartStock, setChartStock] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live stock data from backend
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        console.log("Fetching stocks..."); // Debug log
        const { data } = await axios.get("http://localhost:5050/api/live");
        console.log("Received data:", data); // Debug log - check what you're getting
        console.log("First stock:", data[0]); // Debug log - check structure
        
        setStocks(data);
        if (!chartStock && data.length > 0) {
          setChartStock(selectedStock || data[0]?.symbol);
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error fetching stocks:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, [selectedStock, chartStock]);

  // Handle user selection
  const handleSelect = (symbol) => {
    setChartStock(symbol);
    onStockSelect?.(symbol);
  };

  // Filter for search
  const filtered = stocks.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.symbol?.toLowerCase().includes(search.toLowerCase())
  );

  // Current chart data
  const stockData = filtered.find((s) => s.symbol === chartStock) || filtered[0];

  console.log("Stocks array length:", stocks.length); // Debug log
  console.log("Filtered array length:", filtered.length); // Debug log
  console.log("Search term:", search); // Debug log

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      {/* Market Watch Header */}
      <h3 className="text-lg font-semibold text-gray-800">Market Watch</h3>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search stocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-3 p-2 w-full border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-center p-3 bg-red-50 rounded">
          Error: {error}
        </div>
      )}

      {/* Debug Info */}
      <div className="text-xs text-gray-500 text-center">
        Total stocks: {stocks.length} | Filtered: {filtered.length}
      </div>

      {/* Scrollable Stock List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-gray-500 text-center">Loading stocks...</p>
        ) : error ? (
          <p className="text-red-500 text-center">Failed to load stocks</p>
        ) : filtered.length > 0 ? (
          filtered.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => handleSelect(stock.symbol)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                chartStock === stock.symbol
                  ? "bg-blue-100 border border-blue-200"
                  : "hover:bg-gray-100"
              }`}
            >
              <div>
                <div className="font-semibold text-gray-800">{stock.symbol}</div>
                <div className="text-sm text-gray-500">
                  {stock.name || "N/A"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  {stock.currency === "INR" ? "₹" : "$"}{stock.price?.toFixed(2) || "0.00"}
                </div>
                <div
                  className={`text-sm ${
                    (stock.percentChange || 0) >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {(stock.percentChange || 0) >= 0 ? "+" : ""}
                  {stock.percentChange?.toFixed(2) || "0.00"}%
                </div>
              </div>
            </div>
          ))
        ) : stocks.length > 0 ? (
          <p className="text-gray-500 text-center">No stocks match your search</p>
        ) : (
          <p className="text-gray-500 text-center">No stocks available</p>
        )}
      </div>

      {/* Add Button */}
      <button className="w-full mt-4 p-2 border rounded flex items-center justify-center hover:bg-gray-100 transition-colors">
        <span className="mr-2">➕</span>
        Add to Watchlist
      </button>

      {/* Inline Stock Chart */}
      {stockData && (
        <div className="mt-6">
          <StockChart
            symbol={stockData.symbol}
            currentPrice={stockData.price}
            change={stockData.percentChange}
            predictedPrice={Math.round((stockData.price || 0) * 1.02)} // Example prediction
          />
        </div>
      )}
    </div>
  );
};
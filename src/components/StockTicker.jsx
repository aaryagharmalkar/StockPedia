import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import axios from "axios";

export const StockTicker = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data } = await axios.get("https://stockpedia.onrender.com/api/live");
        console.log("Ticker data:", data);

        // ✅ Only include tradable stocks (exclude indices)
        // Exclude NIFTY, SENSEX, BANKNIFTY (these are indices, not tradable stocks)
const excluded = ["NIFTY", "SENSEX", "BANKNIFTY"];

const onlyStocks = data.filter(
  (item) =>
    !excluded.some(
      (ex) =>
        item.symbol?.toUpperCase().includes(ex) ||
        item.name?.toUpperCase().includes(ex)
    )
);


        // ✅ Keep first 10 for smooth marquee
        const mappedData = onlyStocks.slice(0, 10).map((s) => ({
          symbol: s.symbol,
          name: s.name,
          price: s.price,
          percentChange: s.percentChange,
          currency: s.currency,
        }));

        setStocks(mappedData);
      } catch (err) {
        console.error("Error fetching ticker stocks:", err);
      }
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  if (stocks.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border-b border-gray-700 overflow-hidden">
      <div className="flex items-center gap-10 px-6 py-3 animate-marquee">
        {[...stocks, ...stocks].map((stock, index) => (
          <div
            key={`${stock.symbol}-${index}`}
            className="flex items-center gap-3 whitespace-nowrap text-gray-300 hover:text-white transition-colors duration-200"
          >
            {/* Symbol */}
            <span className="font-semibold text-gray-100">{stock.symbol}</span>

            {/* Price */}
            <span className="text-gray-200">
              {stock.currency === "INR" ? "₹" : "$"}
              {stock.price?.toFixed(2)}
            </span>

            {/* Percent change */}
            <span
              className={`flex items-center gap-1 text-sm ${
                stock.percentChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {stock.percentChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {stock.percentChange >= 0 ? "+" : ""}
              {stock.percentChange?.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* Animation style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

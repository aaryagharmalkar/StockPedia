import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const stocks = [
  { symbol: "RELIANCE", price: 2715.0, change: 0.52 },
  { symbol: "HDFCBANK", price: 1917.35, change: 0.76 },
  { symbol: "TN", price: 1820.5, change: -1.5 },
  { symbol: "TCS", price: 3840.0, change: 0.79 },
  { symbol: "ITC", price: 492.05, change: 0.32 },
];

export const StockTicker = () => {
  return (
    <div className="bg-white border-b border-gray-200 overflow-hidden">
      <div className="flex items-center gap-8 px-6 py-3 animate-marquee">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-semibold text-gray-800">{stock.symbol}</span>
            <span className="text-gray-800">{stock.price.toFixed(2)}</span>
            <span
              className={`flex items-center gap-1 text-sm ${
                stock.change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {stock.change >= 0 ? "+" : ""}
              {stock.change}%
            </span>
          </div>
        ))}
      </div>

      {/* Simple marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

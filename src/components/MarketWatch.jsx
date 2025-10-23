import React from "react";

const watchlist = [
  { symbol: "RELIANCE", price: 2715.0, previousPrice: 2646, change: 0.52 },
  { symbol: "TCS", price: 3340.0, previousPrice: 926, change: 0.73 },
  { symbol: "HDFC", price: 2650.35, previousPrice: 2956, change: 0.37 },
];

export const MarketWatch = ({ onStockSelect, selectedStock }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Market Watch</h3>

      {/* Search Input */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search"
          className="pl-10 p-2 w-full border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Stock List */}
      <div className="space-y-3">
        {watchlist.map((stock) => (
          <div
            key={stock.symbol}
            onClick={() => onStockSelect?.(stock.symbol)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              selectedStock === stock.symbol
                ? "bg-blue-100 border border-blue-200"
                : "hover:bg-gray-100"
            }`}
          >
            <div>
              <div className="font-semibold text-gray-800">{stock.symbol}</div>
              <div className="text-sm text-gray-500">{stock.previousPrice.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">{stock.price.toLocaleString()}</div>
              <div className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stock.change >= 0 ? "+" : ""}
                {stock.change}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button className="w-full mt-4 p-2 border rounded flex items-center justify-center hover:bg-gray-100">
        <span className="mr-2">➕</span>
        Add to Watchlist
      </button>
    </div>
  );
};

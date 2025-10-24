// src/components/StockCard.jsx
import React from "react";

export function StockCard({ stock }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-700">
      <span>{stock.symbol}</span>
      <div className="flex gap-2">
        <span>{stock.price.toLocaleString()}</span>
        <span className={stock.change >= 0 ? "text-green-400" : "text-red-400"}>
          {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change)}%
        </span>
      </div>
    </div>
  );
}

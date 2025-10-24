// src/components/NewsCard.jsx
import React from "react";

export function NewsCard({ news }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg flex flex-col justify-between h-full">
      <h4 className="font-semibold mb-2">{news.title}</h4>
      <span className="text-gray-400 text-sm">{news.source}</span>
      <span className="text-gray-400 text-sm">{news.date}</span>
    </div>
  );
}

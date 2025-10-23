import React from "react";

export const Wallet = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Wallet</h3>
      <div className="space-y-2">
        <div className="text-3xl font-bold text-gray-800">₹ 10,00,000</div>
        <div className="text-red-500 text-sm font-medium">-₹1,500 (-0.15%)</div>
      </div>
    </div>
  );
};

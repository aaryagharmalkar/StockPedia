import React from "react";

const holdings = [
  { symbol: "RELIANCE", quantity: 50, avgPrice: 2700, currentPrice: 2715.0 },
];

export const Portfolio = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Portfolio</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Avg.
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holdings.map((holding) => (
              <tr key={holding.symbol}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                  {holding.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                  {holding.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                  ₹{holding.avgPrice.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

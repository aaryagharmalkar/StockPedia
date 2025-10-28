import express from "express";
import YahooFinance from "yahoo-finance2";

const router = express.Router();
const yahooFinance = new YahooFinance();

// ✅ Add Indian indices
const indices = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^BSESN", name: "SENSEX" },
  { symbol: "^NSEBANK", name: "BANK NIFTY" },
];

// ✅ Your existing stock list
const stocks = [
  "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
  "KOTAKBANK.NS", "SBIN.NS", "AXISBANK.NS", "BHARTIARTL.NS", "LT.NS",
  "ITC.NS", "HINDUNILVR.NS", "HCLTECH.NS", "SUNPHARMA.NS", "TATAMOTORS.NS",
  "MARUTI.NS", "M&M.NS", "ULTRACEMCO.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS",
  "ADANIENT.NS", "ADANIPORTS.NS", "POWERGRID.NS", "NTPC.NS", "ONGC.NS",
  "COALINDIA.NS", "HINDALCO.NS", "JSWSTEEL.NS", "TATASTEEL.NS", "TECHM.NS",
  "WIPRO.NS", "BRITANNIA.NS", "NESTLEIND.NS", "ASIANPAINT.NS", "HDFCLIFE.NS",
  "SBILIFE.NS", "TITAN.NS", "HEROMOTOCO.NS", "EICHERMOT.NS", "GRASIM.NS",
  "UPL.NS", "CIPLA.NS", "DRREDDY.NS", "DIVISLAB.NS", "APOLLOHOSP.NS",
  "BAJAJ-AUTO.NS", "INDUSINDBK.NS", "BPCL.NS", "HAL.NS", "TATAPOWER.NS",
];

router.get("/live", async (req, res) => {
  try {
    // ✅ Combine indices + stocks
    const allSymbols = [
      ...indices.map((i) => ({ symbol: i.symbol, type: "index" })),
      ...stocks.map((s) => ({ symbol: s, type: "stock" })),
    ];

    const quotes = await Promise.all(
      allSymbols.map(async ({ symbol, type }) => {
        try {
          const result = await yahooFinance.quote(symbol);

          // 🧠 Use custom name for indices
          const customName =
            indices.find((i) => i.symbol === symbol)?.name ||
            result.shortName ||
            result.longName ||
            symbol;

          return {
            symbol,
            name: customName,
            price: result.regularMarketPrice,
            change: result.regularMarketChange,
            percentChange: result.regularMarketChangePercent,
            currency: result.currency,
            time: result.regularMarketTime,
            type, // 🔥 Helps frontend separate stocks vs indices
          };
        } catch (err) {
          console.error(`❌ Error fetching ${symbol}:`, err.message);
          return null;
        }
      })
    );

    const validQuotes = quotes.filter(Boolean);
    res.json(validQuotes);
  } catch (err) {
    console.error("❌ Yahoo API error:", err);
    res.status(500).json({ error: "Failed to fetch live stock data" });
  }
});

export default router;

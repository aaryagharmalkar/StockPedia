import express from "express";
import YahooFinance from "yahoo-finance2";

const router = express.Router();

// Create an instance of YahooFinance
const yahooFinance = new YahooFinance();

const symbols = [
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
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          // Use the instance to call methods
          const result = await yahooFinance.quote(symbol);
          
          return {
            symbol: symbol,
            name: result.shortName || result.longName,
            price: result.regularMarketPrice,
            change: result.regularMarketChange,
            percentChange: result.regularMarketChangePercent,
            currency: result.currency,
            time: result.regularMarketTime,
          };
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err.message);
          return null;
        }
      })
    );

    // Filter out any null results from failed requests
    const validQuotes = quotes.filter(q => q !== null);
    
    res.json(validQuotes);
  } catch (err) {
    console.error("❌ Yahoo API error:", err);
    res.status(500).json({ error: "Failed to fetch live stock data" });
  }
});

export default router;
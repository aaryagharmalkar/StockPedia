import 'dotenv/config';
import express from "express";
import cors from "cors";
import liveStocksRoute from "./routes/LiveStocks.js";
import authRoutes from "./routes/auth.js";
import portfolioRoutes from "./routes/portfolio.js";
import watchlistRoutes from "./routes/watchlist.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("✅ StockPedia Server running"));

// Routes
app.use("/api", liveStocksRoute);
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/watchlist", watchlistRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log("🚀 Server running on port${PORT}");
});


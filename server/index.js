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

app.listen(5050, () => console.log("🚀 Server running on http://localhost:5050"));
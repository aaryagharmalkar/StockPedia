import express from "express";
import cors from "cors";
import liveStocksRoute from "./routes/LiveStocks.js";

const app = express();
const PORT = 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Default route (just to test server)
app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

// Use the /api route for live stocks
app.use("/api", liveStocksRoute);

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

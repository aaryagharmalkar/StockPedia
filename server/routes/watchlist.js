// routes/watchlist.js
import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// 🧠 Debug: Check if .env is loading
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY ? "Loaded ✅" : "❌ Missing");

// ✅ Initialize Supabase client (backend service key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ✅ GET /api/watchlist/:userId - Get user's watchlist
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ POST /api/watchlist/add - Add stock to watchlist
router.post("/add", async (req, res) => {
  try {
    const { user_id, symbol, name } = req.body;

    if (!user_id || !symbol)
      return res.status(400).json({ error: "user_id and symbol are required" });

    const { data, error } = await supabase
      .from("watchlist")
      .insert({
        user_id,
        symbol: symbol.toUpperCase(),
        name: name || symbol.toUpperCase(),
        added_at: new Date().toISOString(),
      })
      .select();

    if (error?.code === "23505")
      return res.status(409).json({ error: "Stock already in watchlist" });

    if (error) throw error;

    res.status(201).json({ message: "Stock added to watchlist", data });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE /api/watchlist/remove - Remove stock from watchlist
router.delete("/remove", async (req, res) => {
  try {
    const { user_id, symbol } = req.body;

    if (!user_id || !symbol)
      return res.status(400).json({ error: "user_id and symbol are required" });

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user_id)
      .eq("symbol", symbol.toUpperCase());

    if (error) throw error;

    res.json({ message: "Stock removed from watchlist" });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET /api/watchlist/:userId/check/:symbol - Check if stock is in watchlist
router.get("/:userId/check/:symbol", async (req, res) => {
  try {
    const { userId, symbol } = req.params;
    const { data, error } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", userId)
      .eq("symbol", symbol.toUpperCase())
      .single();

    if (error && error.code !== "PGRST116") throw error;
    res.json({ inWatchlist: !!data });
  } catch (error) {
    console.error("Error checking watchlist:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET /api/watchlist/:userId/symbols - Get only symbols
router.get("/:userId/symbols", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("watchlist")
      .select("symbol")
      .eq("user_id", userId);

    if (error) throw error;
    const symbols = data.map((item) => item.symbol);
    res.json(symbols);
  } catch (error) {
    console.error("Error fetching symbols:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

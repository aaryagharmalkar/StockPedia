import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

// GET - Fetch user's watchlist
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Add stock to watchlist
router.post('/add', async (req, res) => {
  try {
    const { user_id, symbol } = req.body;

    if (!user_id || !symbol) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if stock already exists in watchlist
    const { data: existing, error: checkError } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user_id)
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }

    // Add to watchlist
    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id,
        symbol: symbol.toUpperCase()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: `${symbol} added to watchlist`, data });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remove stock from watchlist
router.delete('/remove', async (req, res) => {
  try {
    const { user_id, symbol } = req.body;

    if (!user_id || !symbol) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user_id)
      .eq('symbol', symbol.toUpperCase());

    if (error) throw error;

    res.json({ success: true, message: `${symbol} removed from watchlist` });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
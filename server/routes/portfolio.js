import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

// GET - Fetch user's portfolio and wallet balance
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user's wallet balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Fetch user's portfolio
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId);

    if (portfolioError) throw portfolioError;

    res.json({
      wallet_balance: userData.wallet_balance,
      portfolio: portfolioData
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Buy stock
router.post('/buy', async (req, res) => {
  try {
    const { user_id, symbol, quantity, price } = req.body;

    // Validate input
    if (!user_id || !symbol || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const totalCost = quantity * price;

    // Get current wallet balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', user_id)
      .single();

    if (userError) throw userError;

    // Check if user has enough balance
    if (userData.wallet_balance < totalCost) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Check if stock already exists in portfolio
    const { data: existingStock, error: checkError } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', user_id)
      .eq('symbol', symbol)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (stock doesn't exist)
      throw checkError;
    }

    if (existingStock) {
      // Update existing stock - calculate new average price
      const newQuantity = existingStock.quantity + quantity;
      const newAvgPrice = ((existingStock.avg_price * existingStock.quantity) + (price * quantity)) / newQuantity;

      const { error: updateError } = await supabase
        .from('portfolio')
        .update({
          quantity: newQuantity,
          avg_price: newAvgPrice
        })
        .eq('id', existingStock.id);

      if (updateError) throw updateError;
    } else {
      // Insert new stock
      const { error: insertError } = await supabase
        .from('portfolio')
        .insert({
          user_id,
          symbol,
          quantity,
          avg_price: price
        });

      if (insertError) throw insertError;
    }

    // Deduct amount from wallet
    const { error: walletError } = await supabase
      .from('users')
      .update({ wallet_balance: userData.wallet_balance - totalCost })
      .eq('id', user_id);

    if (walletError) throw walletError;

    res.json({ 
      success: true, 
      message: `Successfully bought ${quantity} shares of ${symbol}`,
      new_balance: userData.wallet_balance - totalCost
    });
  } catch (error) {
    console.error('Error buying stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Sell stock
router.post('/sell', async (req, res) => {
  try {
    const { user_id, symbol, quantity, price } = req.body;

    // Validate input
    if (!user_id || !symbol || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const totalAmount = quantity * price;

    // Check if stock exists in portfolio
    const { data: existingStock, error: checkError } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', user_id)
      .eq('symbol', symbol)
      .single();

    if (checkError) {
      return res.status(404).json({ error: 'Stock not found in portfolio' });
    }

    // Check if user has enough quantity
    if (existingStock.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock quantity' });
    }

    // Update or delete stock from portfolio
    if (existingStock.quantity === quantity) {
      // Delete the stock completely
      const { error: deleteError } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', existingStock.id);

      if (deleteError) throw deleteError;
    } else {
      // Reduce quantity
      const { error: updateError } = await supabase
        .from('portfolio')
        .update({ quantity: existingStock.quantity - quantity })
        .eq('id', existingStock.id);

      if (updateError) throw updateError;
    }

    // Get current wallet balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', user_id)
      .single();

    if (userError) throw userError;

    // Add amount to wallet
    const { error: walletError } = await supabase
      .from('users')
      .update({ wallet_balance: userData.wallet_balance + totalAmount })
      .eq('id', user_id);

    if (walletError) throw walletError;

    res.json({ 
      success: true, 
      message: `Successfully sold ${quantity} shares of ${symbol}`,
      new_balance: userData.wallet_balance + totalAmount
    });
  } catch (error) {
    console.error('Error selling stock:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

// POST - Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    // Insert user data into users table with default wallet balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        username,
        wallet_balance: 10000 // Default ₹10,000
      })
      .select()
      .single();

    if (userError) throw userError;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: authData.user,
      username: userData.username,
      wallet_balance: userData.wallet_balance
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Failed to create account' });
  }
});

// POST - Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    // Fetch user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username, wallet_balance')
      .eq('id', authData.user.id)
      .single();

    if (userError) throw userError;

    res.json({
      success: true,
      message: 'Login successful',
      user: authData.user,
      username: userData.username,
      wallet_balance: userData.wallet_balance
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// POST - Logout
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
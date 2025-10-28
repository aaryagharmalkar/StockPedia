'use client';
import { useEffect, useState } from 'react';
import { supabase } from './SupabaseClient';
import { LogOut, TrendingUp, Plus } from 'lucide-react';
import axios from "axios";
import CountUp from './CountUp';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [livePrices, setLivePrices] = useState({});
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
      fetchPortfolio(data.user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchPortfolio = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) console.error('Error fetching portfolio:', error);
    else setPortfolio(data);
    setLoading(false);
  };

  useEffect(() => {
    async function fetchBalance() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (!error && data) setBalance(Number(data.balance));
    }
    fetchBalance();
  }, [user]);

  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const { data } = await axios.get("http://localhost:5050/api/live");
        const pricesMap = {};
        data.forEach(stock => {
          pricesMap[stock.symbol.toUpperCase()] = parseFloat(stock.price);
        });
        setLivePrices(pricesMap);
      } catch (err) {
        console.error("Error fetching live prices:", err);
      }
    };
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleStockClick = (symbol) => {
    navigate("/market-watch", { state: { selectedStock: symbol } });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#13132A] to-[#1A1A2E] text-white p-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center mb-12"
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] bg-clip-text text-transparent tracking-wide drop-shadow-lg">
          📊 My Portfolio
        </h1>

        {user && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#B88BFF]/10 to-[#FFD3E0]/10 px-6 py-4 rounded-2xl border border-[#B88BFF]/40 shadow-[0_0_15px_rgba(184,139,255,0.3)]">
            <div className="p-3 bg-gradient-to-br from-[#B88BFF]/20 to-[#FFD3E0]/20 rounded-full text-lg">
              💰
            </div>
            <div>
              <p className="text-sm text-gray-400">Wallet Balance</p>
              <h2 className="text-2xl font-bold text-white">
                ₹
                <CountUp
                  from={0}
                  to={Number(balance) || 0}
                  separator=","
                  direction="up"
                  duration={0.8}
                  className="text-[#FFD3E0] font-semibold"
                />
              </h2>
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(184,139,255,0.8)" }}
          whileTap={{ scale: 0.95 }}
          onClick={user ? handleLogout : () => (window.location.href = '/login')}
          className="px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] shadow-lg transition-all duration-500 ease-out"
        >
          {user ? "Logout" : "Login / Signup"}
        </motion.button>
      </motion.div>

      {/* Content */}
      {loading ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 text-center mt-20"
        >
          Loading portfolio...
        </motion.p>
      ) : portfolio.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-28"
        >
          <p className="text-gray-400 text-lg">You don’t have any investments yet.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] rounded-full font-semibold text-[#0A0A0F] shadow-lg hover:shadow-[0_0_25px_rgba(184,139,255,0.5)]"
            onClick={() => navigate('/market-watch')}
          >
            <Plus className="inline-block mr-2" /> Explore Stocks
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {portfolio.map((item, index) => (
            <motion.div
              key={item.id}
              onClick={() => handleStockClick(item.symbol)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(184,139,255,0.5)",
                borderColor: "#B88BFF",
              }}
              className="cursor-pointer bg-[#151521]/80 rounded-2xl p-6 border border-[#2A2A40] shadow-md backdrop-blur-md transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white tracking-wide">
                  {item.symbol}
                </h2>
                <div className="p-2 bg-green-900/40 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
              </div>

              <p className="text-gray-300">{item.name}</p>
              <p className="mt-3 text-gray-400 text-sm">
                Quantity: <span className="text-white font-semibold">{item.quantity}</span>
              </p>
              <p className="text-gray-400 text-sm">
                Buy Price: <span className="text-white font-semibold">₹{item.buy_price}</span>
              </p>
              <p className="text-gray-400 text-sm">
                Current Price:{" "}
                <span className="text-[#FFD3E0] font-semibold">
                  ₹{livePrices[item.symbol.toUpperCase()]?.toFixed(2) || "—"}
                </span>
              </p>
              <p className="text-gray-400 text-sm">
                Total Cost: <span className="text-white font-semibold">₹{item.total_cost}</span>
              </p>
              <p className="text-gray-500 text-xs mt-3">
                Purchased on {new Date(item.purchase_date).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

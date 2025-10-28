'use client';
import { useEffect, useState } from 'react';
import { supabase } from './SupabaseClient';
import { LogOut, TrendingUp, Plus } from 'lucide-react';
import axios from "axios";
import CountUp from './CountUp';
import { useNavigate } from 'react-router-dom';

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

  // ✅ Fetch logged-in user
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
      fetchPortfolio(data.user.id);
      fetchWalletBalance(data.user.id);
    } else {
      setLoading(false);
    }
  };

  // ✅ Fetch portfolio items directly from Supabase
  const fetchPortfolio = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId) // this assumes you added user_id to your table
      .order('purchase_date', { ascending: false });

    if (error) console.error('Error fetching portfolio:', error);
    else setPortfolio(data);

    setLoading(false);
  };

  useEffect(() => {
    async function fetchBalance() {
      console.log("🧾 Fetching wallet balance for:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      console.log("📦 Supabase returned:", data, "Error:", error);

      if (error) {
        console.error("Error fetching balance:", error.message);
      } else if (data) {
        // ✅ Ensure it's numeric
        setBalance(Number(data.balance));
      }
    }

    if (user?.id) {
      fetchBalance();
    }
  }, [user]);


  useEffect(() => {
  const fetchLivePrices = async () => {
    try {
      const { data } = await axios.get("http://localhost:5050/api/live");
      // Convert array of live stocks into an object: { SYMBOL: price }
      const pricesMap = {};
      data.forEach(stock => {
        pricesMap[stock.symbol.toUpperCase()] = parseFloat(stock.price);
      });
      setLivePrices(pricesMap);
    } catch (err) {
      console.error("Error fetching live prices:", err);
    }
  };

  fetchLivePrices(); // initial call
  const interval = setInterval(fetchLivePrices, 60000); // refresh every 1 minute
  return () => clearInterval(interval);
}, []);


  // ✅ Logout user
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

   // ✅ Handle stock click → navigate to MarketWatch
  const handleStockClick = (symbol) => {
    navigate("/market-watch", { state: { selectedStock: symbol } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] to-[#1A1A2E] text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-wide">📈 My Portfolio</h1>
        {user && (
  <div className="flex items-center gap-3 mt-2 bg-gradient-to-r from-[#B88BFF]/10 to-[#FFD3E0]/10 px-6 py-3 rounded-2xl border border-[#B88BFF]/30 shadow-[0_0_15px_rgba(184,139,255,0.3)]">
    <div className="p-3 bg-gradient-to-br from-[#B88BFF]/20 to-[#FFD3E0]/20 rounded-full">
      💰
    </div>
    <div>
      <p className="text-sm text-gray-400 tracking-wide">Wallet Balance</p>
      <h2 className="text-2xl font-bold text-white flex items-baseline gap-1">
        ₹
        <CountUp
          from={0}
          to={Number(balance) || 0}
          separator=","
          direction="up"
          duration={0.5}
          className="text-[#FFD3E0] font-semibold"
        />
      </h2>
    </div>
  </div>
)}



        {/* Gradient Login/Logout button */}
        {user ? (
          <button
            onClick={handleLogout}
            className="px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] 
              shadow-lg hover:shadow-[0_0_25px_rgba(184,139,255,0.8)] 
              transform hover:scale-105 transition-all duration-500 ease-out"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => (window.location.href = '/login')}
            className="px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] 
              shadow-lg hover:shadow-[0_0_25px_rgba(184,139,255,0.8)] 
              transform hover:scale-105 transition-all duration-500 ease-out"
          >
            Login / Signup
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400 text-center mt-20">Loading portfolio...</p>
      ) : portfolio.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-gray-400">No investments yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <div
              key={item.id}
              onClick={() => handleStockClick(item.symbol)} // ✅ Click → navigate
              className="cursor-pointer bg-[#151521] rounded-xl p-6 shadow-lg border border-[#2A2A40]
                         hover:border-[#B88BFF] hover:shadow-[0_0_25px_rgba(184,139,255,0.5)]
                         transform hover:scale-105 transition-all duration-300 ease-out"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{item.symbol}</h2>
                <div className="p-2 bg-green-900 bg-opacity-30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <p className="text-gray-300">{item.name}</p>
              <p className="mt-2 text-gray-400 text-sm">
                Quantity: <span className="text-white font-semibold">{item.quantity}</span>
              </p>
              <p className="text-gray-400 text-sm">
                Buy Price: <span className="text-white font-semibold">₹{item.buy_price}</span>
              </p>
              <p className="text-gray-400 text-sm">
                Current Price:{" "}<span className="text-white font-semibold">₹{livePrices[item.symbol.toUpperCase()]?.toFixed(2) || "—"}</span>
              </p>
              <p className="text-gray-400 text-sm">
                Total Cost: <span className="text-white font-semibold">₹{item.total_cost}</span>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Purchased: {new Date(item.purchase_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

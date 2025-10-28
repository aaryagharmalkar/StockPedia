import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './SupabaseClient';
import logo from '../assets/StockPedia logo.png'; // ✅ make sure this path & filename are correct

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) navigate('/');
    };
    checkUser();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    if (!isLogin) {
      if (!formData.username) {
        setError('Username is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();

        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('username', profile?.username || '');

        alert('✅ Login successful!');
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { username: formData.username } }
        });
        if (error) throw error;

        if (data.user) {
          localStorage.setItem('user_id', data.user.id);
          localStorage.setItem('user_email', data.user.email);
          localStorage.setItem('username', formData.username);

          alert('✅ Account created successfully! Check your email to verify your account.');
          navigate('/');
        } else throw new Error('User creation failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0012] via-[#15002a] to-[#1a0036] flex items-center justify-center p-6">
      <div className="bg-[#120020]/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.15)] 
                      w-full max-w-md p-8 transition-all duration-500 ease-in-out 
                      hover:shadow-[0_0_40px_rgba(184,139,255,0.5)] hover:scale-[1.02]">

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3 group">
            <img
              src={logo}
              alt="StockPedia Logo"
              className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform duration-500 
                         group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_0_20px_rgba(184,139,255,0.7)]"
            />
            <h1 className="text-5xl font-bold text-white tracking-wide transition-transform duration-500 
                           group-hover:scale-110 drop-shadow-[0_0_10px_rgba(255,211,224,0.7)]">
              StockPedia
            </h1>
          </div>
          <p className="text-gray-300 mt-2 text-sm tracking-wide">
            {isLogin ? 'Login to your account' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(184,139,255,0.4)] rounded-lg p-1">
              <label className="block text-sm font-medium text-white mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                disabled={loading}
                className="w-full px-4 py-2 bg-[#1b0032] border border-white/40 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white outline-none transition duration-300"
              />
            </div>
          )}

          <div className="transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,211,224,0.4)] rounded-lg p-1">
            <label className="block text-sm font-medium text-white mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#1b0032] border border-white/40 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white outline-none transition duration-300"
            />
          </div>

          <div className="transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(184,139,255,0.4)] rounded-lg p-1">
            <label className="block text-sm font-medium text-white mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#1b0032] border border-white/40 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white outline-none transition duration-300"
            />
          </div>

          {!isLogin && (
            <div className="transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,211,224,0.4)] rounded-lg p-1">
              <label className="block text-sm font-medium text-white mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={loading}
                className="w-full px-4 py-2 bg-[#1b0032] border border-white/40 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white outline-none transition duration-300"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm animate-pulse">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold text-lg 
                       bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] 
                       hover:from-[#FFD3E0] hover:to-[#B88BFF]
                       transition-all duration-500 shadow-[0_0_20px_rgba(255,211,224,0.5)] 
                       hover:shadow-[0_0_30px_rgba(184,139,255,0.6)] hover:scale-[1.03]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        {/* Switch Between Login/Signup */}
        <div className="text-center mt-6">
          <p className="text-gray-300">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              className="text-white font-semibold cursor-pointer hover:underline hover:text-[#FFD3E0] transition-all"
              onClick={toggleMode}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>

        {!isLogin && (
          <div className="mt-6 bg-white/5 border border-white/30 rounded-lg p-4 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <p className="text-white font-medium">🎁 Get ₹10,00,000 virtual money on signup!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;

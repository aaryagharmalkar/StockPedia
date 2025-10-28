import { useState, useEffect } from 'react';
import axios from 'axios';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (userId) {
      fetchWatchlist();
    } else {
      setError('Please login to view watchlist');
      setLoading(false);
    }
  }, [userId]);

  // Fetch watchlist with live prices
  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      
      // Fetch watchlist symbols
      const watchlistRes = await axios.get(`http://localhost:5050/api/watchlist/${userId}`);
      const watchlistSymbols = watchlistRes.data;

      if (watchlistSymbols.length > 0) {
        // Fetch current prices
        const symbols = watchlistSymbols.map(item => item.symbol).join(',');
        const pricesRes = await axios.get(`http://localhost:5050/api/stocks/live?symbols=${symbols}`);
        const currentPrices = pricesRes.data;

        // Merge data
        const enrichedWatchlist = watchlistSymbols.map(item => {
          const priceData = currentPrices.find(stock => stock.symbol === item.symbol);
          return {
            ...item,
            ...priceData
          };
        });

        setWatchlist(enrichedWatchlist);
      } else {
        setWatchlist([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError('Failed to load watchlist');
      setLoading(false);
    }
  };

  // Add stock to watchlist
  const handleAddToWatchlist = async () => {
    if (!newSymbol.trim()) {
      alert('Please enter a stock symbol');
      return;
    }

    try {
      await axios.post('http://localhost:5050/api/watchlist/add', {
        user_id: userId,
        symbol: newSymbol.toUpperCase().trim()
      });

      alert(`✅ ${newSymbol.toUpperCase()} added to watchlist`);
      setAddModal(false);
      setNewSymbol('');
      fetchWatchlist(); // Refresh
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      alert('Failed to add stock: ' + (err.response?.data?.error || err.message));
    }
  };

  // Remove from watchlist
  const handleRemove = async (symbol) => {
    if (!confirm(`Remove ${symbol} from watchlist?`)) return;

    try {
      await axios.delete(`http://localhost:5050/api/watchlist/remove`, {
        data: { user_id: userId, symbol }
      });

      alert(`✅ ${symbol} removed from watchlist`);
      fetchWatchlist(); // Refresh
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      alert('Failed to remove stock');
    }
  };

  if (loading) {
    return <div className="watchlist-container"><div className="loading">Loading watchlist...</div></div>;
  }

  if (error) {
    return <div className="watchlist-container"><div className="error">{error}</div></div>;
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h1>⭐ My Watchlist</h1>
        <button className="add-btn" onClick={() => setAddModal(true)}>
          + Add Stock
        </button>
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-watchlist">
          <p>📭 Your watchlist is empty. Add stocks to track!</p>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlist.map((stock) => (
            <div key={stock.id} className="watchlist-card">
              <div className="card-header">
                <h3>{stock.symbol}</h3>
                <button 
                  className="remove-btn" 
                  onClick={() => handleRemove(stock.symbol)}
                >
                  ✕
                </button>
              </div>
              
              <div className="card-body">
                <div className="price-section">
                  <p className="current-price">₹{stock.price?.toFixed(2) || 'N/A'}</p>
                  <p className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2) || '0.00'} 
                    ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%)
                  </p>
                </div>
                
                <div className="stock-info">
                  <div className="info-row">
                    <span>Open:</span>
                    <span>₹{stock.open?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span>High:</span>
                    <span>₹{stock.high?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span>Low:</span>
                    <span>₹{stock.low?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Stock Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Stock to Watchlist</h2>
            
            <div className="form-group">
              <label>Stock Symbol:</label>
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="e.g., TCS, INFY, RELIANCE"
                style={{ textTransform: 'uppercase' }}
              />
              <small>Enter NSE stock symbol (Indian stocks)</small>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setAddModal(false)}>
                Cancel
              </button>
              <button className="btn-add" onClick={handleAddToWatchlist}>
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
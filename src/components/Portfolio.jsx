import { useState, useEffect } from 'react';
import axios from 'axios';
import './Portfolio.css';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sellModal, setSellModal] = useState({ show: false, stock: null });
  const [sellQuantity, setSellQuantity] = useState('');
  const [error, setError] = useState('');

  // Get user_id from localStorage (set during login)
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (userId) {
      fetchPortfolioData();
    } else {
      setError('Please login to view portfolio');
      setLoading(false);
    }
  }, [userId]);

  // Fetch portfolio and wallet balance
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Fetch portfolio stocks
      const portfolioRes = await axios.get(`http://localhost:5050/api/portfolio/${userId}`);
      const portfolioStocks = portfolioRes.data.portfolio;

      // Fetch current prices for all stocks
      const symbols = portfolioStocks.map(stock => stock.symbol).join(',');
      if (symbols) {
        const pricesRes = await axios.get(`http://localhost:5050/api/stocks/live?symbols=${symbols}`);
        const currentPrices = pricesRes.data;

        // Merge current prices with portfolio data
        const enrichedPortfolio = portfolioStocks.map(stock => {
          const currentStock = currentPrices.find(s => s.symbol === stock.symbol);
          const currentPrice = currentStock ? currentStock.price : stock.avg_price;
          const totalInvested = stock.avg_price * stock.quantity;
          const currentValue = currentPrice * stock.quantity;
          const profitLoss = currentValue - totalInvested;
          const profitLossPercent = ((profitLoss / totalInvested) * 100).toFixed(2);

          return {
            ...stock,
            currentPrice,
            totalInvested,
            currentValue,
            profitLoss,
            profitLossPercent
          };
        });

        setPortfolio(enrichedPortfolio);
      }

      // Fetch wallet balance
      setWalletBalance(portfolioRes.data.wallet_balance);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio data');
      setLoading(false);
    }
  };

  // Open sell modal
  const openSellModal = (stock) => {
    setSellModal({ show: true, stock });
    setSellQuantity('');
  };

  // Handle sell stock
  const handleSell = async () => {
    if (!sellQuantity || sellQuantity <= 0) {
      alert('Please enter valid quantity');
      return;
    }

    if (sellQuantity > sellModal.stock.quantity) {
      alert('Cannot sell more than you own');
      return;
    }

    try {
      const sellData = {
        user_id: userId,
        symbol: sellModal.stock.symbol,
        quantity: parseInt(sellQuantity),
        price: sellModal.stock.currentPrice
      };

      await axios.post('http://localhost:5050/api/portfolio/sell', sellData);
      
      alert(`✅ Sold ${sellQuantity} shares of ${sellModal.stock.symbol}`);
      setSellModal({ show: false, stock: null });
      fetchPortfolioData(); // Refresh data
    } catch (err) {
      console.error('Error selling stock:', err);
      alert('Failed to sell stock: ' + (err.response?.data?.error || err.message));
    }
  };

  // Calculate total portfolio value
  const totalPortfolioValue = portfolio.reduce((sum, stock) => sum + stock.currentValue, 0);
  const totalInvested = portfolio.reduce((sum, stock) => sum + stock.totalInvested, 0);
  const totalProfitLoss = totalPortfolioValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : 0;

  if (loading) {
    return <div className="portfolio-container"><div className="loading">Loading portfolio...</div></div>;
  }

  if (error) {
    return <div className="portfolio-container"><div className="error">{error}</div></div>;
  }

  return (
    <div className="portfolio-container">
      <h1>📊 My Portfolio</h1>

      {/* Wallet & Summary Section */}
      <div className="portfolio-summary">
        <div className="summary-card wallet">
          <h3>💰 Wallet Balance</h3>
          <p className="amount">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className="summary-card invested">
          <h3>📈 Total Invested</h3>
          <p className="amount">₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className="summary-card current">
          <h3>💼 Current Value</h3>
          <p className="amount">₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className={`summary-card profit-loss ${totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
          <h3>📊 Total P&L</h3>
          <p className="amount">
            {totalProfitLoss >= 0 ? '+' : ''}₹{totalProfitLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="percent">({totalProfitLossPercent}%)</p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="holdings-section">
        <h2>🏦 Your Holdings</h2>
        {portfolio.length === 0 ? (
          <div className="empty-portfolio">
            <p>📭 No stocks in portfolio yet. Start investing!</p>
          </div>
        ) : (
          <div className="holdings-table-wrapper">
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Quantity</th>
                  <th>Avg Price</th>
                  <th>Current Price</th>
                  <th>Invested</th>
                  <th>Current Value</th>
                  <th>P&L</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((stock) => (
                  <tr key={stock.id}>
                    <td className="symbol">{stock.symbol}</td>
                    <td>{stock.quantity}</td>
                    <td>₹{stock.avg_price.toFixed(2)}</td>
                    <td>₹{stock.currentPrice.toFixed(2)}</td>
                    <td>₹{stock.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>₹{stock.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className={stock.profitLoss >= 0 ? 'profit' : 'loss'}>
                      {stock.profitLoss >= 0 ? '+' : ''}₹{stock.profitLoss.toFixed(2)}
                      <br />
                      <span className="percent">({stock.profitLossPercent}%)</span>
                    </td>
                    <td>
                      <button 
                        className="sell-btn" 
                        onClick={() => openSellModal(stock)}
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sell Modal */}
      {sellModal.show && (
        <div className="modal-overlay" onClick={() => setSellModal({ show: false, stock: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sell {sellModal.stock.symbol}</h2>
            <div className="modal-info">
              <p>Available Quantity: <strong>{sellModal.stock.quantity}</strong></p>
              <p>Current Price: <strong>₹{sellModal.stock.currentPrice.toFixed(2)}</strong></p>
            </div>
            
            <div className="form-group">
              <label>Quantity to Sell:</label>
              <input
                type="number"
                min="1"
                max={sellModal.stock.quantity}
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            {sellQuantity > 0 && (
              <div className="sell-summary">
                <p>You will receive: <strong>₹{(sellQuantity * sellModal.stock.currentPrice).toFixed(2)}</strong></p>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSellModal({ show: false, stock: null })}>
                Cancel
              </button>
              <button className="btn-sell" onClick={handleSell}>
                Confirm Sell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
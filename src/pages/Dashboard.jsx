import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Sparkles, 
  ChevronRight, 
  ArrowUpRight,
  ArrowDownLeft 
} from 'lucide-react';

export default function Dashboard({ user, setCurrentRoute }) {
  const [accountData, setAccountData] = useState({
    balance: 845220.50,
    savings: 545220.50,
    checking: 215000.00,
    fixed: 300000.00,
    recurring: 85000.00,
    monthSpent: 46780.50,
    monthReceived: 125000.00
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchAccountData();
    fetchTransactions();
  }, []);

  const fetchAccountData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAccountData(data);
      }
    } catch (e) {
      console.warn('Could not fetch account data, using fallbacks');
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions.slice(0, 5));
      } else {
        fallbackMockTransactions();
      }
    } catch (e) {
      fallbackMockTransactions();
    }
  };

  const fallbackMockTransactions = () => {
    setTransactions([
      { id: 1, type: 'debit', amount: 1250.00, description: 'Amazon Shopping payment', createdAt: new Date() },
      { id: 2, type: 'credit', amount: 105000.00, description: 'Salary Credit from SmartBank', createdAt: new Date() },
      { id: 3, type: 'debit', amount: 650.00, description: 'Netflix Premium subscription', createdAt: new Date() },
      { id: 4, type: 'debit', amount: 3200.00, description: 'Electricity Bill Payment', createdAt: new Date() },
      { id: 5, type: 'transfer', amount: 15000.00, description: 'Transfer to Rahul Sharma', createdAt: new Date() }
    ]);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 3 Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        {/* Metric 1: Available Balance */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Net Worth</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>
              {formatCurrency(accountData.balance)}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.85rem' }}>
              <TrendingUp size={14} />
              <span>+12.4% vs last month</span>
            </div>
          </div>
          <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={24} />
          </div>
        </div>

        {/* Metric 2: Total Income */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Income (This Month)</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>
              {formatCurrency(accountData.monthReceived)}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.85rem' }}>
              <TrendingUp size={14} />
              <span>+8.2% vs last month</span>
            </div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={24} />
          </div>
        </div>

        {/* Metric 3: Total Spent */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spending (This Month)</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>
              {formatCurrency(accountData.monthSpent)}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontSize: '0.85rem' }}>
              <TrendingDown size={14} />
              <span>-15.6% vs last month</span>
            </div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownLeft size={24} />
          </div>
        </div>

      </div>

      {/* Main Charts & Activity Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Spending Overview & Monthly Trend */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Analytics & Trends</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated live</span>
          </div>

          {/* Inline SVG Charts - Trend Chart */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Monthly Transaction Activity</p>
            <svg viewBox="0 0 400 150" style={{ width: '100%', height: '140px' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* Fill path */}
              <path d="M 0 130 Q 80 80 160 110 T 320 50 L 400 30 L 400 150 L 0 150 Z" fill="url(#chartGrad)" />
              {/* Stroke line */}
              <path d="M 0 130 Q 80 80 160 110 T 320 50 L 400 30" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
              
              {/* Graph points */}
              <circle cx="160" cy="110" r="4" fill="var(--accent)" />
              <circle cx="320" cy="50" r="4" fill="var(--accent)" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>

          {/* Inline Donut Chart and legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="120" height="120" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                
                {/* 40% checking, 60% savings */}
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="var(--primary)" strokeWidth="4.2" strokeDasharray="60 40" strokeDashoffset="25" />
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="var(--secondary)" strokeWidth="4.2" strokeDasharray="40 60" strokeDashoffset="85" />
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>Asset Distribution</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />
                  <span style={{ flexGrow: 1 }}>Savings Account</span>
                  <span style={{ fontWeight: 600 }}>64%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%' }} />
                  <span style={{ flexGrow: 1 }}>Checking Account</span>
                  <span style={{ fontWeight: 600 }}>25%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                  <span style={{ flexGrow: 1 }}>Deposits & Goals</span>
                  <span style={{ fontWeight: 600 }}>11%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions & AI Insight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Recent Transactions Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>No transactions recorded</p>
              ) : (
                transactions.map((t) => (
                  <div 
                    key={t.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 12px', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)' 
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 700, 
                        color: t.type === 'credit' ? 'var(--success)' : '#fff' 
                      }}
                    >
                      {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setCurrentRoute('transactions')} 
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, margin: '16px auto 0 auto' }}
            >
              <span>View All Transactions</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* AI Copilot Prompt Panel */}
          <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, #e6f4ee 0%, #ffffff 100%)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)', marginBottom: '12px' }}>
              <Sparkles size={20} />
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Financial Insights</h4>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#d1d5db', marginBottom: '16px' }}>
              "You spent 15.6% less on entertainment and shopping this month than your historical average. Great job! We recommend allocating the saved ₹15,000 into your active **Fixed Deposit** target to earn 7.2% interest."
            </p>
            <button onClick={() => setCurrentRoute('ai-assistant')} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem' }}>
              <span>Chat with Copilot</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

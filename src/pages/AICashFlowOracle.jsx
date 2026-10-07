import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw,
  Zap
} from 'lucide-react';

export default function AICashFlowOracle({ user }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('30d');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/cashflow-forecast', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error('Forecast fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredForecast = () => {
    if (!data?.forecast) return [];
    const limit = activeTab === '30d' ? 30 : activeTab === '60d' ? 60 : 90;
    return data.forecast.slice(0, limit);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin-animation" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 16px auto', color: 'var(--primary)' }} />
        <h3 style={{ color: 'var(--text-primary)' }}>Predictive AI Engine is synthesizing 90-day cash flow vectors...</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Analyzing historical velocity, income cycles, recurring subscriptions, and bill spikes.</p>
      </div>
    );
  }

  const filteredForecast = getFilteredForecast();
  const maxVal = Math.max(...filteredForecast.map(f => f.predictedBalance), 1000);
  const minVal = Math.min(...filteredForecast.map(f => f.predictedBalance), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, #e6f4ee 0%, #ffffff 100%)', border: '1px solid rgba(45, 138, 104, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: 'var(--primary)', color: '#ffffff', padding: '8px', borderRadius: '10px' }}>
                <Sparkles size={22} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI CashFlow Oracle & Balance Forecaster</h2>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Industry First</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '700px' }}>
              Our proprietary Monte Carlo AI engine models your projected account balance 90 days into the future to eliminate surprise overdrafts and automate high-yield savings.
            </p>
          </div>
          <button onClick={fetchForecast} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> Re-Simulate
          </button>
        </div>
      </div>

      {/* Overdraft Warning Banner */}
      {data?.overdraftWarning && (
        <div className="glass-panel" style={{ padding: '20px 24px', background: '#fff1f1', border: '1px solid rgba(255, 90, 96, 0.4)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#ffe0e0', color: '#ff5a60', padding: '10px', borderRadius: '10px' }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <h4 style={{ color: '#d9383e', fontWeight: 700, fontSize: '0.95rem' }}>AI Overdraft Warning Detected</h4>
            <p style={{ fontSize: '0.82rem', color: '#8c2427', marginTop: '2px' }}>
              {data.overdraftWarning.recommendation}
            </p>
          </div>
          <button className="btn-coral">
            Auto-Resolve Now
          </button>
        </div>
      )}

      {/* Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Avg Daily Income Vector</p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0' }}>
            +{formatCurrency(data?.avgDailyIncome || 0)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on 90-day salary cycles</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Avg Daily Expense Burn</p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--coral-accent)', margin: '8px 0' }}>
            -{formatCurrency(data?.avgDailyExpense || 0)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Includes bill spikes & subscriptions</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#e6f4ee' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>AI Safe Daily Micro-Save</p>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0' }}>
            {formatCurrency(data?.safeDailyMicroSave || 15)} / day
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <input 
              type="checkbox" 
              id="autosave" 
              checked={autoSaveEnabled} 
              onChange={e => setAutoSaveEnabled(e.target.checked)} 
            />
            <label htmlFor="autosave" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
              Enable AI Auto-Pilot Savings
            </label>
          </div>
        </div>
      </div>

      {/* Main Forecast Chart Visualizer */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Projected Net Balance Curve</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Monte Carlo forecast simulation</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: '#f0f5f2', padding: '4px', borderRadius: '10px' }}>
            {['30d', '60d', '90d'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '6px 14px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: activeTab === tab ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? 700 : 500
                }}
              >
                {tab.toUpperCase()} Horizon
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart Representation */}
        <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '20px 0', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
          {filteredForecast.map((point, idx) => {
            const heightPct = Math.min(100, Math.max(10, ((point.predictedBalance - minVal) / (maxVal - minVal || 1)) * 100));
            const isSpike = point.projectedIncome > 0;
            const isBillDay = point.projectedExpense > 4000;

            return (
              <div 
                key={idx} 
                title={`Day ${point.day} (${point.date}): ${formatCurrency(point.predictedBalance)}`}
                style={{ 
                  flexGrow: 1, 
                  height: `${heightPct}%`, 
                  background: isSpike 
                    ? 'linear-gradient(180deg, #2d8a68 0%, rgba(45, 138, 104, 0.3) 100%)' 
                    : isBillDay 
                    ? 'linear-gradient(180deg, #ff5a60 0%, rgba(255, 90, 96, 0.3) 100%)'
                    : 'linear-gradient(180deg, #3ea87e 0%, rgba(62, 168, 126, 0.3) 100%)',
                  borderRadius: '3px',
                  minWidth: '6px',
                  transition: 'height 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span>Today ({filteredForecast[0]?.date})</span>
          <span>Day {filteredForecast.length / 2} ({filteredForecast[Math.floor(filteredForecast.length / 2)]?.date})</span>
          <span>End of Horizon ({filteredForecast[filteredForecast.length - 1]?.date})</span>
        </div>
      </div>

      {/* Key Milestones List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Upcoming Predicted Financial Milestones</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredForecast.filter(f => f.projectedIncome > 0 || f.projectedExpense > 4000).slice(0, 5).map((m, idx) => (
            <div 
              key={idx} 
              style={{ 
                padding: '14px 18px', 
                borderRadius: '12px', 
                background: '#f8faf9', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  background: m.projectedIncome > 0 ? '#e6f4ee' : '#ffebeb',
                  color: m.projectedIncome > 0 ? '#2d8a68' : '#ff5a60',
                  padding: '8px',
                  borderRadius: '10px'
                }}>
                  {m.projectedIncome > 0 ? <TrendingUp size={18} /> : <Zap size={18} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.projectedIncome > 0 ? 'Salary / Income Deposit Event' : 'Major Recurring Bill Spike'}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.date} (Day {m.day})</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: m.projectedIncome > 0 ? '#2d8a68' : '#ff5a60' }}>
                  {m.projectedIncome > 0 ? `+${formatCurrency(m.projectedIncome)}` : `-${formatCurrency(m.projectedExpense)}`}
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Projected Total: {formatCurrency(m.predictedBalance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

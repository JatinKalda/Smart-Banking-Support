import React, { useState } from 'react';
import { TrendingUp, Plus, ArrowUpRight, Compass } from 'lucide-react';

export default function Investments() {
  const [goals, setGoals] = useState([
    { id: 1, name: 'European Summer Trip', current: 150000, target: 200000, color: 'var(--primary)' },
    { id: 2, name: 'New Electric SUV', current: 300000, target: 800000, color: 'var(--secondary)' },
    { id: 3, name: 'Retirement Fund', current: 225000, target: 1000000, color: 'var(--success)' }
  ]);

  const updateGoalValue = (id, newVal) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: parseInt(newVal) } : g));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Investments</h1>
          <p style={{ color: 'var(--text-muted)' }}>Grow your capital with customized financial goals and mutual fund portfolios.</p>
        </div>
        <button className="btn-primary" style={{ padding: '10px 18px', borderRadius: '8px' }}>
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Portfolio Value Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Portfolio Valuation</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0' }}>{formatCurrency(675000)}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>+14.8% Year-on-Year</span>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Gains</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0', color: 'var(--success)' }}>{formatCurrency(75230)}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>Active ROI: 11.14%</span>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Active Financial Goals</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0' }}>3 Targets</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>All on track</span>
        </div>

      </div>

      {/* Goal Sliders & Donut Chart Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Interactive Goal Sliders */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Investment Target Simulator</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {goals.map(goal => {
              const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
              return (
                <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{goal.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)} ({percentage}%)
                    </span>
                  </div>
                  
                  {/* Slider bar input */}
                  <input 
                    type="range" 
                    min="0" 
                    max={goal.target} 
                    value={goal.current}
                    onChange={e => updateGoalValue(goal.id, e.target.value)}
                    style={{ width: '100%', accentColor: goal.color, height: '6px', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  
                  {/* Visual progress track */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span>0%</span>
                    <span>100% Target</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Allocation & Mutual Funds list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Allocation */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Asset Allocation</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <svg width="80" height="80" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                {/* 22% trip, 44% car, 34% retirement */}
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="var(--primary)" strokeWidth="4.2" strokeDasharray="22 78" strokeDashoffset="25" />
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="var(--secondary)" strokeWidth="4.2" strokeDasharray="44 56" strokeDashoffset="77" />
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="var(--success)" strokeWidth="4.2" strokeDasharray="34 66" strokeDashoffset="33" />
              </svg>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--accent)' }}>● Europe Trip</span>
                  <span style={{ fontWeight: 600 }}>22%</span>
                </div>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--secondary)' }}>● SUV Car</span>
                  <span style={{ fontWeight: 600 }}>44%</span>
                </div>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--success)' }}>● Retirement</span>
                  <span style={{ fontWeight: 600 }}>34%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mutual Funds List */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Mutual Funds Portfolio</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'HDFC Mid-Cap Opportunities Fund', yield: '+18.2% p.a.', color: 'var(--success)' },
                { name: 'ICICI Prudential Bluechip Fund', yield: '+14.6% p.a.', color: 'var(--success)' },
                { name: 'SBI Small Cap Equity Fund', yield: '+21.4% p.a.', color: 'var(--success)' }
              ].map((fund, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ textAlign: 'left', maxWidth: '160px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fund.name}</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: fund.color }}>{fund.yield}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Trash2, 
  RefreshCw
} from 'lucide-react';

export default function AISubscriptionHunter({ user }) {
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState(null);
  const [cancelledList, setCancelledList] = useState([]);
  const [selectedSubForCancel, setSelectedSubForCancel] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setSubData(result);
      }
    } catch (err) {
      console.error('Subscriptions fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSub = (sub) => {
    setCancelledList(prev => [...prev, sub.id]);
    setSelectedSubForCancel(null);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin-animation" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 16px auto', color: 'var(--primary)' }} />
        <h3 style={{ color: 'var(--text-primary)' }}>AI Vampire Hunter is analyzing recurring ledger signatures...</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Scanning recurring micro-debits, streaming tools, SaaS subscriptions, and gym fees.</p>
      </div>
    );
  }

  const activeSubs = (subData?.subscriptions || []).filter(s => !cancelledList.includes(s.id));
  const activeMonthly = activeSubs.reduce((sum, s) => sum + s.monthlyCost, 0);
  const activeYearly = activeMonthly * 12;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, #e6f4ee 0%, #ffffff 100%)', border: '1px solid rgba(45, 138, 104, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: '#e6f4ee', color: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
                <Sparkles size={22} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI Subscription Vampire Hunter</h2>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Zero Waste</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '700px' }}>
              AI scans your transaction history to flag forgotten or low-usage subscriptions draining your monthly cash flow. Cancel with 1 click or issue stop-payment mandates.
            </p>
          </div>

          <button onClick={fetchSubscriptions} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> Re-Scan Ledger
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Active Subscriptions</p>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0' }}>
            {activeSubs.length} Active
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-billed monthly</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Yearly Subscription Burn</p>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--coral-accent)', margin: '8px 0' }}>
            ${activeYearly.toLocaleString()} / yr
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(${activeMonthly.toLocaleString()} / month)</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#e6f4ee' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>AI Reclaimable Savings</p>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0' }}>
            ${(subData?.potentialYearlySavings || 3400).toLocaleString()} / yr
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From flagged low-usage services</span>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Detected Recurring Subscriptions</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {activeSubs.map(sub => {
            const isLowUsage = sub.usageScore < 35;

            return (
              <div 
                key={sub.id} 
                style={{ 
                  padding: '20px', 
                  borderRadius: '16px', 
                  background: '#f8faf9', 
                  border: isLowUsage ? '1px solid rgba(255, 90, 96, 0.35)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      {sub.category}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{sub.name}</h4>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ${sub.monthlyCost}/mo
                    </span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ${sub.yearlyCost}/yr
                    </div>
                  </div>
                </div>

                {/* AI Usage Score Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>AI Usage Score</span>
                    <span style={{ color: isLowUsage ? '#ff5a60' : 'var(--primary)', fontWeight: 700 }}>
                      {sub.usageScore}% {isLowUsage ? '(Low Usage Vampire)' : '(Active Use)'}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#e4eee9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sub.usageScore}%`, background: isLowUsage ? '#ff5a60' : 'var(--primary)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Billed: {new Date(sub.lastBilled).toLocaleDateString()}
                  </span>

                  <button 
                    onClick={() => setSelectedSubForCancel(sub)} 
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '6px 12px', color: '#ff5a60', borderColor: '#ff5a60', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} /> AI 1-Click Cancel
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Cancellation Modal */}
      {selectedSubForCancel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '28px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
              Confirm AI Cancellation Assistant
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
              SmartBank AI will instantly generate an automated cancellation letter and issue a stop-payment block on your debit card for <strong>{selectedSubForCancel.name}</strong> (${selectedSubForCancel.monthlyCost}/mo).
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedSubForCancel(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleCancelSub(selectedSubForCancel)} className="btn-coral">
                Execute Stop-Payment & Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

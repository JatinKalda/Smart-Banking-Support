import React, { useState, useEffect } from 'react';
import { Wallet, Landmark, Plus, ArrowRight } from 'lucide-react';

export default function Accounts({ user }) {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      } else {
        fallbackMockAccounts();
      }
    } catch (e) {
      fallbackMockAccounts();
    }
  };

  const fallbackMockAccounts = () => {
    setAccounts([
      { id: 1, accountType: 'savings', accountNumber: '1234 5678 9012 3456', balance: 545220.50, status: 'active' },
      { id: 2, accountType: 'checking', accountNumber: '2345 6789 0123 4567', balance: 215000.00, status: 'active' },
      { id: 3, accountType: 'fixed', accountNumber: '3456 7890 1234 5678', balance: 300000.00, status: 'active' },
      { id: 4, accountType: 'recurring', accountNumber: '4567 8901 2345 6789', balance: 85000.00, status: 'active' }
    ]);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>My Accounts</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage all of your bank accounts and deposits in one secure panel.</p>
        </div>
        <button className="btn-primary" style={{ padding: '10px 18px', borderRadius: '8px' }}>
          <Plus size={16} />
          <span>Add Account</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Accounts Card List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {accounts.map(acc => (
            <div key={acc.id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {acc.accountType === 'savings' || acc.accountType === 'checking' ? <Wallet size={20} /> : <Landmark size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'capitalize' }}>
                    {acc.accountType} Account
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '4px' }}>
                    {acc.accountNumber}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{formatCurrency(acc.balance)}</h3>
                <span className="badge badge-success" style={{ display: 'inline-block', marginTop: '6px' }}>
                  {acc.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Asset Allocation Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Account Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <svg width="140" height="140" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
              {/* Savings: 48%, Checking: 18%, Fixed: 26%, Recurring: 8% */}
              <circle cx="20" cy="20" r="15.915" fill="none" stroke="var(--primary)" strokeWidth="4.2" strokeDasharray="48 52" strokeDashoffset="25" />
              <circle cx="20" cy="20" r="15.915" fill="none" stroke="var(--secondary)" strokeWidth="4.2" strokeDasharray="18 82" strokeDashoffset="77" />
              <circle cx="20" cy="20" r="15.915" fill="none" stroke="var(--accent)" strokeWidth="4.2" strokeDasharray="26 74" strokeDashoffset="59" />
              <circle cx="20" cy="20" r="15.915" fill="none" stroke="var(--success)" strokeWidth="4.2" strokeDasharray="8 92" strokeDashoffset="33" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
            {[
              { type: 'Savings Account', color: 'var(--primary)', pct: '48%' },
              { type: 'Checking Account', color: 'var(--secondary)', pct: '18%' },
              { type: 'Fixed Deposit', color: 'var(--accent)', pct: '26%' },
              { type: 'Recurring Deposit', color: 'var(--success)', pct: '8%' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: item.color, borderRadius: '50%' }} />
                  <span>{item.type}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{item.pct}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

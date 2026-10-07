import React from 'react';
import { Shield, Sparkles, Zap, ChevronRight, ArrowLeftRight } from 'lucide-react';

export default function Home({ setCurrentRoute }) {
  return (
    <div style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Landing Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/images/hsbc.png" alt="SmartBank" style={{ width: '36px', height: '36px' }} />
          <span style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.05em', color: 'var(--primary)' }}>SMARTBANK</span>
        </div>
        
        <div style={{ display: 'flex', gap: '32px' }}>
          <a onClick={() => setCurrentRoute('features')} style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer', fontWeight: 600 }}>Features</a>
          <a onClick={() => setCurrentRoute('about')} style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer', fontWeight: 600 }}>About Us</a>
          <a onClick={() => setCurrentRoute('contact')} style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer', fontWeight: 600 }}>Contact</a>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => setCurrentRoute('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Login</button>
          <button onClick={() => setCurrentRoute('register')} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '10px' }}>Open Account</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '80px' }}>
        <div>
          <div style={{ background: '#e6f4ee', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(45, 138, 104, 0.2)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px' }}>
            <Sparkles size={14} />
            <span>Next-Gen AI Banking Engine</span>
          </div>
          
          <h1 style={{ fontSize: '3.75rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', color: 'var(--text-primary)' }}>
            Bank Smarter.<br />
            <span className="title-gradient">Live Better.</span>
          </h1>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '40px' }}>
            Experience secure, intuitive, AI-powered banking that understands your needs, tracks your financials, manages investments, and optimizes your financial freedom.
          </p>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => setCurrentRoute('register')} className="btn-primary">
              <span>Open Your Account</span>
              <ChevronRight size={18} />
            </button>
            <button onClick={() => setCurrentRoute('login')} className="btn-secondary">
              <span>Try Live Demo</span>
            </button>
          </div>
        </div>

        {/* Visual Device Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '320px', height: '580px', borderRadius: '40px', padding: '24px', border: '3px solid rgba(45,138,104,0.2)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px', background: '#ffffff' }}>
            {/* Phone notch */}
            <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '20px', background: '#e6f4ee', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SmartBank App</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>● Secure</span>
            </div>

            <div style={{ marginTop: '10px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Available Balance</p>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 8px 0', color: 'var(--text-primary)' }}>₹8,45,220.50</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-success">+12.4% this month</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {['Send', 'Receive', 'Cards'].map((action, i) => (
                <div key={i} style={{ background: '#f4f8f6', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 8px', textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ background: '#e6f4ee', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', color: 'var(--primary)' }}>
                    {i === 0 ? <Zap size={14} /> : i === 1 ? <ArrowLeftRight size={14} /> : <Shield size={14} />}
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{action}</span>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Recent activity</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Amazon Online shopping', desc: 'Debit Card payment', amt: '-₹1,250.00', plus: false },
                  { name: 'Salary deposit', desc: 'SmartBank employer', amt: '+₹1,05,000.00', plus: true },
                  { name: 'Netflix Premium subscription', desc: 'Recurring payment', amt: '-₹650.00', plus: false }
                ].map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8faf9', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{t.name}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.desc}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: t.plus ? 'var(--primary)' : 'var(--text-primary)' }}>{t.amt}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

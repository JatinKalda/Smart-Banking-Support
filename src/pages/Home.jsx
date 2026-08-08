import React from 'react';
import { Shield, Sparkles, Zap, LineChart, ChevronRight, ArrowLeftRight } from 'lucide-react';

export default function Home({ setCurrentRoute }) {
  return (
    <div style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Landing Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/images/hsbc.png" alt="SmartBank" style={{ width: '36px', height: '36px' }} />
          <span style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.05em' }}>SMARTBANK</span>
        </div>
        
        <div style={{ display: 'flex', gap: '32px' }}>
          <a onClick={() => setCurrentRoute('features')} style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }}>Features</a>
          <a onClick={() => setCurrentRoute('about')} style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }}>About Us</a>
          <a onClick={() => setCurrentRoute('contact')} style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }}>Contact</a>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => setCurrentRoute('login')} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Login</button>
          <button onClick={() => setCurrentRoute('register')} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>Open Account</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '80px' }}>
        <div>
          <div style={{ background: 'rgba(124, 58, 237, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '9999px', border: '1px solid var(--border-glow)', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px' }}>
            <Sparkles size={14} />
            <span>Next-Gen AI Banking Engine</span>
          </div>
          
          <h1 style={{ fontSize: '3.75rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
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

        {/* Visual Device Mockup using HTML/CSS */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '320px', height: '580px', borderRadius: '40px', padding: '24px', border: '3px solid rgba(255,255,255,0.15)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Phone notch */}
            <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '20px', background: '#080915', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SmartBank App</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>● Secure</span>
            </div>

            <div style={{ marginTop: '10px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Available Balance</p>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 8px 0' }}>₹8,45,220.50</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-success">+12.4% this month</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {['Send', 'Receive', 'Cards'].map((action, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 8px', textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ background: 'var(--primary-glow)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', color: 'var(--accent)' }}>
                    {i === 0 ? <Zap size={14} /> : i === 1 ? <ArrowLeftRight size={14} /> : <Shield size={14} />}
                  </div>
                  <span style={{ fontWeight: 600 }}>{action}</span>
                </div>
              ))}
            </div>

            {/* Recent Transactions Mockup list */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Recent activity</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Amazon Online shopping', desc: 'Debit Card payment', amt: '-₹1,250.00', plus: false },
                  { name: 'Salary deposit', desc: 'SmartBank employer', amt: '+₹1,05,000.00', plus: true },
                  { name: 'Netflix Premium subscription', desc: 'Recurring payment', amt: '-₹650.00', plus: false }
                ].map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.desc}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: t.plus ? 'var(--success)' : '#fff' }}>{t.amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Landing Features Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[
          { title: 'AI Financial Copilot', desc: 'Analyses your spending, calculates risk, and provides automated advisory.', icon: Sparkles },
          { title: 'Secure & Private', desc: '256-bit encryption, cookie session management, and multi-factor safety.', icon: Shield },
          { title: 'Instant Transfers', desc: 'Transfer money between multiple checkings and savings instantly.', icon: Zap },
          { title: 'Smart Analysis', desc: 'Interactive visual analytics showing monthly metrics & investment goals.', icon: LineChart }
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

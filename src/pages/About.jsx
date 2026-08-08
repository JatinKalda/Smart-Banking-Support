import React from 'react';
import { Award, Target, Landmark, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '50px' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>About SmartBank</h1>
        <p className="title-gradient" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Reimagining the future of banking with technology and trust.</p>
      </div>

      {/* Main Corporate Card Mockup */}
      <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', padding: '40px', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '16px' }}>Our Mission</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            At SmartBank, we combine the power of advanced intelligence with seamless user experiences to deliver a personalized, secure, and intuitive financial ecosystem. 
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Our mission is to empower individuals and businesses to take full control of their capital, secure their assets, and grow their wealth with state-of-the-art tools.
          </p>
        </div>
        
        {/* Simple inline visual representation of a corporate headquarter/bank vault */}
        <div style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)', height: '220px', borderRadius: '16px', border: '1px solid var(--border-glow)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', gap: '12px' }}>
          <Landmark size={48} style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>SmartBank Hub</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Established 2026</span>
        </div>
      </div>

      {/* Corporate Metrics stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {[
          { label: 'Happy Customers', value: '15M+' },
          { label: 'Transactions Processed', value: '₹2,508B+' },
          { label: 'Uptime Reliability', value: '99.98%' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <h2 className="title-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '6px' }}>{stat.value}</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Core Values grid */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Our Core Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {[
            { title: 'Customer First', desc: 'Every feature we design is built specifically to improve the customer\'s balance sheet, safety, and convenience.', icon: Target },
            { title: 'Security Above All', desc: 'We employ bank-grade encryption, secure cookies session storage, and active audit logs to keep your assets bulletproof.', icon: ShieldCheck },
            { title: 'Continuous Innovation', desc: 'Integrating modern machine learning models like Gemini 1.5 Flash to automatically categorise transaction trends and goals.', icon: Award },
            { title: 'Empowering Access', desc: 'No complex banking jargon. Manage investments, checking accounts, and multi-currency transfers with clean, simple sliders.', icon: Landmark }
          ].map((val, i) => {
            const Icon = val.icon;
            return (
              <div key={i} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
                <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{val.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{val.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

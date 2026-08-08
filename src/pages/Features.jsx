import React from 'react';
import { 
  BrainCircuit, 
  TrendingDown, 
  Fingerprint, 
  Compass, 
  Mic, 
  CircleDollarSign 
} from 'lucide-react';

export default function Features() {
  const featuresList = [
    { title: 'AI Financial Copilot', desc: 'Analyses your spending logs, flags anomalies, and creates a tailored balance strategy.', icon: BrainCircuit },
    { title: 'Predictive Expense', desc: 'Forecasts upcoming utility and subscription bills so you can budget accurately.', icon: TrendingDown },
    { title: 'Financial DNA', desc: 'A customized profile matching your investment habits, risk profiles, and saving limits.', icon: Fingerprint },
    { title: 'Smart Goals', desc: 'Set custom targets (e.g. buying a car, retirement plans) and track progress visually with sliders.', icon: Compass },
    { title: 'Voice Banking', desc: 'Perform balance checks and simple transfers hands-free using encrypted voice commands.', icon: Mic },
    { title: 'Auto Save', desc: 'Automatically round up loose change from daily checking transactions and deposit to savings.', icon: CircleDollarSign }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>Features That Set Us Apart</h1>
        <p className="title-gradient" style={{ fontSize: '1.25rem', fontWeight: 600 }}>SmartBank brings you the most advanced banking features with unique security.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {featuresList.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '32px 24px', position: 'relative' }}>
              {/* Highlight bar */}
              <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '4px', background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)'}, transparent)`, borderRadius: '16px 16px 0 0' }} />
              
              <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Icon size={22} />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>{feat.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

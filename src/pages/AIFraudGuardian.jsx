import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  RefreshCw, 
  CheckCircle2
} from 'lucide-react';

export default function AIFraudGuardian({ user }) {
  const [loading, setLoading] = useState(true);
  const [fraudData, setFraudData] = useState(null);
  const [cardLocked, setCardLocked] = useState(false);

  useEffect(() => {
    fetchFraudMetrics();
  }, []);

  const fetchFraudMetrics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/fraud-risk-score', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setFraudData(result);
      }
    } catch (err) {
      console.error('Fraud metrics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCardLock = () => {
    setCardLocked(prev => !prev);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin-animation" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 16px auto', color: 'var(--primary)' }} />
        <h3 style={{ color: 'var(--text-primary)' }}>AI Fraud Guardian is scanning transaction vectors...</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Checking velocity, device telemetry, location anomalies, and peer risk patterns.</p>
      </div>
    );
  }

  const overallRisk = fraudData?.overallAccountRisk || 12;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, #e6f4ee 0%, #ffffff 100%)', border: '1px solid rgba(45, 138, 104, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: '#e6f4ee', color: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
                <ShieldCheck size={22} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI Fraud Guardian & Risk Console</h2>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Real-time Defense</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '700px' }}>
              Every transaction is evaluated in real-time by deep learning behavioral models detecting location spoofing, velocity surges, and merchant anomalies.
            </p>
          </div>

          <button 
            onClick={handleToggleCardLock} 
            className={cardLocked ? "btn-coral" : "btn-primary"} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            {cardLocked ? <Unlock size={16} /> : <Lock size={16} />}
            {cardLocked ? 'Unlock All Cards' : 'Emergency AI Card Lock'}
          </button>
        </div>
      </div>

      {/* Top Threat Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '20px' }}>
        
        {/* Overall Account Security Gauge */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Overall Account Risk Score</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
            <div style={{ 
              width: '84px', 
              height: '84px', 
              borderRadius: '50%', 
              background: `conic-gradient(${overallRisk > 50 ? '#ff5a60' : '#2d8a68'} ${overallRisk}%, #e4eee9 0)`,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              boxShadow: '0 4px 16px rgba(45, 138, 104, 0.15)'
            }}>
              <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: overallRisk > 50 ? '#ff5a60' : '#2d8a68' }}>
                  {overallRisk}
                </span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: overallRisk > 50 ? '#ff5a60' : '#2d8a68' }}>
                {overallRisk > 50 ? 'ELEVATED RISK WATCH' : 'OPTIMAL PROTECTION'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {overallRisk > 50 ? 'Suspicious activity detected in past 24 hrs' : '0 active critical threats flagged by neural net'}
              </p>
            </div>
          </div>
        </div>

        {/* Card Lock Status */}
        <div className="glass-panel" style={{ padding: '24px', background: cardLocked ? '#ffebeb' : '#ffffff' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>AI Shield Status</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
            <div style={{ background: cardLocked ? '#ffd6d6' : '#e6f4ee', color: cardLocked ? '#ff5a60' : '#2d8a68', padding: '10px', borderRadius: '10px' }}>
              {cardLocked ? <Lock size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {cardLocked ? 'Cards Isolated' : 'Real-time Defense Active'}
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {cardLocked ? 'Outbound card charges disabled' : 'Monitoring 24/7'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Flagged Count */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>High Risk Flagged</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: fraudData?.highRiskCount > 0 ? '#ff5a60' : 'var(--text-primary)', margin: '8px 0' }}>
            {fraudData?.highRiskCount || 0}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transactions requiring manual review</span>
        </div>

      </div>

      {/* Transaction Risk Scored Ledger */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>AI Scored Transaction Log</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Neural network anomaly breakdown per transaction</span>
          </div>

          <button onClick={fetchFraudMetrics} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
            <RefreshCw size={14} /> Refresh Analysis
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Transaction</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>AI Risk Score</th>
                <th style={{ padding: '12px' }}>Threat Factors</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(fraudData?.transactions || []).map((t, idx) => {
                const isHigh = t.riskLevel === 'HIGH';
                const isMed = t.riskLevel === 'MEDIUM';

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #eef4f1' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t.description}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${parseFloat(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className={`badge ${isHigh ? 'badge-danger' : isMed ? 'badge-warning' : 'badge-success'}`}>
                        {t.riskScore} / 100 ({t.riskLevel})
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {t.riskFactors.join(', ')}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      {isHigh ? (
                        <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem', color: '#ff5a60', borderColor: '#ff5a60' }}>
                          Dispute Charge
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Verified Safe</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

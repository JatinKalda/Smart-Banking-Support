import React, { useState, useEffect } from 'react';
import { Download, Search, Eye, Printer, X } from 'lucide-react';

export default function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState(null); // Receipt modal state

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filterType, searchQuery]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.transactions) {
        setTransactions(data.transactions);
      } else {
        fallbackMockTransactions();
      }
    } catch (e) {
      fallbackMockTransactions();
    }
  };

  const fallbackMockTransactions = () => {
    const list = [
      { id: 1, type: 'debit', amount: 1250.00, description: 'Amazon Online Shopping Payment', reference: 'TRX-1772652934001', balanceAfter: 543970.50, createdAt: '2026-07-10T14:39:32.000Z' },
      { id: 2, type: 'credit', amount: 105000.00, description: 'Salary Credit from Employer', reference: 'TRX-1772652934002', balanceAfter: 545220.50, createdAt: '2026-07-01T09:00:00.000Z' },
      { id: 3, type: 'debit', amount: 650.00, description: 'Netflix Premium monthly charge', reference: 'TRX-1772652934003', balanceAfter: 440220.50, createdAt: '2026-06-28T18:30:00.000Z' },
      { id: 4, type: 'debit', amount: 3200.00, description: 'Electricity Utility payment', reference: 'TRX-1772652934004', balanceAfter: 440870.50, createdAt: '2026-06-25T11:15:00.000Z' },
      { id: 5, type: 'transfer', amount: 15000.00, description: 'Transfer to Rahul Sharma', reference: 'TRX-1772652934005', balanceAfter: 444070.50, createdAt: '2026-06-20T14:45:00.000Z' },
      { id: 6, type: 'credit', amount: 5000.00, description: 'Cash Deposit at SmartBank ATM', reference: 'TRX-1772652934006', balanceAfter: 459070.50, createdAt: '2026-06-15T10:00:00.000Z' }
    ];
    setTransactions(list);
  };

  const applyFilters = () => {
    let result = [...transactions];

    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(q) || 
        t.reference.toLowerCase().includes(q)
      );
    }

    setFilteredTransactions(result);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and search all transaction logs, filter by account type, and export statements.</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Download size={16} />
          <span>Download Statement</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            style={{ paddingLeft: '44px', paddingY: '10px' }} 
            placeholder="Search description or reference..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'credit', 'debit', 'transfer'].map(type => (
            <button 
              key={type} 
              onClick={() => setFilterType(type)}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                background: filterType === type ? 'var(--primary-glow)' : 'transparent', 
                color: '#fff', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                textTransform: 'capitalize' 
              }}
            >
              {type}
            </button>
          ))}
        </div>

      </div>

      {/* Transactions Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '18px 24px' }}>Date</th>
              <th style={{ padding: '18px 24px' }}>Reference</th>
              <th style={{ padding: '18px 24px' }}>Description</th>
              <th style={{ padding: '18px 24px' }}>Type</th>
              <th style={{ padding: '18px 24px' }}>Amount</th>
              <th style={{ padding: '18px 24px', textAlign: 'center' }}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching transaction records found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '18px 24px' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '18px 24px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {t.reference}
                  </td>
                  <td style={{ padding: '18px 24px', fontWeight: 500 }}>
                    {t.description}
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span className={`badge ${t.type === 'credit' ? 'badge-success' : t.type === 'debit' ? 'badge-danger' : 'badge-warning'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px', fontWeight: 700, color: t.type === 'credit' ? 'var(--success)' : '#fff' }}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                    <button 
                      onClick={() => setSelectedTx(t)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal Overlay */}
      {selectedTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-panel" style={{ width: '420px', padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button 
              onClick={() => setSelectedTx(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <img src="/images/hsbc.png" alt="SmartBank" style={{ width: '32px', height: '32px', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>SmartBank Receipt</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Transaction ID: {selectedTx.reference}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className="badge badge-success">Completed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time</span>
                <span>{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Description</span>
                <span style={{ fontWeight: 600 }}>{selectedTx.description}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Type</span>
                <span style={{ textTransform: 'capitalize' }}>{selectedTx.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Amount Transferred</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: selectedTx.type === 'credit' ? 'var(--success)' : '#fff' }}>
                  {selectedTx.type === 'credit' ? '+' : '-'}{formatCurrency(selectedTx.amount)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button onClick={() => setSelectedTx(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Close
              </button>
              <button onClick={handlePrint} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

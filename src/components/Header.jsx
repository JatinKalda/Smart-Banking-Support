import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash, Mic, Sparkles } from 'lucide-react';
import AIVoiceCopilotModal from './AIVoiceCopilotModal';

export default function Header({ user, title }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        fallbackMockNotifications();
      }
    } catch (e) {
      fallbackMockNotifications();
    }
  };

  const fallbackMockNotifications = () => {
    setNotifications([
      { id: 1, title: 'Welcome to SmartBank AI', message: 'Your AI Copilot and 90-day balance forecaster are live.', isRead: false },
      { id: 2, title: 'AI Fraud Guardian Active', message: 'Real-time neural risk scoring enabled on all accounts.', isRead: true },
      { id: 3, title: 'Login Alert', message: 'Successful login recorded from IP 127.0.0.1.', isRead: false }
    ]);
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const clearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/notifications/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications([]);
    } catch (e) {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <header className="workspace-header">
        <div>
          <h1 className="title-gradient" style={{ fontSize: '1.75rem', marginBottom: '4px' }}>
            {title || `Good Morning, ${user ? user.firstName : 'Guest'}`}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Welcome back to your SmartBank AI workspace portal.
          </p>
        </div>

        {user && (
          <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* AI Voice Copilot Button */}
            <button 
              onClick={() => setShowVoiceModal(true)} 
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '20px',
                borderColor: 'var(--primary-glow)',
                color: 'var(--accent)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
              title="Launch AI Voice Banking Copilot"
            >
              <Mic size={16} />
              <span>AI Voice</span>
            </button>

            {/* Notification Bell */}
            <div className="header-icon-btn" onClick={() => setShowDropdown(!showDropdown)}>
              <Bell />
              {unreadCount > 0 && <span className="header-badge" />}
              
              {showDropdown && (
                <div 
                  className="glass-panel" 
                  style={{
                    position: 'absolute',
                    top: '55px',
                    right: '0',
                    width: '320px',
                    zIndex: 200,
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'default'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Notifications</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={markAllRead} title="Mark all read" style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}>
                        <Check size={16} />
                      </button>
                      <button onClick={clearAll} title="Clear all" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                        No new notifications
                      </p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          style={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            background: n.isRead ? 'transparent' : '#e6f4ee',
                            borderLeft: n.isRead ? 'none' : '3px solid var(--primary)'
                          }}
                        >
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: n.isRead ? 'var(--text-primary)' : 'var(--accent)' }}>{n.title}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile-circle">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
          </div>
        )}
      </header>

      {/* AI Voice Copilot Modal */}
      <AIVoiceCopilotModal 
        isOpen={showVoiceModal} 
        onClose={() => setShowVoiceModal(false)} 
        user={user} 
      />
    </>
  );
}

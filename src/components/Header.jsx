import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash } from 'lucide-react';

export default function Header({ user, title }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

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
      { id: 1, title: 'Welcome to SmartBank', message: 'Your digital account has been successfully set up.', isRead: false },
      { id: 2, title: '2FA OTP Verification', message: 'You have toggled secure two-factor auth settings.', isRead: true },
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
    <header className="workspace-header">
      <div>
        <h1 className="title-gradient" style={{ fontSize: '1.75rem', marginBottom: '4px' }}>
          {title || `Good Morning, ${user ? user.firstName : 'Guest'}`}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Welcome back to your dashboard panel.
        </p>
      </div>

      {user && (
        <div className="header-user">
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
                          background: n.isRead ? 'transparent' : 'rgba(124, 58, 237, 0.08)',
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
  );
}

import React, { useState, useEffect } from 'react';
import { Lock, Mail, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Login({ onLoginSuccess, setCurrentRoute }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // default is user login
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '480685397630-q0247l7f3c5dg9mubl7qkg1n24q005cp.apps.googleusercontent.com',
          callback: handleGoogleResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-login-button'),
          { theme: 'outline', size: 'large', width: '100%', shape: 'rectangular' }
        );
      } else {
        setTimeout(initGoogle, 100);
      }
    };
    initGoogle();
  }, []);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Google authentication failed');
      }
    } catch (err) {
      setError('Connection failed. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          selectedRole: role
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection failed. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'stretch' }}>
      
      {/* Left Form Panel */}
      <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Welcome Back!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Login to your SmartBank account.</p>
        </div>

        {error && (
          <div style={{ background: '#ffebeb', border: '1px solid rgba(255, 90, 96, 0.3)', padding: '12px', borderRadius: '10px', color: '#ff5a60', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div id="google-login-button" style={{ display: 'flex', justifyContent: 'center' }}></div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label className="form-label">Login Mode</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setRole('user')} 
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: role === 'user' ? 'var(--primary)' : '#f4f8f6', color: role === 'user' ? '#ffffff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                👤 User Login
              </button>
              <button 
                type="button" 
                onClick={() => setRole('admin')} 
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: role === 'admin' ? 'var(--primary)' : '#f4f8f6', color: role === 'admin' ? '#ffffff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                👑 Admin Login
              </button>
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="login-email"
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '44px' }} 
                placeholder="yourname@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="login-password"
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '44px' }} 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
              <span>Remember me</span>
            </label>
            <a style={{ color: 'var(--primary)', textDecoration: 'none', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '14px', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
            <ChevronRight size={18} />
          </button>
        </form>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Don't have an account? <a onClick={() => setCurrentRoute('register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Register</a>
        </p>
      </div>

      {/* Right Graphic Panel */}
      <div className="glass-panel" style={{ padding: '40px', background: 'linear-gradient(135deg, #e6f4ee 0%, #ffffff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          <ShieldCheck size={72} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Your Security, Our Priority</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, maxWidth: '240px', margin: '0 auto' }}>
            We utilize 256-bit encryption and advanced AI threat prevention to ensure your data stays safe.
          </p>
        </div>
      </div>

    </div>
  );
}

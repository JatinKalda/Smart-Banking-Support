import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, Landmark, ChevronRight } from 'lucide-react';

export default function Register({ onLoginSuccess, setCurrentRoute }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
          document.getElementById('google-register-button'),
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          confirmPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '30px auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '40px', alignItems: 'stretch' }}>
      
      {/* Left Form Panel */}
      <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Join SmartBank today and experience secure next-gen banking.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div id="google-register-button" style={{ display: 'flex', justifyContent: 'center' }}></div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label" htmlFor="first-name">First Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="first-name"
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '44px' }} 
                  placeholder="Jatin"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div>
              <label className="form-label" htmlFor="last-name">Last Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="last-name"
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '44px' }} 
                  placeholder="Kalda"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="signup-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="signup-email"
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '44px' }} 
                placeholder="jatin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="signup-phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="signup-phone"
                type="tel" 
                className="form-input" 
                style={{ paddingLeft: '44px' }} 
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="signup-password"
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
            <div>
              <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="confirm-password"
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '44px' }} 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '14px', justifyContent: 'center', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
            <ChevronRight size={18} />
          </button>
        </form>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Already have an account? <a onClick={() => setCurrentRoute('login')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Login</a>
        </p>
      </div>

      {/* Right Graphic Panel */}
      <div className="glass-panel" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', background: 'rgba(124, 58, 237, 0.2)', filter: 'blur(30px)', borderRadius: '50%' }} />
          <Landmark size={72} style={{ color: 'var(--accent)', position: 'relative', filter: 'drop-shadow(0 0 15px var(--primary))' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Security & Ease</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, maxWidth: '240px', margin: '0 auto' }}>
            Open checking & savings accounts in seconds and configure automated two-factor safety immediately.
          </p>
        </div>
      </div>

    </div>
  );
}

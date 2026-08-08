import React, { useState } from 'react';
import { Phone, Mail, MapPin, Headphones, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '0.8fr 1.2fr 0.8fr', gap: '24px', alignItems: 'stretch' }}>
      
      {/* Left Column: Contact details */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Get In Touch</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Have queries? Our support desk is open 24/7.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.85rem' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={16} />
            </div>
            <div>
              <h5 style={{ fontWeight: 600 }}>Phone Support</h5>
              <p style={{ color: 'var(--text-muted)' }}>+1-800-HSBC-USA</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={16} />
            </div>
            <div>
              <h5 style={{ fontWeight: 600 }}>Email Support</h5>
              <p style={{ color: 'var(--text-muted)' }}>support@smartbank.com</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={16} />
            </div>
            <div>
              <h5 style={{ fontWeight: 600 }}>Main Office</h5>
              <p style={{ color: 'var(--text-muted)' }}>333 Hope St, Los Angeles, CA</p>
            </div>
          </div>

        </div>
      </div>

      {/* Middle Column: Send Us a Message */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>Send Us a Message</h3>
        
        {sent ? (
          <div style={{ textAlign: 'center', padding: '30px 0', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)' }} />
            <h4 style={{ fontWeight: 700 }}>Message Received</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>We will reply to your registered email shortly.</p>
            <button onClick={() => setSent(false)} className="btn-secondary" style={{ marginTop: '10px' }}>
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div>
              <label className="form-label" htmlFor="contact-name">Full Name</label>
              <input 
                id="contact-name"
                type="text" 
                className="form-input" 
                placeholder="Jatin Kalda" 
                value={name}
                onChange={e => setName(e.target.value)}
                required 
              />
            </div>

            <div>
              <label className="form-label" htmlFor="contact-email">Email Address</label>
              <input 
                id="contact-email"
                type="email" 
                className="form-input" 
                placeholder="jatin@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>

            <div>
              <label className="form-label" htmlFor="contact-subject">Subject</label>
              <input 
                id="contact-subject"
                type="text" 
                className="form-input" 
                placeholder="How can we help?" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required 
              />
            </div>

            <div>
              <label className="form-label" htmlFor="contact-message">Message</label>
              <textarea 
                id="contact-message"
                className="form-input" 
                placeholder="Type your message here..." 
                rows="4" 
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ resize: 'none' }}
                required 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px', justifyContent: 'center' }}>
              <span>Send Message</span>
              <Send size={16} />
            </button>
          </form>
        )}
      </div>

      {/* Right Column: Glow Graphic */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px', height: '100px', background: 'rgba(124, 58, 237, 0.3)', filter: 'blur(30px)', borderRadius: '50%' }} />
          <Headphones size={60} style={{ color: 'var(--accent)', position: 'relative', filter: 'drop-shadow(0 0 15px var(--primary))' }} />
        </div>
        <div>
          <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>Live Help Desk</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>
            Our representatives are connected to answer calls and verify transactions instantly.
          </p>
        </div>
      </div>

    </div>
  );
}

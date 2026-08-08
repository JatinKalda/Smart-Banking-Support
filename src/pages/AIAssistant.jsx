import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Brain, Lock, RefreshCw } from 'lucide-react';

export default function AIAssistant({ user }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your SmartBank Copilot AI assistant, powered by Gemini 1.5 Flash. I can safely assist you with balance queries, transfers instructions, savings plans, or support ticketing. How can I help you today?",
      isAi: true,
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "How much did I spend this month?",
    "Show my current checking balance",
    "Explain fixed deposit options",
    "Check recent income statistics"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');
    
    const userMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: text,
      isAi: false,
      time: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          sessionId: `web-${user ? user.id : 'guest'}`
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          sender: 'bot',
          text: data.botResponse,
          isAi: true,
          intent: data.intent,
          safety: data.safetyCategory,
          time: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          sender: 'bot',
          text: 'Sorry, I encountered an issue compiling the response. Please try again.',
          isAi: true,
          time: new Date()
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'bot',
        text: 'Network connection error. Please verify that backend server is listening.',
        isAi: true,
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', height: 'calc(100vh - 180px)' }}>
      
      {/* Left Chat Workspace */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Chat Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Financial Copilot</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>● Gemini 1.5 Flash Connected</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure Session</span>
        </div>

        {/* Messages Body */}
        <div style={{ flexGrow: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map(msg => (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div 
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '16px', 
                  background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  textAlign: 'left'
                }}
              >
                {msg.text}

                {/* Structured Intent Analysis tags for bot responses */}
                {msg.isAi && msg.intent && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent)' }}>
                      Intent: {msg.intent}
                    </span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: msg.safety === 'safe' ? 'var(--success)' : 'var(--warning)' }}>
                      Safety: {msg.safety || 'verified'}
                    </span>
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', marginX: '6px' }}>
                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'flex-start' }}>
              <RefreshCw size={14} className="spin-animation" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span>Copilot is analyzing details...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask about your accounts, monthly spend, or fixed deposits..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button onClick={() => handleSend()} className="btn-primary" style={{ padding: '12px' }} disabled={loading}>
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>

      {/* Right Suggestions Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Quick Suggestions */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '16px' }}>
            <Sparkles size={18} />
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Smart Suggestions</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(s)}
                className="btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '10px 14px', borderRadius: '8px', textAlign: 'left', display: 'block', width: '100%', borderStyle: 'dashed' }}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Security Alert info */}
        <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginBottom: '12px' }}>
            <Lock size={18} />
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Safe Banking Policy</h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Our AI model does NOT execute transfers, modify passwords, or reveal CVVs. It can only describe processes or show summaries of records. Never share your card PIN or OTP with any assistant.
          </p>
        </div>

      </div>

      {/* Inline styles for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}

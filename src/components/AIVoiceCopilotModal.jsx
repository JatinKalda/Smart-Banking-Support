import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Check, ArrowRight } from 'lucide-react';

export default function AIVoiceCopilotModal({ isOpen, onClose, user }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startSpeechRecognition();
    }
  }, [isOpen]);

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Browser Speech API not supported. Enter query manually:");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSendVoiceQuery = async () => {
    if (!transcript) return;
    setExecuting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/voice-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transcript })
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data);
        speakText(data.botReply);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '32px', background: 'var(--surface-dark)', border: '1px solid var(--primary-glow)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--accent)', padding: '8px', borderRadius: '50%' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>AI Voice Banking Copilot</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>● Speech Recognition Active</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Pulse Mic Circle */}
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <button 
            onClick={startSpeechRecognition}
            style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '50%', 
              background: isListening ? 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)' : 'var(--primary)',
              border: 'none',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isListening ? '0 0 40px rgba(239, 68, 68, 0.6)' : '0 0 30px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {isListening ? <Mic size={36} /> : <MicOff size={36} />}
          </button>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '14px' }}>
            {isListening ? "Listening... Speak your command now" : "Tap microphone to speak command"}
          </p>
        </div>

        {/* Live Speech Input Box */}
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder='Say "Transfer $150 to Sapna" or "Lock my Visa Card"...'
            value={transcript} 
            onChange={e => setTranscript(e.target.value)}
          />
        </div>

        <button 
          onClick={handleSendVoiceQuery} 
          className="btn-primary" 
          disabled={!transcript || executing}
          style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {executing ? 'Processing Intent...' : 'Process Spoken Voice Intent'} <ArrowRight size={16} />
        </button>

        {/* AI Parsed Response Card */}
        {aiResponse && (
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
              <Volume2 size={16} /> AI Parsed Intent Response:
            </div>
            <p style={{ fontSize: '0.85rem', color: '#fff', lineHeight: 1.5 }}>
              {aiResponse.botReply}
            </p>

            {aiResponse.actionType === 'EXECUTE_TRANSFER' && (
              <button onClick={onClose} className="btn-primary" style={{ marginTop: '12px', width: '100%', background: '#10b981', border: 'none' }}>
                Confirm Transfer ${aiResponse.parameters.amount}
              </button>
            )}

            {aiResponse.actionType === 'LOCK_CARD' && (
              <button onClick={onClose} className="btn-primary" style={{ marginTop: '12px', width: '100%', background: '#ef4444', border: 'none' }}>
                Confirm Emergency Card Lock
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

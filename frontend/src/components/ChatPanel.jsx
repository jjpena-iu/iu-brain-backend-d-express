import React, { useRef, useEffect } from 'react';
import { parseMarkdown } from '../services/markdown.js';

function Message({ role, text }) {
  const isAI = role === 'ai';
  return (
    <div style={{
      display: 'flex', gap: '10px', flexDirection: isAI ? 'row' : 'row-reverse',
      animation: 'fadeUp .3s ease forwards', opacity: 0,
    }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {/* Avatar */}
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px',
        background: isAI ? 'linear-gradient(135deg, var(--accent), #4f46e5)' : 'var(--surface2)',
        color: isAI ? '#fff' : 'var(--text-dim)',
        border: isAI ? 'none' : '1px solid var(--border)',
      }}>{isAI ? 'iU' : 'C'}</div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '78%', padding: '11px 14px', borderRadius: '12px',
          fontSize: '13.5px', lineHeight: '1.65',
          background: isAI ? 'var(--surface2)' : 'linear-gradient(135deg, var(--accent), #4f46e5)',
          border: isAI ? '1px solid var(--border)' : 'none',
          color: isAI ? 'var(--text)' : '#fff',
          borderTopLeftRadius: isAI ? '3px' : '12px',
          borderTopRightRadius: isAI ? '12px' : '3px',
        }}
        dangerouslySetInnerHTML={{ __html: injectBubbleStyles(parseMarkdown(text), isAI) }}
      />
    </div>
  );
}

function injectBubbleStyles(html, isAI) {
  // We rely on global bubble CSS injected via <style> in ChatPanel
  return html;
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px',
        background: 'linear-gradient(135deg, var(--accent), #4f46e5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', color: '#fff',
      }}>iU</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '12px 14px', background: 'var(--surface2)',
        border: '1px solid var(--border)', borderRadius: '12px', borderTopLeftRadius: '3px',
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-muted)',
            animation: `bounce 1.2s ${delay}s infinite`,
          }} />
        ))}
        <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, isTyping, questionCount, onSend }) {
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const [input, setInput] = React.useState('');

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    onSend(text);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progress = Math.min((questionCount / 15) * 100, 100);

  return (
    <section style={{
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderRight: '1px solid var(--border)',
    }}>
      <style>{`
        .bubble-content strong { font-weight: 600; color: var(--accent2); }
        .bubble-user strong { color: rgba(255,255,255,.9) !important; }
        .bubble-content em { font-style: italic; color: var(--text-dim); }
        .bubble-content h1,.bubble-content h2,.bubble-content h3 { font-family: var(--font-display); font-weight: 700; margin: 10px 0 6px; }
        .bubble-content h1 { font-size: 15px; color: var(--text); }
        .bubble-content h2 { font-size: 13px; color: var(--accent2); text-transform: uppercase; letter-spacing: .8px; }
        .bubble-content h3 { font-size: 13px; color: var(--text); }
        .bubble-content p { margin-bottom: 6px; }
        .bubble-content p:last-child { margin-bottom: 0; }
        .bubble-content ul,.bubble-content ol { padding-left: 18px; margin: 4px 0 6px; }
        .bubble-content li { margin-bottom: 3px; }
        .bubble-content hr { border: none; border-top: 1px solid var(--border); margin: 10px 0; }
        .bubble-content table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
        .bubble-content th { background: rgba(124,92,252,.15); border: 1px solid var(--border); padding: 5px 8px; text-align: left; font-weight: 600; color: var(--accent2); }
        .bubble-content td { border: 1px solid var(--border); padding: 4px 8px; }
        .bubble-content code { background: rgba(255,255,255,.08); padding: 1px 5px; border-radius: 3px; font-size: 12px; }
        .bubble-content blockquote { border-left: 3px solid var(--accent); padding-left: 12px; color: var(--text-dim); font-style: italic; margin: 8px 0; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Sesión de Diagnóstico
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{questionCount} / 15 preguntas</span>
        </div>
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            borderRadius: '4px', transition: 'width .5s ease',
          }} />
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}>
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} text={msg.text} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKey}
            placeholder="Escribe aquí tu respuesta…"
            rows={1}
            disabled={isTyping}
            style={{
              flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '10px 14px',
              fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text)',
              resize: 'none', outline: 'none', minHeight: '42px', maxHeight: '120px',
              lineHeight: '1.5', transition: 'border-color var(--transition)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            style={{
              width: '42px', height: '42px', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), #4f46e5)',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: (isTyping || !input.trim()) ? 0.3 : 1,
              transition: 'opacity var(--transition)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

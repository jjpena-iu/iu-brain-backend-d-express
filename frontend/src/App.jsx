import React, { useState, useCallback } from 'react';
import Topbar from './components/Topbar.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import ReportPanel from './components/ReportPanel.jsx';
import { sendChatMessage, extractReport, stripReportMarkers } from './services/api.js';

const PHASE_MAP = {
  'FASE 1': 'Fase 1 — Contexto',
  'Fase 1': 'Fase 1 — Contexto',
  'FASE 2': 'Fase 2 — Procesos',
  'Fase 2': 'Fase 2 — Procesos',
  'FASE 3': 'Fase 3 — Automatización',
  'Fase 3': 'Fase 3 — Automatización',
  'FASE 4': 'Fase 4 — Impacto',
  'Fase 4': 'Fase 4 — Impacto',
};

function detectPhase(text) {
  for (const [key, label] of Object.entries(PHASE_MAP)) {
    if (text.includes(key)) return label;
  }
  if (text.includes('Generando tu diagnóstico') || text.includes('REPORTE_INICIO')) return '✅ Generando reporte…';
  return null;
}

function extractClientName(text) {
  const match = text.match(/DIAGNÓSTICO EXPRESS\s*[—–-]\s*(.+)/i);
  return match ? match[1].trim() : null;
}

export default function App() {
  const [messages, setMessages] = useState([]);         // { role: 'ai'|'user', text: string }
  const [history, setHistory] = useState([]);            // Gemini format: { role, parts }
  const [isTyping, setIsTyping] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [phase, setPhase] = useState(null);
  const [report, setReport] = useState(null);
  const [clientName, setClientName] = useState(null);

  const handleSend = useCallback(async (text) => {
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', text }]);
    setQuestionCount(prev => prev + 1);

    // Build new history
    const newHistory = [...history, { role: 'user', parts: [{ text }] }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      const reply = await sendChatMessage(newHistory);

      // Detect phase
      const detectedPhase = detectPhase(reply);
      if (detectedPhase) setPhase(detectedPhase);

      // Check for report
      const reportContent = extractReport(reply);
      if (reportContent) {
        setReport(reportContent);
        setPhase('✅ Diagnóstico completado');
        const name = extractClientName(reportContent);
        if (name) setClientName(name);
      }

      // Clean markers for display
      const displayText = stripReportMarkers(reply);

      setMessages(prev => [...prev, { role: 'ai', text: displayText }]);
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: reply }] }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `❌ **Error de conexión:** ${err.message}\n\nVerifica que el backend esté corriendo correctamente.`,
      }]);
    }

    setIsTyping(false);
  }, [history]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '56px 1fr',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <Topbar phase={phase} />
      <ChatPanel
        messages={messages}
        isTyping={isTyping}
        questionCount={questionCount}
        onSend={handleSend}
      />
      <ReportPanel report={report} clientName={clientName} />
    </div>
  );
}

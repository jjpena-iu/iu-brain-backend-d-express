const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export async function sendChatMessage(messages) {
  const res = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }

  const data = await res.json();
  return data.reply;
}

export const REPORT_START = '<<<REPORTE_INICIO>>>';
export const REPORT_END = '<<<REPORTE_FIN>>>';

export function extractReport(text) {
  const start = text.indexOf(REPORT_START);
  const end = text.indexOf(REPORT_END);
  if (start === -1 || end === -1) return null;
  return text.slice(start + REPORT_START.length, end).trim();
}

export function stripReportMarkers(text) {
  return text
    .replace(REPORT_START, '')
    .replace(REPORT_END, '')
    .trim();
}

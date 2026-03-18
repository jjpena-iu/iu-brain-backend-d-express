/**
 * Simple Markdown → HTML parser
 * Handles: bold, italic, headers, lists, tables, hr, blockquote, code
 */
export function parseMarkdown(text) {
  if (!text) return '';

  // Escape HTML entities
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Tables (must come before other replacements)
  html = parseMarkdownTables(html);

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold — must close correctly **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic — *text* (not inside bold)
  html = html.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr />');

  // Blockquote
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Ordered list items
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ol-item">$1</li>');

  // Unordered list items
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> into <ul>/<ol>
  html = html.replace(/(<li class="ol-item">[\s\S]*?<\/li>(\n|$))+/g, m => `<ol>${m.replace(/ class="ol-item"/g, '')}</ol>`);
  html = html.replace(/(<li>[\s\S]*?<\/li>(\n|$))+/g, m => {
    if (m.includes('<ol>')) return m;
    return `<ul>${m}</ul>`;
  });

  // Paragraphs — wrap bare lines
  const lines = html.split('\n');
  const result = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) { result.push(''); continue; }
    const isBlock = /^<(h[1-6]|ul|ol|li|hr|blockquote|table|thead|tbody|tr|th|td|\/)/i.test(t);
    result.push(isBlock ? t : `<p>${t}</p>`);
  }

  return result.join('\n');
}

function parseMarkdownTables(text) {
  // Match table blocks: header row | separator | body rows
  return text.replace(
    /^(\|.+\|\n)\|[-| :]+\|\n((?:\|.+\|\n?)*)/gm,
    (_, header, body) => {
      const parseRow = row =>
        row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

      const headers = parseRow(header);
      const rows = body.trim().split('\n').filter(Boolean).map(parseRow);

      const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
      return `<table>${thead}${tbody}</table>\n`;
    }
  );
}

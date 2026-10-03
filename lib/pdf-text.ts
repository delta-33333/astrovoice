/** PDF texte WinAnsi, sans dépendance. Les caractères hors Latin-1 sont simplifiés. */

function toWinAnsi(value: string): string {
  return value
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\n\x20-\xff]/g, ' ');
}

function escapePdf(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  for (const paragraph of toWinAnsi(text).split(/\n+/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > width) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
    lines.push('');
  }
  return lines;
}

export function pdfFromText(title: string, body: string): Buffer {
  const lines = wrap(`${title}\n\n${body}`, 88).slice(0, 800);
  const pageSize = 46;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += pageSize) pages.push(lines.slice(i, i + pageSize));
  if (pages.length === 0) pages.push(['']);

  const fontId = 3;
  const parts: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '',
    `${fontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>\nendobj\n`,
  ];
  const pageIds: number[] = [];
  let nextId = 4;
  for (const pageLines of pages) {
    const commands = ['BT', '/F1 12 Tf', '14 TL', '50 800 Td'];
    pageLines.forEach((line, index) => {
      if (index > 0) commands.push('T*');
      commands.push(`(${escapePdf(line)}) Tj`);
    });
    commands.push('ET');
    const stream = commands.join('\n');
    const contentId = nextId;
    nextId += 1;
    const pageId = nextId;
    nextId += 1;
    pageIds.push(pageId);
    parts.push(
      `${contentId} 0 obj\n<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
    parts.push(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>\nendobj\n`
    );
  }
  const kids = pageIds.map((id) => `${id} 0 R`).join(' ');
  parts[1] = `2 0 obj\n<< /Type /Pages /Count ${pageIds.length} /Kids [${kids}] >>\nendobj\n`;

  const rebuilt: Buffer[] = [Buffer.from('%PDF-1.4\n', 'latin1')];
  let at = rebuilt[0].length;
  const xrefOffsets = [0];
  for (const source of parts) {
    xrefOffsets.push(at);
    const buf = Buffer.from(source, 'latin1');
    rebuilt.push(buf);
    at += buf.length;
  }
  let xref = `xref\n0 ${xrefOffsets.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < xrefOffsets.length; i += 1) {
    xref += `${String(xrefOffsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${xrefOffsets.length} /Root 1 0 R >>\nstartxref\n${at}\n%%EOF`;
  rebuilt.push(Buffer.from(xref, 'latin1'));
  return Buffer.concat(rebuilt);
}

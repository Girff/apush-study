/** Downloads: progress backups (JSON) and the deck as CSV/TSV for Quizlet, Anki or a spreadsheet. */
import { BASKET, CARDS } from './deck';
import { type Progress, sanitize } from './store';

export function deckTable(format: 'csv' | 'tsv', ids?: string[]): string {
  const wanted = ids ? new Set(ids) : null;
  const rows = CARDS.filter((c) => !wanted || wanted.has(c.id)).map((c) => [c.term, c.def, BASKET.get(c.basket)!.title]);
  if (format === 'tsv') {
    // Quizlet and Anki import "term<TAB>definition" lines; tabs and newlines never appear in the deck.
    return rows.map((r) => r.join('\t')).join('\n') + '\n';
  }
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return ['Term,Definition,Basket', ...rows.map((r) => r.map(esc).join(','))].join('\r\n') + '\r\n';
}

export function progressFile(p: Progress): string {
  return JSON.stringify({ app: 'apush-unit4-flashcards', exportedAt: new Date().toISOString(), progress: p }, null, 1);
}

/** Parse a backup file; accepts our export wrapper or a bare progress object. */
export function parseProgressFile(text: string): Progress | null {
  try {
    const data = JSON.parse(text) as unknown;
    const inner = typeof data === 'object' && data !== null && 'progress' in data ? (data as { progress: unknown }).progress : data;
    if (typeof inner !== 'object' || inner === null || !('srs' in inner)) return null;
    return sanitize(inner);
  } catch {
    return null;
  }
}

export function download(filename: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Instant search over terms and definitions (no index needed for ~300 cards). */
import { CARDS, type Card } from './deck';
import { normalize } from './match';

interface Indexed {
  card: Card;
  term: string;
  def: string;
}

const INDEX: Indexed[] = CARDS.map((card) => ({ card, term: normalize(card.term), def: normalize(card.def) }));

/** Cards matching every word of the query, best matches first. */
export function searchCards(query: string, limit = 400): Card[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(' ');
  const scored: { card: Card; score: number }[] = [];
  for (const { card, term, def } of INDEX) {
    let score = 0;
    let ok = true;
    for (const w of words) {
      if (term.includes(w)) score += term.startsWith(w) || term.includes(` ${w}`) ? 3 : 2;
      else if (def.includes(w)) score += 1;
      else {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (term === q) score += 10;
    else if (term.startsWith(q)) score += 5;
    scored.push({ card, score });
  }
  scored.sort((a, b) => b.score - a.score || a.card.index - b.card.index);
  return scored.slice(0, limit).map((s) => s.card);
}

/** Split text into plain and highlighted parts for the query's words (case- and accent-insensitive). */
export function highlight(text: string, query: string): { text: string; hit: boolean }[] {
  const words = normalize(query).split(' ').filter((w) => w.length > 1);
  if (!words.length) return [{ text, hit: false }];
  // Fold the text the same way as the search, keeping a map back to the original characters.
  const folded: string[] = [];
  const origin: number[] = [];
  [...text].forEach((ch, i) => {
    const f = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
    for (const c of f) {
      folded.push(c);
      origin.push(i);
    }
  });
  const chars = [...text];
  const marks = new Array<boolean>(chars.length).fill(false);
  const hay = folded.join('');
  for (const w of words) {
    let from = 0;
    for (;;) {
      const at = hay.indexOf(w, from);
      if (at < 0) break;
      for (let k = at; k < at + w.length; k++) marks[origin[k]] = true;
      from = at + w.length;
    }
  }
  const parts: { text: string; hit: boolean }[] = [];
  chars.forEach((ch, i) => {
    const last = parts[parts.length - 1];
    if (last && last.hit === marks[i]) last.text += ch;
    else parts.push({ text: ch, hit: marks[i] });
  });
  return parts;
}

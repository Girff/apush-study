/**
 * Checking typed answers in Type mode. Lenient where it should be (case,
 * accents, punctuation, "the", small typos, a year left off or added) and
 * strict where it matters (Tariff of 1816 is not Tariff of 1828).
 */
import type { Card } from './deck';

export type Verdict = 'correct' | 'close' | 'wrong';

export function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’‘"“”′″`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^(the|a|an) /, '');
}

/** The term without parenthetical asides: "Louisiana Purchase (1803)" → "Louisiana Purchase". */
export function mainTerm(term: string): string {
  return term.replace(/\s*\([^)]*\)/g, '').trim();
}

/** Every normalized answer accepted for a card. */
export function acceptedAnswers(card: Pick<Card, 'term' | 'alts'>): string[] {
  const out = new Set<string>();
  const add = (s: string) => {
    const n = normalize(s);
    if (n) out.add(n);
  };
  add(mainTerm(card.term));
  add(card.term);
  for (const m of card.term.matchAll(/\(([^)]*)\)/g)) {
    // Parentheticals that are names ("the Prophet", "Cotton Kingdom") are answers too; dates are not.
    if (/[a-z]/i.test(normalize(m[1]))) add(m[1]);
  }
  for (const a of card.alts ?? []) add(a);
  return [...out];
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Typos allowed for an answer of this length. */
export function tolerance(length: number): number {
  if (length <= 3) return 0;
  if (length <= 6) return 1;
  if (length <= 12) return 2;
  if (length <= 20) return 3;
  return 4;
}

const digits = (s: string) => s.match(/\d+/g)?.join(' ') ?? '';

export function checkAnswer(input: string, card: Pick<Card, 'term' | 'alts'>): Verdict {
  const given = normalize(input);
  if (!given) return 'wrong';
  let verdict: Verdict = 'wrong';
  for (const answer of acceptedAnswers(card)) {
    if (given === answer || given.replace(/ /g, '') === answer.replace(/ /g, '')) return 'correct';
    // A wrong number is a wrong answer, however close the spelling (1816 vs 1828).
    const gd = digits(given);
    const ad = digits(answer);
    if (gd && ad && gd !== ad) continue;
    if (levenshtein(given, answer) <= tolerance(answer.length)) verdict = 'close';
  }
  return verdict;
}

/** Progressive hint: the first `level` letters of each word, the rest blanked. */
export function hint(term: string, level: number): string {
  return mainTerm(term)
    .split(/(\s+)/)
    .map((word) => {
      if (/^\s+$/.test(word)) return word;
      let shown = 0;
      return [...word]
        .map((ch) => {
          if (!/[\p{L}\p{N}]/u.test(ch)) return ch;
          shown++;
          return shown <= level ? ch : '_';
        })
        .join('');
    })
    .join('');
}

/** How many hint levels a term can use before the hint is the whole answer. */
export function maxHint(term: string): number {
  return Math.max(1, ...mainTerm(term).split(/\s+/).map((w) => [...w].filter((ch) => /[\p{L}\p{N}]/u.test(ch)).length - 1));
}

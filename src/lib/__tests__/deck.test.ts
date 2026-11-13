/**
 * Deck integrity and the curation ledger. `npm run validate` runs this file
 * before every build, so a broken card or an unaccounted source entry fails
 * the build.
 */
import { describe, expect, it } from 'vitest';
import original from '../../data/apush-unit4-terms.json';
import curation from '../../data/curation.json';
import deck from '../../data/deck.json';
import { BASKETS, CARD, CARDS, GROUPS } from '../deck';
import { acceptedAnswers, checkAnswer, mainTerm, normalize } from '../match';

interface Ledger {
  cards: Record<string, string[]>;
  dropped: { source: string; reason: string }[];
  corrections: { source: string; issue: string; card: string }[];
}
const ledger = curation as Ledger;

const originals = new Map<string, { term: string; yawp: string; def: string }>();
for (const topic of original as { id: string; terms: { term: string; yawp: string; def: string }[] }[]) {
  for (const t of topic.terms) originals.set(`${topic.id}:${t.term}`, t);
}

describe('deck structure', () => {
  it('has groups, baskets and cards that reference each other correctly', () => {
    expect(GROUPS.length).toBeGreaterThan(0);
    const groupIds = new Set(GROUPS.map((g) => g.id));
    expect(groupIds.size).toBe(GROUPS.length);
    expect(new Set(BASKETS.map((b) => b.id)).size).toBe(BASKETS.length);
    for (const b of BASKETS) {
      expect(groupIds.has(b.group), b.id).toBe(true);
      expect(b.cardIds.length, b.id).toBeGreaterThan(0);
      expect(b.title && b.years && b.blurb, b.id).toBeTruthy();
    }
    for (const g of GROUPS) expect(g.basketIds.length, g.id).toBeGreaterThan(0);
    expect(CARDS.length).toBe(deck.baskets.reduce((n, b) => n + b.cards.length, 0));
  });

  it('gives every card a unique, URL-safe id and a unique term', () => {
    expect(CARD.size).toBe(CARDS.length);
    for (const c of CARDS) expect(c.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const terms = CARDS.map((c) => normalize(mainTerm(c.term)));
    expect(new Set(terms).size).toBe(terms.length);
  });

  it('has a complete definition on every card that does not give away the term', () => {
    for (const c of CARDS) {
      expect(c.term.trim(), c.id).toBe(c.term);
      expect(c.def.length, c.id).toBeGreaterThan(30);
      expect(c.def, c.id).toMatch(/[.!?”]$/);
      // Typography: curly quotes and apostrophes only.
      expect(c.term + c.def, c.id).not.toMatch(/['"]/);
      const core = mainTerm(c.term).replace(/[“”‘’]/g, '').toLowerCase();
      expect(c.def.replace(/[“”‘’]/g, '').toLowerCase().includes(core), `${c.id} definition contains its term`).toBe(false);
    }
  });

  it('accepts each card’s own term and alternates in Type mode, and no answer belongs to two cards', () => {
    const owner = new Map<string, string>();
    for (const c of CARDS) {
      expect(checkAnswer(c.term, c), c.id).toBe('correct');
      expect(checkAnswer(mainTerm(c.term), c), c.id).toBe('correct');
      for (const a of c.alts ?? []) expect(checkAnswer(a, c), `${c.id}: ${a}`).toBe('correct');
      for (const a of acceptedAnswers(c)) {
        const prev = owner.get(a);
        expect(prev === undefined || prev === c.id, `"${a}" is an answer for both ${prev} and ${c.id}`).toBe(true);
        owner.set(a, c.id);
      }
    }
  });
});

describe('curation ledger', () => {
  it('has an entry for exactly the cards in the deck', () => {
    expect(Object.keys(ledger.cards).sort()).toEqual(CARDS.map((c) => c.id).sort());
  });

  it('lists sources only for cards from the original list', () => {
    for (const c of CARDS) {
      const sources = ledger.cards[c.id];
      if (c.added) {
        expect(sources, c.id).toEqual([]);
        expect(c.yawp, c.id).toBeUndefined();
      } else {
        expect(sources.length, c.id).toBeGreaterThan(0);
        expect(c.yawp, c.id).toBeTruthy();
      }
    }
  });

  it('cites the Yawp sections of each card’s sources', () => {
    for (const c of CARDS) {
      if (c.added) continue;
      const cites = new Set(ledger.cards[c.id].flatMap((s) => originals.get(s)!.yawp.split(',').map((x) => x.trim())));
      expect(new Set(c.yawp!.split(',').map((x) => x.trim())), c.id).toEqual(cites);
    }
  });

  it('accounts for every one of the original entries exactly once: on a card or dropped with a reason', () => {
    expect(originals.size).toBe(361);
    const mapped = new Set(Object.values(ledger.cards).flat());
    const dropped = new Set(ledger.dropped.map((d) => d.source));
    for (const ref of [...mapped, ...dropped]) expect(originals.has(ref), `unknown source ${ref}`).toBe(true);
    for (const ref of dropped) expect(mapped.has(ref), `${ref} is both mapped and dropped`).toBe(false);
    for (const d of ledger.dropped) expect(d.reason.length, d.source).toBeGreaterThan(10);
    const missing = [...originals.keys()].filter((k) => !mapped.has(k) && !dropped.has(k));
    expect(missing).toEqual([]);
  });

  it('points every correction at a real source and card', () => {
    for (const c of ledger.corrections) {
      expect(originals.has(c.source), c.source).toBe(true);
      expect(CARD.has(c.card), c.card).toBe(true);
    }
  });
});

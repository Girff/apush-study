/**
 * The curated Unit 4 deck: groups → baskets → cards, plus lookup tables.
 * `src/data/deck.json` is the single source of truth; see CONTENT_NOTES.md
 * for how it was curated from the original term list.
 */
import raw from '../data/deck.json';

export interface Card {
  id: string;
  term: string;
  def: string;
  /** American Yawp chapter.section citations, e.g. "7.IV, 9.III". */
  yawp?: string;
  /** Extra answers accepted in Type mode. */
  alts?: string[];
  /** Added for full Unit 4 coverage (not in the original term list). */
  added?: boolean;
  basket: string;
  group: string;
  /** Position in the whole deck, for "in order" study. */
  index: number;
}

export interface Basket {
  id: string;
  group: string;
  title: string;
  years: string;
  blurb: string;
  cardIds: string[];
}

export interface Group {
  id: string;
  title: string;
  years: string;
  basketIds: string[];
}

interface RawCard {
  id: string;
  term: string;
  def: string;
  yawp?: string;
  alts?: string[];
  added?: boolean;
}
interface RawDeck {
  title: string;
  period: string;
  groups: { id: string; title: string; years: string }[];
  baskets: { id: string; group: string; title: string; years: string; blurb: string; cards: RawCard[] }[];
}

const deck = raw as RawDeck;

export const DECK_TITLE = deck.title;
export const DECK_PERIOD = deck.period;

export const CARDS: Card[] = [];
export const CARD = new Map<string, Card>();
export const BASKETS: Basket[] = [];
export const BASKET = new Map<string, Basket>();
export const GROUPS: Group[] = deck.groups.map((g) => ({ ...g, basketIds: [] }));
export const GROUP = new Map(GROUPS.map((g) => [g.id, g]));

for (const b of deck.baskets) {
  const basket: Basket = { id: b.id, group: b.group, title: b.title, years: b.years, blurb: b.blurb, cardIds: [] };
  for (const c of b.cards) {
    const card: Card = { ...c, basket: b.id, group: b.group, index: CARDS.length };
    CARDS.push(card);
    CARD.set(card.id, card);
    basket.cardIds.push(card.id);
  }
  BASKETS.push(basket);
  BASKET.set(basket.id, basket);
  GROUP.get(b.group)?.basketIds.push(b.id);
}

export const ALL_BASKET_IDS = BASKETS.map((b) => b.id);

/** Card ids of the given baskets, in deck order. */
export function cardsOf(basketIds: Iterable<string>): string[] {
  const wanted = new Set(basketIds);
  return CARDS.filter((c) => wanted.has(c.basket)).map((c) => c.id);
}

/** "Jefferson’s Presidency", "Jefferson’s Presidency + 2 more", "All 22 baskets". */
export function basketsLabel(basketIds: string[]): string {
  const ids = ALL_BASKET_IDS.filter((id) => basketIds.includes(id));
  if (ids.length === 0) return 'No baskets';
  if (ids.length === BASKETS.length) return `All ${BASKETS.length} baskets`;
  const first = BASKET.get(ids[0])!.title;
  return ids.length === 1 ? first : `${first} + ${ids.length - 1} more`;
}

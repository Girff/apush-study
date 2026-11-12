import { describe, expect, it } from 'vitest';
import { DAY, MINUTE, cardKey, parseCardKey, review, startOfDay, strength } from '../srs';

const NOW = new Date(2026, 0, 10, 15, 30).getTime();

describe('SM-2 scheduling', () => {
  it('sends a failed card back in 10 minutes and keeps ease ≥ 1.3', () => {
    let card = review(undefined, 'again', NOW);
    expect(card.due).toBe(NOW + 10 * MINUTE);
    expect(card.interval).toBe(0);
    for (let i = 0; i < 20; i++) card = review(card, 'again', NOW);
    expect(card.ef).toBeGreaterThanOrEqual(1.3);
  });

  it('grows intervals 1 → 6 → ~15 days for repeated "good"', () => {
    const a = review(undefined, 'good', NOW);
    expect(a.interval).toBe(1);
    expect(a.due).toBe(startOfDay(NOW) + DAY);
    const b = review(a, 'good', NOW + DAY);
    expect(b.interval).toBe(6);
    const c = review(b, 'good', NOW + 7 * DAY);
    expect(c.interval).toBeGreaterThanOrEqual(14);
    expect(c.interval).toBeLessThanOrEqual(16);
  });

  it('counts a lapse only for a card that had been learned', () => {
    const learned = review(review(undefined, 'good', NOW), 'good', NOW + DAY);
    const lapsed = review(learned, 'again', NOW + 7 * DAY);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.reps).toBe(0);
    expect(review(undefined, 'again', NOW).lapses).toBe(0);
  });

  it('makes "easy" schedule further out than "hard"', () => {
    const base = review(review(undefined, 'good', NOW), 'good', NOW + DAY);
    expect(review(base, 'easy', NOW + 7 * DAY).interval).toBeGreaterThan(review(base, 'hard', NOW + 7 * DAY).interval);
  });

  it('round-trips card keys and maps strength to 0–1', () => {
    expect(parseCardKey(cardKey('4.4~war-of-1812', 'dt'))).toEqual({ termId: '4.4~war-of-1812', dir: 'dt' });
    expect(parseCardKey('nope')).toBeNull();
    expect(strength(undefined)).toBe(0);
    expect(strength({ ef: 2.5, interval: 60, reps: 5, lapses: 0, due: 0, last: 0 })).toBe(1);
  });
});

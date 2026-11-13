import { describe, expect, it } from 'vitest';
import { ALL_BASKET_IDS } from '../deck';
import { parseProgressFile, progressFile, deckTable } from '../exportData';
import { highlight, searchCards } from '../search';
import { emptyProgress, localDate, mergeProgress, rollDay, sanitize } from '../store';

const NOW = new Date(2026, 4, 1, 9, 0).getTime();
const good = { ef: 2.5, interval: 6, reps: 2, lapses: 0, due: NOW, last: NOW - 1000 };

describe('sanitize', () => {
  it('keeps valid progress and drops malformed entries', () => {
    const p = sanitize(
      {
        srs: { 'election-of-1800>td': good, 'bad key': good, 'nullification>dt': { ef: 'x' }, 'tecumseh>dt': { ...good, ef: 0.5 } },
        stats: { tecumseh: { seen: 3, missed: 9, last: NOW }, junk: { seen: 'a' } },
        starred: ['tecumseh', 4],
        excluded: { 'red-jacket': true },
        selected: ['jefferson', 'not-a-basket'],
        today: { date: localDate(NOW), reviews: 5, fresh: 2 },
      },
      NOW,
    );
    expect(Object.keys(p.srs).sort()).toEqual(['election-of-1800>td', 'tecumseh>dt']);
    expect(p.srs['tecumseh>dt'].ef).toBe(1.3);
    expect(p.stats).toEqual({ tecumseh: { seen: 3, missed: 3, last: NOW } });
    expect(p.starred).toEqual({ tecumseh: true });
    expect(p.excluded).toEqual({ 'red-jacket': true });
    expect(p.selected).toEqual(['jefferson']);
    expect(p.today).toEqual({ date: localDate(NOW), reviews: 5, fresh: 2 });
  });

  it('falls back to empty progress with every basket selected', () => {
    expect(sanitize(null, NOW)).toEqual(emptyProgress(NOW));
    expect(sanitize('nope', NOW).selected).toEqual(ALL_BASKET_IDS);
  });

  it('starts a new day with fresh counters', () => {
    const p = { ...emptyProgress(NOW), today: { date: '2020-01-01', reviews: 40, fresh: 20 } };
    expect(rollDay(p, NOW).today).toEqual({ date: localDate(NOW), reviews: 0, fresh: 0 });
  });
});

describe('import and export', () => {
  it('round-trips a progress file and merges by most recent review', () => {
    const mine = { ...emptyProgress(NOW), srs: { 'tecumseh>td': good } };
    const theirs = { ...emptyProgress(NOW), srs: { 'tecumseh>td': { ...good, interval: 30, last: NOW }, 'red-jacket>td': good }, starred: { tecumseh: true as const } };
    const parsed = parseProgressFile(progressFile(theirs))!;
    expect(parsed.srs).toEqual(theirs.srs);
    const merged = mergeProgress(mine, parsed);
    expect(merged.srs['tecumseh>td'].interval).toBe(30);
    expect(Object.keys(merged.srs)).toHaveLength(2);
    expect(merged.starred).toEqual({ tecumseh: true });
    expect(parseProgressFile('{"hello": 1}')).toBeNull();
    expect(parseProgressFile('not json')).toBeNull();
  });

  it('exports the deck as CSV and TSV', () => {
    const csv = deckTable('csv', ['election-of-1800']);
    expect(csv.split('\r\n')[0]).toBe('Term,Definition,Basket');
    expect(csv).toContain('Election of 1800,"Thomas Jefferson’s Democratic-Republicans');
    const tsv = deckTable('tsv');
    expect(tsv.trim().split('\n').every((line) => line.split('\t').length === 3)).toBe(true);
  });
});

describe('search', () => {
  it('ranks term matches first and requires every word', () => {
    expect(searchCards('louisiana')[0].id).toBe('louisiana-purchase-1803');
    expect(searchCards('trail tears')[0].id).toBe('trail-of-tears-1838-1839');
    expect(searchCards('cherokee').length).toBeGreaterThan(4);
    expect(searchCards('zzzz')).toEqual([]);
    expect(searchCards('   ')).toEqual([]);
  });

  it('highlights matches regardless of accents', () => {
    expect(highlight('Adams–Onís Treaty', 'onis')).toEqual([
      { text: 'Adams–', hit: false },
      { text: 'Onís', hit: true },
      { text: ' Treaty', hit: false },
    ]);
  });
});

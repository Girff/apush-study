import { describe, expect, it } from 'vitest';
import { BASKET } from '../deck';
import { createRng } from '../random';
import { REQUEUE_GAP, type SessionSpec, answerCard, createSession, dropCard, firstTryCorrect, planSession, poolFor, restoreCard, undoAnswer } from '../session';
import { DAY, review } from '../srs';
import { type Progress, emptyProgress } from '../store';
import { cardStatus, isWeak } from '../status';

const NOW = new Date(2026, 2, 3, 16, 0).getTime();
const JEFF = BASKET.get('jefferson')!.cardIds;

const spec = (over: Partial<SessionSpec> = {}): SessionSpec => ({
  mode: 'practice',
  answer: 'flip',
  dir: 'td',
  filter: 'all',
  order: 'deck',
  size: 0,
  newPerDay: 20,
  baskets: ['jefferson'],
  label: 'test',
  ...over,
});

const fresh = (): Progress => emptyProgress(NOW);

describe('planning a session', () => {
  it('draws from the chosen baskets in deck order, capped by size, skipping hidden cards', () => {
    const p = fresh();
    p.excluded[JEFF[1]] = true;
    const plan = planSession(spec({ size: 5 }), p, NOW);
    expect(plan.items.map((i) => i.id)).toEqual([JEFF[0], JEFF[2], JEFF[3], JEFF[4], JEFF[5]]);
    expect(plan.pool).toBe(JEFF.length - 1);
    expect(plan.items.every((i) => i.dir === 'td')).toBe(true);
  });

  it('applies the starred, new and weak filters', () => {
    const p = fresh();
    p.starred[JEFF[3]] = true;
    p.srs[`${JEFF[4]}>td`] = review(undefined, 'again', NOW - DAY);
    expect(poolFor(spec({ filter: 'starred' }), p)).toEqual([JEFF[3]]);
    expect(poolFor(spec({ filter: 'weak' }), p)).toEqual([JEFF[4]]);
    expect(poolFor(spec({ filter: 'new' }), p)).not.toContain(JEFF[4]);
    expect(isWeak(p, JEFF[4])).toBe(true);
  });

  it('shuffles reproducibly and mixes directions', () => {
    const a = planSession(spec({ order: 'shuffle', dir: 'mixed' }), fresh(), NOW, createRng(7));
    const b = planSession(spec({ order: 'shuffle', dir: 'mixed' }), fresh(), NOW, createRng(7));
    expect(a.items).toEqual(b.items);
    expect(new Set(a.items.map((i) => i.dir))).toEqual(new Set(['td', 'dt']));
    expect(a.items.map((i) => i.id).sort()).toEqual([...JEFF].sort());
  });

  it('always asks for the term in Type mode', () => {
    const plan = planSession(spec({ answer: 'type', dir: 'mixed' }), fresh(), NOW);
    expect(plan.items.every((i) => i.dir === 'dt')).toBe(true);
  });

  it('puts due reviews before new cards in Spaced review and honours the daily new-card limit', () => {
    const p = fresh();
    const known = review(undefined, 'good', NOW - 3 * DAY); // due 2 days ago
    p.srs[`${JEFF[5]}>td`] = known;
    p.srs[`${JEFF[6]}>td`] = review(undefined, 'easy', NOW); // due in 3 days: not shown
    p.today.fresh = 17;
    const plan = planSession(spec({ mode: 'spaced', newPerDay: 20 }), p, NOW);
    expect(plan.items[0]).toEqual({ id: JEFF[5], dir: 'td' });
    expect(plan.items.length).toBe(1 + 3);
    expect(plan.items.some((i) => i.id === JEFF[6])).toBe(false);
    expect(plan.due).toBe(1);
    expect(plan.fresh).toBe(3);
    expect(plan.newBlocked).toBe(JEFF.length - 2 - 3);
  });
});

describe('answering cards', () => {
  const start = (over: Partial<SessionSpec> = {}, p = fresh()) => {
    const s = spec(over);
    return { s: createSession(s, planSession(s, p, NOW).items, NOW), p };
  };

  it('sends a missed card back a few cards later and schedules it to relearn', () => {
    const { s, p } = start();
    const first = s.queue[0];
    const r = answerCard(s, p, 'again', NOW + 5000);
    expect(r.session.queue[REQUEUE_GAP]).toEqual(first);
    expect(r.session.queue.length).toBe(s.queue.length);
    expect(r.session.missed).toEqual([first.id]);
    expect(r.progress.srs[`${first.id}>td`].reps).toBe(0);
    expect(cardStatus(r.progress, first.id)).toBe('learning');
    expect(r.progress.stats[first.id]).toEqual({ seen: 1, missed: 1, last: NOW + 5000 });
    expect(r.progress.today.reviews).toBe(1);
    expect(r.progress.today.fresh).toBe(0); // Practice doesn't use up Spaced review's new-card allowance
    expect(r.session.activeMs).toBe(5000);
  });

  it('counts a correct practice answer as "Good" only for new or due cards', () => {
    const { s, p } = start();
    const id = s.queue[0].id;
    const r = answerCard(s, p, 'good', NOW);
    expect(r.progress.srs[`${id}>td`].interval).toBe(1);
    expect(cardStatus(r.progress, id)).toBe('known');
    expect(r.session.done).toEqual([id]);
    // Answer it again today in another session: not due, so the schedule doesn't move.
    const again = createSession(spec(), [{ id, dir: 'td' }], NOW + 1000);
    const r2 = answerCard(again, r.progress, 'good', NOW + 2000);
    expect(r2.progress.srs[`${id}>td`]).toEqual(r.progress.srs[`${id}>td`]);
    expect(r2.session.finishedAt).toBe(NOW + 2000);
  });

  it('uses all four grades in Spaced review', () => {
    const { s, p } = start({ mode: 'spaced' });
    const id = s.queue[0].id;
    const r = answerCard(s, p, 'easy', NOW);
    expect(r.progress.srs[`${id}>td`].interval).toBe(3);
    expect(r.progress.today.fresh).toBe(1);
  });

  it('tracks first-try accuracy once per card', () => {
    const { s, p } = start({ size: 2 });
    let r = answerCard(s, p, 'again', NOW); // card A missed
    r = answerCard(r.session, r.progress, 'good', NOW); // card B right
    r = answerCard(r.session, r.progress, 'good', NOW); // card A right on retry
    expect(r.session.finishedAt).toBeDefined();
    expect(firstTryCorrect(r.session)).toBe(1);
    expect(r.session.done.length).toBe(2);
  });

  it('undoes an answer completely', () => {
    const { s, p } = start();
    const r = answerCard(s, p, 'again', NOW);
    const u = undoAnswer(r.session, r.progress)!;
    expect(u.session.queue).toEqual(s.queue);
    expect(u.session.missed).toEqual([]);
    expect(u.session.answers).toBe(0);
    expect(u.progress.srs).toEqual(p.srs);
    expect(u.progress.stats).toEqual(p.stats);
    expect(u.progress.today).toEqual(p.today);
    expect(undoAnswer(u.session, u.progress)).toBeNull();
  });

  it('can drop a card and put it back', () => {
    const { s } = start();
    const item = s.queue[1];
    const dropped = dropCard(s, item.id, NOW);
    expect(dropped.queue.some((i) => i.id === item.id)).toBe(false);
    expect(dropped.total).toBe(s.total - 1);
    const back = restoreCard(dropped, item);
    expect(back.queue[0]).toEqual(item);
    expect(back.total).toBe(s.total);
  });
});

/**
 * Study sessions, as pure functions over (session, progress) so they can be
 * tested and undone. A session is a queue of cards; a card leaves the queue
 * when it's answered correctly, and a miss sends it back a few cards later.
 *
 * Practice: any cards you choose; "Know it" / "Still learning".
 * Spaced:   due reviews first, then new cards (daily limit), graded
 *           Again / Hard / Good / Easy with SM-2 scheduling.
 * Both modes feed the same schedule: a miss always counts, and a correct
 * practice answer counts as "Good" only when the card was new or due.
 */
import { useSyncExternalStore } from 'react';
import { CARD, cardsOf } from './deck';
import { type AnswerStyle, type DirPref, type Filter, type Mode, type Order, type Prefs, sessionDirs } from './prefs';
import { type Rng, shuffle } from './random';
import { type Direction, type Grade, type SrsCard, cardKey, review } from './srs';
import { type CardStat, type Progress, type Today, rollDay } from './store';
import { isNewCard, isWeak } from './status';
import { readItem, removeItem, writeItem } from './storage';

export const SESSION_KEY = 'p4cards.session';
/** A missed card comes back after this many other cards. */
export const REQUEUE_GAP = 4;
/** Time between answers counted toward study time is capped (walked away from the desk). */
export const IDLE_CAP_MS = 2 * 60_000;
const UNDO_LIMIT = 60;

export interface SessionSpec {
  mode: Mode;
  answer: AnswerStyle;
  dir: DirPref;
  filter: Filter;
  order: Order;
  /** Cards per session; 0 = all. */
  size: number;
  /** Daily new-card cap (Spaced review only). */
  newPerDay: number;
  baskets: string[];
  /** Explicit card list (a search, one basket's list, missed cards). Overrides `baskets`. */
  cardIds?: string[];
  label: string;
}

export interface Item {
  id: string;
  dir: Direction;
}

interface Snapshot {
  queue: Item[];
  done: string[];
  missed: string[];
  first: Record<string, boolean>;
  answers: number;
  activeMs: number;
  lastAt: number;
}

export interface UndoFrame extends Snapshot {
  srsKey: string;
  srsPrev: SrsCard | null;
  statId: string;
  statPrev: CardStat | null;
  todayPrev: Today;
}

export interface Session extends Snapshot {
  v: 1;
  id: string;
  spec: SessionSpec;
  /** Unique cards in the session. */
  total: number;
  startedAt: number;
  finishedAt?: number;
  undo: UndoFrame[];
}

/** Cards a spec can draw from, before scheduling: chosen cards minus hidden ones, then the filter. */
export function poolFor(spec: Pick<SessionSpec, 'baskets' | 'cardIds' | 'filter'>, p: Progress): string[] {
  const ids = (spec.cardIds ?? cardsOf(spec.baskets)).filter((id) => CARD.has(id) && !p.excluded[id]);
  switch (spec.filter) {
    case 'starred':
      return ids.filter((id) => p.starred[id]);
    case 'weak':
      return ids.filter((id) => isWeak(p, id));
    case 'new':
      return ids.filter((id) => isNewCard(p, id));
    default:
      return ids;
  }
}

function ordered(ids: string[], order: Order, rng: Rng): string[] {
  return order === 'shuffle' ? shuffle(ids, rng) : [...ids].sort((a, b) => CARD.get(a)!.index - CARD.get(b)!.index);
}

export interface Plan {
  items: Item[];
  /** Cards that matched the selection and filter. */
  pool: number;
  /** Spaced: reviews due now, and new cards still allowed today. */
  due: number;
  fresh: number;
  /** Spaced: new cards that exist but are over today's limit. */
  newBlocked: number;
}

export function planSession(spec: SessionSpec, p: Progress, now: number, rng: Rng = Math.random): Plan {
  const pool = poolFor(spec, p);
  const dirs = sessionDirs(spec);
  const pickDir = (): Direction => (dirs.length === 1 ? dirs[0] : rng() < 0.5 ? 'td' : 'dt');
  const cap = (n: number) => (spec.size > 0 ? Math.min(n, spec.size) : n);

  if (spec.mode === 'practice') {
    const ids = ordered(pool, spec.order, rng).slice(0, cap(pool.length));
    return { items: ids.map((id) => ({ id, dir: pickDir() })), pool: pool.length, due: 0, fresh: 0, newBlocked: 0 };
  }

  const due: { id: string; dir: Direction; at: number }[] = [];
  const fresh: string[] = [];
  for (const id of pool) {
    let best: { dir: Direction; at: number } | null = null;
    for (const d of dirs) {
      const c = p.srs[cardKey(id, d)];
      if (c && c.due <= now && (!best || c.due < best.at)) best = { dir: d, at: c.due };
    }
    if (best) due.push({ id, ...best });
    else if (isNewCard(p, id)) fresh.push(id);
  }
  const today = rollDay(p, now).today;
  const allowance = Math.max(0, spec.newPerDay - today.fresh);
  // Most overdue first when the session size cuts the list, then shown in the chosen order.
  due.sort((a, b) => a.at - b.at);
  const dueIds = due.slice(0, cap(due.length));
  const dueItems = (spec.order === 'shuffle' ? shuffle(dueIds, rng) : dueIds.sort((a, b) => CARD.get(a.id)!.index - CARD.get(b.id)!.index)).map(
    ({ id, dir }) => ({ id, dir }),
  );
  const room = spec.size > 0 ? Math.max(0, spec.size - dueItems.length) : Infinity;
  const newIds = ordered(fresh, spec.order, rng).slice(0, Math.min(allowance, room));
  return {
    items: [...dueItems, ...newIds.map((id) => ({ id, dir: pickDir() }))],
    pool: pool.length,
    due: due.length,
    fresh: Math.min(allowance, fresh.length),
    newBlocked: Math.max(0, fresh.length - allowance),
  };
}

export function createSession(spec: SessionSpec, items: Item[], now: number): Session {
  return {
    v: 1,
    id: `${now.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`,
    spec,
    queue: items,
    total: new Set(items.map((i) => i.id)).size,
    done: [],
    missed: [],
    first: {},
    answers: 0,
    activeMs: 0,
    lastAt: now,
    startedAt: now,
    undo: [],
  };
}

const snapshot = (s: Session): Snapshot => ({
  queue: s.queue,
  done: s.done,
  missed: s.missed,
  first: s.first,
  answers: s.answers,
  activeMs: s.activeMs,
  lastAt: s.lastAt,
});

export const isCorrect = (g: Grade) => g !== 'again';

/** Apply an answer to the current card. Returns the new session and progress. */
export function answerCard(s: Session, p0: Progress, grade: Grade, now: number): { session: Session; progress: Progress } {
  const item = s.queue[0];
  if (!item) return { session: s, progress: p0 };
  const p = rollDay(p0, now);
  const key = cardKey(item.id, item.dir);
  const prev = p.srs[key] ?? null;
  const wasNew = isNewCard(p, item.id);
  const correct = isCorrect(grade);

  let next: SrsCard | null = prev;
  if (s.spec.mode === 'spaced') next = review(prev ?? undefined, grade, now);
  else if (!correct) next = review(prev ?? undefined, 'again', now);
  else if (!prev || prev.due <= now) next = review(prev ?? undefined, grade === 'easy' ? 'easy' : 'good', now);

  const stat = p.stats[item.id] ?? { seen: 0, missed: 0, last: 0 };
  const progress: Progress = {
    ...p,
    srs: next ? { ...p.srs, [key]: next } : p.srs,
    stats: { ...p.stats, [item.id]: { seen: stat.seen + 1, missed: stat.missed + (correct ? 0 : 1), last: now } },
    // Only Spaced review's own new cards count toward its daily new-card limit; Practice is unlimited.
    today: { date: p.today.date, reviews: p.today.reviews + 1, fresh: p.today.fresh + (wasNew && s.spec.mode === 'spaced' ? 1 : 0) },
  };

  const rest = s.queue.slice(1);
  let queue = rest;
  let done = s.done;
  let missed = s.missed;
  if (correct) {
    done = [...s.done, item.id];
  } else {
    const at = Math.min(REQUEUE_GAP, rest.length);
    queue = [...rest.slice(0, at), item, ...rest.slice(at)];
    if (!missed.includes(item.id)) missed = [...missed, item.id];
  }
  const frame: UndoFrame = { ...snapshot(s), srsKey: key, srsPrev: prev, statId: item.id, statPrev: p.stats[item.id] ?? null, todayPrev: p.today };
  const session: Session = {
    ...s,
    queue,
    done,
    missed,
    first: item.id in s.first ? s.first : { ...s.first, [item.id]: correct },
    answers: s.answers + 1,
    activeMs: s.activeMs + Math.min(Math.max(0, now - s.lastAt), IDLE_CAP_MS),
    lastAt: now,
    finishedAt: queue.length === 0 ? now : undefined,
    undo: [...s.undo.slice(-(UNDO_LIMIT - 1)), frame],
  };
  return { session, progress };
}

/** Undo the last answer: restores the queue and that card's schedule, stats and today's counts. */
export function undoAnswer(s: Session, p: Progress): { session: Session; progress: Progress } | null {
  const frame = s.undo[s.undo.length - 1];
  if (!frame) return null;
  const { srsKey, srsPrev, statId, statPrev, todayPrev, ...snap } = frame;
  const srs = { ...p.srs };
  if (srsPrev) srs[srsKey] = srsPrev;
  else delete srs[srsKey];
  const stats = { ...p.stats };
  if (statPrev) stats[statId] = statPrev;
  else delete stats[statId];
  return {
    session: { ...s, ...snap, finishedAt: undefined, undo: s.undo.slice(0, -1) },
    progress: { ...p, srs, stats, today: todayPrev },
  };
}

/** Take a card out of the session (e.g. it was just hidden). */
export function dropCard(s: Session, id: string, now: number): Session {
  if (!s.queue.some((i) => i.id === id)) return s;
  const queue = s.queue.filter((i) => i.id !== id);
  return {
    ...s,
    queue,
    total: s.total - 1,
    missed: s.missed.filter((m) => m !== id),
    // Undo frames that point at the dropped card would bring it back; keep it simple and clear them.
    undo: s.undo.filter((f) => f.statId !== id),
    finishedAt: queue.length === 0 ? now : undefined,
  };
}

/** Put a dropped card back at the front of the queue. */
export function restoreCard(s: Session, item: Item): Session {
  if (s.queue.some((i) => i.id === item.id)) return s;
  return { ...s, queue: [item, ...s.queue], total: s.total + 1, finishedAt: undefined };
}

export function firstTryCorrect(s: Session): number {
  return Object.values(s.first).filter(Boolean).length;
}

// ---------- persistence ----------

function loadSession(): Session | null {
  try {
    const s = JSON.parse(readItem(SESSION_KEY) || 'null') as Session | null;
    if (!s || s.v !== 1 || !Array.isArray(s.queue) || !s.spec) return null;
    // Drop cards that no longer exist in the deck.
    const queue = s.queue.filter((i) => CARD.has(i.id) && (i.dir === 'td' || i.dir === 'dt'));
    return { ...s, queue, undo: Array.isArray(s.undo) ? s.undo : [] };
  } catch {
    return null;
  }
}

let current: Session | null = loadSession();
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function getSession(): Session | null {
  return current;
}

export function setSession(s: Session | null): void {
  current = s;
  if (s) writeItem(SESSION_KEY, JSON.stringify(s));
  else removeItem(SESSION_KEY);
  for (const l of listeners) l();
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession, getSession);
}

/** A saved session that still has cards left. */
export function isResumable(s: Session | null): s is Session {
  return !!s && !s.finishedAt && s.queue.length > 0;
}


/** Build a session spec from the saved study settings. */
export function specFromPrefs(
  prefs: Pick<Prefs, 'mode' | 'answer' | 'dir' | 'filter' | 'order' | 'size' | 'newPerDay'>,
  source: { baskets: string[]; cardIds?: string[]; label: string },
): SessionSpec {
  return {
    mode: prefs.mode,
    answer: prefs.answer,
    dir: prefs.dir,
    filter: prefs.filter,
    order: prefs.order,
    size: prefs.size,
    newPerDay: prefs.newPerDay,
    baskets: source.baskets,
    cardIds: source.cardIds,
    label: source.label,
  };
}

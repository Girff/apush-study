/**
 * Saved progress: spaced-repetition state, per-card stats, stars, hidden
 * cards, the basket selection and today's counts. One JSON blob in
 * localStorage (with an in-memory fallback), read through
 * useSyncExternalStore so every view stays in sync, including across tabs.
 */
import { useSyncExternalStore } from 'react';
import { ALL_BASKET_IDS, BASKET } from './deck';
import type { SrsCard } from './srs';
import { readItem, writeItem } from './storage';

export const PROGRESS_KEY = 'p4cards.v1';

export interface CardStat {
  /** Answers given. */
  seen: number;
  /** Answers marked wrong ("Again" / "Still learning"). */
  missed: number;
  /** Epoch ms of the last answer. */
  last: number;
}

export interface Today {
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** Answers given today. */
  reviews: number;
  /** New cards Spaced review introduced today (its daily new-card limit). */
  fresh: number;
}

export interface Progress {
  v: 1;
  /** Keyed by `${cardId}>${direction}`. */
  srs: Record<string, SrsCard>;
  stats: Record<string, CardStat>;
  starred: Record<string, true>;
  /** Cards hidden from study. */
  excluded: Record<string, true>;
  /** Basket ids chosen for the next session. */
  selected: string[];
  today: Today;
}

export function localDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function emptyProgress(now = Date.now()): Progress {
  return { v: 1, srs: {}, stats: {}, starred: {}, excluded: {}, selected: [...ALL_BASKET_IDS], today: { date: localDate(now), reviews: 0, fresh: 0 } };
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

function cleanSrs(x: unknown): SrsCard | null {
  if (!isObj(x)) return null;
  const { ef, interval, reps, lapses, due, last } = x;
  if (![ef, interval, reps, lapses, due, last].every(isNum)) return null;
  return {
    ef: Math.min(5, Math.max(1.3, ef as number)),
    interval: Math.max(0, Math.round(interval as number)),
    reps: Math.max(0, Math.round(reps as number)),
    lapses: Math.max(0, Math.round(lapses as number)),
    due: due as number,
    last: last as number,
  };
}

function cleanFlags(x: unknown): Record<string, true> {
  const out: Record<string, true> = {};
  if (Array.isArray(x)) for (const id of x) if (typeof id === 'string') out[id] = true;
  if (isObj(x)) for (const [id, v] of Object.entries(x)) if (v) out[id] = true;
  return out;
}

/** Accept anything (old saves, hand-edited or imported files) and return valid progress. */
export function sanitize(input: unknown, now = Date.now()): Progress {
  const base = emptyProgress(now);
  if (!isObj(input)) return base;
  const srs: Record<string, SrsCard> = {};
  if (isObj(input.srs)) {
    for (const [k, v] of Object.entries(input.srs)) {
      const c = cleanSrs(v);
      if (c && /^[a-z0-9-]+>(td|dt)$/.test(k)) srs[k] = c;
    }
  }
  const stats: Record<string, CardStat> = {};
  if (isObj(input.stats)) {
    for (const [k, v] of Object.entries(input.stats)) {
      if (isObj(v) && isNum(v.seen) && isNum(v.missed) && isNum(v.last)) {
        stats[k] = { seen: Math.max(0, v.seen), missed: Math.max(0, Math.min(v.seen, v.missed)), last: v.last };
      }
    }
  }
  const selected = Array.isArray(input.selected) ? input.selected.filter((id): id is string => typeof id === 'string' && BASKET.has(id)) : base.selected;
  let today = base.today;
  if (isObj(input.today) && input.today.date === base.today.date && isNum(input.today.reviews) && isNum(input.today.fresh)) {
    today = { date: base.today.date, reviews: Math.max(0, input.today.reviews), fresh: Math.max(0, input.today.fresh) };
  }
  return { v: 1, srs, stats, starred: cleanFlags(input.starred), excluded: cleanFlags(input.excluded), selected, today };
}

function load(): Progress {
  const text = readItem(PROGRESS_KEY);
  if (!text) return emptyProgress();
  try {
    return sanitize(JSON.parse(text));
  } catch {
    return emptyProgress();
  }
}

let state: Progress = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProgress(): Progress {
  return state;
}

/** Replace progress (already-built object), save it and notify subscribers. */
export function commitProgress(next: Progress): void {
  state = next;
  writeItem(PROGRESS_KEY, JSON.stringify(next));
  emit();
}

export function updateProgress(fn: (p: Progress) => Progress): void {
  commitProgress(fn(rollDay(state)));
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}

/** Reset today's counters when the date changes. */
export function rollDay(p: Progress, now = Date.now()): Progress {
  const date = localDate(now);
  return p.today.date === date ? p : { ...p, today: { date, reviews: 0, fresh: 0 } };
}

// Keep tabs in sync: another tab saved progress.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== PROGRESS_KEY || e.newValue == null) return;
    try {
      state = sanitize(JSON.parse(e.newValue));
      emit();
    } catch {
      /* ignore malformed writes */
    }
  });
}

// ---------- actions ----------

function setFlag(map: Record<string, true>, ids: string[], on: boolean): Record<string, true> {
  const next = { ...map };
  for (const id of ids) {
    if (on) next[id] = true;
    else delete next[id];
  }
  return next;
}

export function setStarred(ids: string[], on: boolean): void {
  updateProgress((p) => ({ ...p, starred: setFlag(p.starred, ids, on) }));
}

export function toggleStar(id: string): void {
  setStarred([id], !state.starred[id]);
}

export function setExcluded(ids: string[], on: boolean): void {
  updateProgress((p) => ({ ...p, excluded: setFlag(p.excluded, ids, on) }));
}

export function toggleExcluded(id: string): void {
  setExcluded([id], !state.excluded[id]);
}

export function setSelected(basketIds: string[]): void {
  const wanted = new Set(basketIds);
  updateProgress((p) => ({ ...p, selected: ALL_BASKET_IDS.filter((id) => wanted.has(id)) }));
}

export function toggleBasket(id: string): void {
  const on = state.selected.includes(id);
  setSelected(on ? state.selected.filter((b) => b !== id) : [...state.selected, id]);
}

export function resetProgress(): void {
  commitProgress({ ...emptyProgress(), selected: state.selected });
}

/** Merge imported progress into the current one, keeping the more recent review of each card. */
export function mergeProgress(current: Progress, incoming: Progress): Progress {
  const srs = { ...current.srs };
  for (const [k, v] of Object.entries(incoming.srs)) if (!srs[k] || v.last > srs[k].last) srs[k] = v;
  const stats = { ...current.stats };
  for (const [k, v] of Object.entries(incoming.stats)) if (!stats[k] || v.last > stats[k].last) stats[k] = v;
  return {
    ...current,
    srs,
    stats,
    starred: { ...current.starred, ...incoming.starred },
    excluded: { ...current.excluded, ...incoming.excluded },
  };
}

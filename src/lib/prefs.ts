/**
 * Display and study preferences, saved separately from progress so a reset
 * never touches them. index.html reads the display part before first paint.
 */
import { useSyncExternalStore } from 'react';
import type { Direction } from './srs';
import { readItem, writeItem } from './storage';

export const PREFS_KEY = 'p4cards.prefs';

export type Mode = 'practice' | 'spaced';
export type AnswerStyle = 'flip' | 'type';
export type DirPref = Direction | 'mixed';
export type Filter = 'all' | 'starred' | 'weak' | 'new';
export type Order = 'shuffle' | 'deck';

export interface Prefs {
  theme: 'system' | 'light' | 'dark';
  motion: 'system' | 'reduce' | 'full';
  text: 'sm' | 'md' | 'lg';
  showYawp: boolean;
  wakeLock: boolean;
  /** Daily cap on brand-new cards in Spaced review. */
  newPerDay: number;
  mode: Mode;
  answer: AnswerStyle;
  dir: DirPref;
  filter: Filter;
  order: Order;
  /** Cards per session; 0 means all. */
  size: number;
}

export const DEFAULT_PREFS: Prefs = {
  theme: 'system',
  motion: 'system',
  text: 'md',
  showYawp: false,
  wakeLock: true,
  newPerDay: 20,
  mode: 'practice',
  answer: 'flip',
  dir: 'td',
  filter: 'all',
  order: 'shuffle',
  size: 20,
};

export const SIZES = [10, 20, 50, 0];

function pickOne<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

export function sanitizePrefs(input: unknown): Prefs {
  const p = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const d = DEFAULT_PREFS;
  const n = Number(p.newPerDay);
  const size = Number(p.size);
  return {
    theme: pickOne(p.theme, ['system', 'light', 'dark'] as const, d.theme),
    motion: pickOne(p.motion, ['system', 'reduce', 'full'] as const, d.motion),
    text: pickOne(p.text, ['sm', 'md', 'lg'] as const, d.text),
    showYawp: typeof p.showYawp === 'boolean' ? p.showYawp : d.showYawp,
    wakeLock: typeof p.wakeLock === 'boolean' ? p.wakeLock : d.wakeLock,
    newPerDay: Number.isFinite(n) ? Math.max(0, Math.min(300, Math.round(n))) : d.newPerDay,
    mode: pickOne(p.mode, ['practice', 'spaced'] as const, d.mode),
    answer: pickOne(p.answer, ['flip', 'type'] as const, d.answer),
    dir: pickOne(p.dir, ['td', 'dt', 'mixed'] as const, d.dir),
    filter: pickOne(p.filter, ['all', 'starred', 'weak', 'new'] as const, d.filter),
    order: pickOne(p.order, ['shuffle', 'deck'] as const, d.order),
    size: SIZES.includes(size) ? size : d.size,
  };
}

function load(): Prefs {
  try {
    return sanitizePrefs(JSON.parse(readItem(PREFS_KEY) || '{}'));
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

let prefs: Prefs = load();
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function getPrefs(): Prefs {
  return prefs;
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getPrefs, getPrefs);
}

export function setPrefs(patch: Partial<Prefs>): void {
  prefs = sanitizePrefs({ ...prefs, ...patch });
  writeItem(PREFS_KEY, JSON.stringify(prefs));
  applyPrefs();
  for (const l of listeners) l();
}

const media = (q: string) => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(q).matches;

/** Write theme, motion and text size onto <html>. Safe to call repeatedly. */
export function applyPrefs(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const dark = prefs.theme === 'dark' || (prefs.theme === 'system' && media('(prefers-color-scheme: dark)'));
  const calm = prefs.motion === 'reduce' || (prefs.motion === 'system' && media('(prefers-reduced-motion: reduce)'));
  root.setAttribute('data-theme', dark ? 'lamplight' : 'parchment');
  root.setAttribute('data-motion', calm ? 'reduce' : 'full');
  root.setAttribute('data-text', prefs.text);
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', dark ? '#17130f' : '#f6f1e7');
}

export function isCalm(): boolean {
  return typeof document !== 'undefined' && document.documentElement.getAttribute('data-motion') === 'reduce';
}

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyPrefs);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', applyPrefs);
}

/** Directions a session will use. Type mode always shows the definition and asks for the term. */
export function sessionDirs(p: Pick<Prefs, 'answer' | 'dir'>): Direction[] {
  if (p.answer === 'type') return ['dt'];
  return p.dir === 'mixed' ? ['td', 'dt'] : [p.dir];
}

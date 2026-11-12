/**
 * Display preferences (theme + motion). Stored under a site-wide key so the
 * inline script in index.html can apply the theme before first paint.
 */
import { useSyncExternalStore } from 'react';
import { readItem, writeItem } from './storage';

export type ThemePref = 'system' | 'parchment' | 'lamplight';
export type MotionPref = 'system' | 'reduce' | 'full';

export interface Prefs {
  theme: ThemePref;
  motion: MotionPref;
}

export const PREFS_KEY = 'exhibit.prefs';

function loadPrefs(): Prefs {
  try {
    const raw = JSON.parse(readItem(PREFS_KEY) ?? '{}');
    return {
      theme: ['system', 'parchment', 'lamplight'].includes(raw.theme) ? raw.theme : 'system',
      motion: ['system', 'reduce', 'full'].includes(raw.motion) ? raw.motion : 'system',
    };
  } catch {
    return { theme: 'system', motion: 'system' };
  }
}

let prefs = loadPrefs();
const listeners = new Set<() => void>();

const darkQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const motionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export function resolvedTheme(p: Prefs = prefs): 'parchment' | 'lamplight' {
  if (p.theme === 'system') return darkQuery?.matches ? 'lamplight' : 'parchment';
  return p.theme;
}

export function resolvedReduceMotion(p: Prefs = prefs): boolean {
  if (p.motion === 'system') return !!motionQuery?.matches;
  return p.motion === 'reduce';
}

export function applyPrefs(p: Prefs = prefs) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme(p);
  root.dataset.motion = resolvedReduceMotion(p) ? 'reduce' : 'full';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolvedTheme(p) === 'lamplight' ? '#17130f' : '#f6f1e7');
}

function emit() {
  applyPrefs();
  listeners.forEach((l) => l());
}

darkQuery?.addEventListener('change', emit);
motionQuery?.addEventListener('change', emit);

export function setPrefs(patch: Partial<Prefs>) {
  prefs = { ...prefs, ...patch };
  writeItem(PREFS_KEY, JSON.stringify(prefs));
  emit();
}

export function getPrefs(): Prefs {
  return prefs;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getPrefs, getPrefs);
}

/** True when animations should be calm/static. Re-renders on change. */
export function useReducedMotion(): boolean {
  usePrefs();
  useSyncExternalStore(
    (l) => {
      motionQuery?.addEventListener('change', l);
      return () => motionQuery?.removeEventListener('change', l);
    },
    () => !!motionQuery?.matches,
    () => false,
  );
  return resolvedReduceMotion();
}

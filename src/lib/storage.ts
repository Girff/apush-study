/**
 * localStorage wrapper that never throws. Private browsing, disabled storage,
 * quota errors and sandboxed iframes all fall back to an in-memory copy, and
 * `storageStatus()` tells the UI so it can warn the student.
 */
type Status = 'ok' | 'unavailable' | 'error';

let status: Status = 'ok';
const memory = new Map<string, string>();

function getStore(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const probe = '__p4_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

let store: Storage | null | undefined;
function ensureStore(): Storage | null {
  if (store === undefined) {
    store = getStore();
    if (!store) status = 'unavailable';
  }
  return store;
}

export function readItem(key: string): string | null {
  const s = ensureStore();
  if (!s) return memory.get(key) ?? null;
  try {
    return s.getItem(key);
  } catch {
    status = 'error';
    return memory.get(key) ?? null;
  }
}

export function writeItem(key: string, value: string): boolean {
  memory.set(key, value);
  const s = ensureStore();
  if (!s) return false;
  try {
    s.setItem(key, value);
    if (status === 'error') status = 'ok';
    return true;
  } catch {
    status = 'error';
    return false;
  }
}

export function removeItem(key: string): void {
  memory.delete(key);
  const s = ensureStore();
  if (!s) return;
  try {
    s.removeItem(key);
  } catch {
    status = 'error';
  }
}

export function storageStatus(): Status {
  ensureStore();
  return status;
}

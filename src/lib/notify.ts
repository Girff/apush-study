/** Tiny toast queue (badges, saves, errors). Not persisted. */
import { useSyncExternalStore } from 'react';

export interface Toast {
  id: number;
  kind: 'badge' | 'info' | 'error';
  title: string;
  body?: string;
  /** Solemn toasts render plainly, with no stamp animation. */
  solemn?: boolean;
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function notify(t: Omit<Toast, 'id'>) {
  const toast = { ...t, id: nextId++ };
  toasts = [...toasts, toast].slice(-4);
  emit();
  setTimeout(() => dismiss(toast.id), t.kind === 'badge' ? 6000 : 4000);
}

export function dismiss(id: number) {
  const next = toasts.filter((t) => t.id !== id);
  if (next.length !== toasts.length) {
    toasts = next;
    emit();
  }
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => toasts,
    () => toasts,
  );
}

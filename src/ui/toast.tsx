import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

let current: Toast | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(message: string, action?: Toast['action'], ms = action ? 6000 : 3200): void {
  current = { id: ++seq, message, action };
  clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    emit();
  }, ms);
  emit();
}

/** Re-home the toast after a dialog opens or closes (it renders inside the open modal). */
export function refreshToaster(): void {
  if (current) {
    current = { ...current };
    emit();
  }
}

function dismiss() {
  clearTimeout(timer);
  current = null;
  emit();
}

export function Toaster() {
  const t = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
  // A modal <dialog> makes the rest of the page inert and covers it, so show toasts inside the open dialog.
  const host = (typeof document !== 'undefined' && document.querySelector('dialog[open]')) || document.body;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div role="status" aria-live="polite" className="w-full max-w-md">
        {t && (
          <div key={t.id} className="toast pointer-events-auto flex items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-paper shadow-paper">
            <p className="flex-1">{t.message}</p>
            {t.action && (
              <button
                type="button"
                className="rounded-md px-2 py-1 font-semibold text-brass underline-offset-2 hover:underline"
                onClick={() => {
                  t.action!.run();
                  dismiss();
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    host,
  );
}

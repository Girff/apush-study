import { type ReactNode, useEffect, useId, useRef } from 'react';
import { Icon } from './Icon';
import { refreshToaster } from './toast';

/**
 * Native <dialog> as a modal: focus is trapped and Esc closes it for free.
 * On phones it becomes a bottom sheet (see .dlg in index.css).
 */
export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide = false,
  actions,
  scrollFocus = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /** Extra header buttons, before the close button. */
  actions?: ReactNode;
  /** Make the body focusable, so keyboard users can scroll a dialog that has nothing else to focus. */
  scrollFocus?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const returnTo = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d || !open) return;
    returnTo.current = document.activeElement;
    if (!d.open) d.showModal();
    refreshToaster();
    return () => {
      if (d.open) d.close();
      refreshToaster();
      const back = returnTo.current;
      if (back instanceof HTMLElement && back.isConnected) back.focus();
    };
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onCloseRef.current();
    };
    d.addEventListener('cancel', onCancel);
    return () => d.removeEventListener('cancel', onCancel);
  }, []);

  return (
    <dialog
      ref={ref}
      className={`dlg ${wide ? 'dlg-wide' : ''}`}
      aria-labelledby={titleId}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <>
          <div className="flex items-start gap-3 border-b border-rule px-5 pb-3 pt-4">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-xl font-semibold sm:text-2xl">
                {title}
              </h2>
              {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
            </div>
            {actions}
            <button type="button" className="btn btn-ghost btn-icon btn-sm -mr-2" onClick={onClose}>
              <Icon name="x" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="dlg-body flex-1 px-5 py-4" tabIndex={scrollFocus ? 0 : undefined}>
            {children}
          </div>
          {footer && <div className="border-t border-rule px-5 py-3">{footer}</div>}
        </>
      )}
    </dialog>
  );
}

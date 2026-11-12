/**
 * ESPN chip ("Extremely Specific Proper Noun"). Hover (mouse) or click/tap
 * opens a popover with the definition and Yawp citation, straight from the
 * unit JSON. Escape or an outside click closes it.
 */
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { type ReactNode, useId, useState } from 'react';
import { Link } from 'react-router';
import { themeOfTopic, topicById } from '../lib/data';
import { STATUS_LABEL, masteryStatus } from '../lib/mastery';
import { useProgress } from '../lib/progress';
import type { Term } from '../lib/types';

interface TermChipProps {
  term: Term;
  children?: ReactNode;
  className?: string;
}

export function TermChip({ term, children, className = 'espn' }: TermChipProps) {
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, { mouseOnly: true, delay: { open: 180, close: 120 }, handleClose: safePolygon() });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss, role]);

  return (
    <>
      <button type="button" ref={refs.setReference} className={className} {...getReferenceProps()}>
        {children ?? term.term}
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              aria-labelledby={headingId}
              className="z-50 w-[min(22rem,calc(100vw-1.5rem))]"
              {...getFloatingProps()}
            >
              <TermCard term={term} headingId={headingId} onClose={() => setOpen(false)} />
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

export function TermCard({ term, headingId, onClose }: { term: Term; headingId?: string; onClose?: () => void }) {
  const progress = useProgress();
  const topic = topicById.get(term.topicId);
  const theme = themeOfTopic(term.topicId);
  const status = masteryStatus(term.id, progress);
  return (
    <div className="panel relative overflow-hidden p-4 text-left text-ink" style={{ borderTop: `4px solid var(${theme.colorVar})` }}>
      <div className="flex items-start justify-between gap-3">
        <h3 id={headingId} className="font-display text-lg font-semibold leading-snug">
          {term.term}
        </h3>
        {onClose && (
          <button type="button" onClick={onClose} className="btn-ghost -mr-2 -mt-1 rounded p-1.5 text-muted" aria-label="Close definition">
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">{term.def}</p>
      <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <div className="flex gap-1">
          <dt className="font-semibold uppercase tracking-wider">Yawp</dt>
          <dd>{term.yawp}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-semibold uppercase tracking-wider">Topic</dt>
          <dd>
            {topic?.id} {topic?.title}
          </dd>
        </div>
        <div className="flex gap-1">
          <dt className="sr-only">Your mastery</dt>
          <dd>
            <StatusPill status={status} />
          </dd>
        </div>
      </dl>
      <Link
        to={`/glossary?term=${encodeURIComponent(term.id)}`}
        className="mt-3 inline-flex text-sm font-semibold text-teal underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        Open in glossary →
      </Link>
    </div>
  );
}

export function StatusPill({ status }: { status: ReturnType<typeof masteryStatus> }) {
  const styles: Record<typeof status, string> = {
    new: 'border-rule-strong text-muted',
    learning: 'border-brass text-brass-ink',
    familiar: 'border-teal text-teal',
    mastered: 'border-oxblood text-oxblood',
  };
  const marks: Record<typeof status, string> = { new: '○', learning: '◔', familiar: '◑', mastered: '●' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold ${styles[status]}`}>
      <span aria-hidden="true">{marks[status]}</span>
      {STATUS_LABEL[status]}
    </span>
  );
}

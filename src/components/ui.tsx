/** Small shared presentational pieces. */
import { type ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { setLastVisited } from '../lib/progress';
import { useReducedMotion } from '../lib/prefs';
import type { MotifId } from '../lib/types';
import { Motif } from './Motif';

export function usePageMeta(title: string, continueLabel?: string) {
  const loc = useLocation();
  useEffect(() => {
    document.title = `${title} · Period 4`;
  }, [title]);
  useEffect(() => {
    if (continueLabel) setLastVisited(loc.pathname + loc.search, continueLabel);
  }, [loc.pathname, loc.search, continueLabel]);
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.6em] items-center justify-center rounded border border-rule-strong bg-card px-1.5 py-0.5 font-sans text-[0.75em] font-semibold text-ink-soft shadow-[0_1px_0_var(--rule-strong)]">
      {children}
    </kbd>
  );
}

/** Text that "bleeds" in like wet ink when scrolled into view. */
export function InkReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: 'blur(5px)', y: 8 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.75, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Moves its children gently against the scroll direction. */
export function Parallax({ children, strength = 30, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

export function PageHeader({
  kicker,
  title,
  lede,
  motif,
  children,
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  motif?: MotifId;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden pb-6 pt-8 sm:pt-12">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="kicker">{kicker}</p>
          <h1 className="mt-2 text-[clamp(2rem,1.4rem+3vw,3.4rem)] font-semibold">{title}</h1>
          {lede && <div className="lede mt-3">{lede}</div>}
        </div>
        {motif && (
          <Parallax strength={18} className="hidden shrink-0 text-brass sm:block">
            <Motif id={motif} className="h-28 w-28 lg:h-36 lg:w-36" />
          </Parallax>
        )}
      </div>
      {children}
      <div className="rule-double mt-6" />
    </header>
  );
}

export function SectionTitle({ kicker, children, id }: { kicker?: string; children: ReactNode; id?: string }) {
  return (
    <div className="mb-4">
      {kicker && <p className="kicker">{kicker}</p>}
      <h2 id={id} className="mt-1 text-2xl font-semibold sm:text-[1.7rem]">
        {children}
      </h2>
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="rounded border border-dashed border-rule-strong px-4 py-6 text-center text-sm text-muted">{children}</p>;
}

export function ProgressBar({ value, label, className = '' }: { value: number; label: string; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full ${className}`}
      style={{ background: 'var(--seq-track)' }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: 'var(--viz-line)' }} />
    </div>
  );
}

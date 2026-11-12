import { AnimatePresence, LazyMotion, MotionConfig, m } from 'framer-motion';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { UNIT } from '../unit/config';
import { dismiss, useToasts } from '../lib/notify';
import { resolvedTheme, setPrefs, usePrefs, useReducedMotion } from '../lib/prefs';
import { currentStreak, useProgress } from '../lib/progress';
import { storageStatus } from '../lib/storage';
import { InkFilters } from './Motif';

const loadMotionFeatures = () => import('../lib/motionFeatures').then((r) => r.default);

const NAV = [
  { to: '/', label: 'Exhibit Hall', end: true },
  { to: '/story', label: 'Story' },
  { to: '/map', label: 'Map Room' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/web', label: 'Causation' },
  { to: '/arcade', label: 'Arcade' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/progress', label: 'Progress' },
];

export function Layout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const prevPath = useRef(location.pathname);
  const reduce = useReducedMotion();

  // Move focus to the page on client-side navigation so screen readers
  // announce the new page instead of staying on the clicked link.
  // (Compared by path, so it never fires on first load.)
  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <LazyMotion features={loadMotionFeatures}>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only-focusable fixed left-3 top-3 z-[60] rounded bg-ink px-4 py-2 font-semibold text-paper"
      >
        Skip to content
      </a>
      <InkFilters />
      <StorageBanner />
      <SiteHeader />
      <main id="main" ref={mainRef} tabIndex={-1} className="min-h-[60vh] outline-none">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <Toaster />
      <ScrollRestoration />
      </LazyMotion>
    </MotionConfig>
  );
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="no-print relative z-30 border-b border-rule bg-paper/85 backdrop-blur-[2px]">
      <div className="wrap flex items-center justify-between gap-3 py-3">
        <Link to="/" className="group flex items-baseline gap-3 rounded">
          <span className="font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">{UNIT.title}</span>
          <span className="hidden text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted sm:inline">
            APUSH · {UNIT.subtitle}
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <HeaderStats />
          <ThemeToggle />
          <MotionToggle />
          <button
            type="button"
            className="btn btn-secondary btn-sm lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            Menu
          </button>
        </div>
      </div>
      <nav aria-label="Main" className="wrap hidden pb-2 lg:block">
        <ul className="flex flex-wrap gap-1">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `inline-flex min-h-10 items-center rounded px-3 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-sunk hover:text-ink'
                  }`
                }
              >
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <nav id="mobile-nav" aria-label="Main" hidden={!menuOpen} className="wrap border-t border-rule pb-3 pt-2 lg:hidden">
        <ul className="grid grid-cols-2 gap-1">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex min-h-11 items-center rounded px-3 font-semibold ${isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-sunk'}`
                }
              >
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function HeaderStats() {
  const p = useProgress();
  const streak = currentStreak(p);
  return (
    <Link to="/progress" className="mr-1 hidden items-center gap-2 rounded px-2 py-1 text-xs font-semibold text-ink-soft hover:bg-sunk sm:flex">
      <span className="tabular">{p.xp.toLocaleString()} XP</span>
      <span aria-hidden="true" className="text-rule-strong">
        |
      </span>
      <span className="tabular">
        {streak} day{streak === 1 ? '' : 's'}
      </span>
      <span className="sr-only"> streak. Open progress.</span>
    </Link>
  );
}

function ThemeToggle() {
  const prefs = usePrefs();
  const dark = resolvedTheme(prefs) === 'lamplight';
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm px-2"
      aria-pressed={dark}
      onClick={() => setPrefs({ theme: dark ? 'parchment' : 'lamplight' })}
      title={dark ? 'Switch to parchment (light) mode' : 'Switch to lamplight (dark) mode'}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {dark ? (
          <>
            <path d="M9 3h6l-1 3h-4z" />
            <path d="M8 6h8l1 9a5 5 0 0 1-10 0z" />
            <path d="M12 10c-1 1.5-1 3 0 4.5 1-1.5 1-3 0-4.5z" fill="currentColor" />
            <path d="M10 21h4" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
      <span className="sr-only">Lamplight (dark) mode</span>
    </button>
  );
}

function MotionToggle() {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm px-2"
      aria-pressed={reduce}
      onClick={() => setPrefs({ motion: reduce ? 'full' : 'reduce' })}
      title={reduce ? 'Turn animations back on' : 'Calm motion: turn off animations'}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        {reduce ? <path d="M4 12h16" /> : <path d="M3 12c3-6 6 6 9 0s6 6 9 0" />}
      </svg>
      <span className="sr-only">Calm motion</span>
    </button>
  );
}

function StorageBanner() {
  const [status] = useState(storageStatus);
  if (status === 'ok') return null;
  return (
    <div role="status" className="border-b border-rule bg-sunk px-4 py-2 text-center text-sm text-ink">
      This browser is blocking storage, so your progress lasts only until you close the tab. Use{' '}
      <Link to="/progress" className="font-semibold underline">
        Export
      </Link>{' '}
      on the Progress page to keep a copy.
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="no-print relative mt-20 border-t-[3px] border-double border-rule-strong">
      <div className="wrap grid gap-4 py-8 text-sm text-muted sm:grid-cols-[2fr_1fr]">
        <p>
          Terms, definitions and citations come from the unit file for {UNIT.course}, keyed to{' '}
          <a className="font-semibold text-teal underline underline-offset-2" href={UNIT.sourceUrl} target="_blank" rel="noreferrer">
            {UNIT.source}
          </a>
          . All illustrations are original. Progress is saved only in this browser.
        </p>
        <p className="sm:text-right">
          <Link to="/progress" className="underline underline-offset-2">
            Settings &amp; export
          </Link>
        </p>
      </div>
    </footer>
  );
}

export function RouteFallback() {
  return (
    <div className="wrap min-h-screen py-24 text-center" role="status">
      <p className="font-display text-xl italic text-muted">Setting the type…</p>
    </div>
  );
}

function Toaster() {
  const toasts = useToasts();
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[70] flex flex-col items-center gap-2 px-3 sm:items-end sm:pr-5" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <m.div
            key={t.id}
            layout={!reduce}
            initial={reduce || t.solemn ? { opacity: 0 } : { opacity: 0, scale: 1.35, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={t.solemn ? { duration: 0.2 } : { type: 'spring', stiffness: 420, damping: 22 }}
            className="panel pointer-events-auto flex w-full max-w-sm items-start gap-3 p-3"
          >
            {t.kind === 'badge' && !t.solemn && <span className="stamp mt-0.5 shrink-0">Badge</span>}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">
                {t.kind === 'badge' ? (t.solemn ? 'Badge earned: ' : 'New badge: ') : ''}
                {t.title}
              </p>
              {t.body && <p className="text-sm text-muted">{t.body}</p>}
            </div>
            <button type="button" className="btn-ghost rounded p-1 text-muted" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

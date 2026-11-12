import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MasteryRing } from '../../components/MasteryRing';
import { Fleuron, Motif } from '../../components/Motif';
import { usePageMeta } from '../../components/ui';
import { terms, topicsInTheme } from '../../lib/data';
import { deckStats } from '../../lib/deck';
import { overallMastery, statusCounts } from '../../lib/mastery';
import { useReducedMotion } from '../../lib/prefs';
import { useProgress } from '../../lib/progress';
import type { MotifId, ThemeId } from '../../lib/types';
import { THEMES, UNIT } from '../../unit/config';
import { TimelineRibbon } from './TimelineRibbon';

const DOOR_MOTIF: Record<string, MotifId> = { politics: 'ballot', economy: 'canal', culture: 'tent' };

export default function ExhibitHall() {
  usePageMeta('Exhibit Hall');
  const progress = useProgress();
  const mastery = useMemo(() => overallMastery(progress), [progress]);
  const counts = useMemo(() => statusCounts(progress), [progress]);
  const due = useMemo(
    () =>
      deckStats(
        progress,
        [...new Set(terms.map((t) => t.topicId))],
        'both',
      ).due,
    [progress],
  );

  return (
    <div>
      {/* Hero */}
      <section className="wrap grid gap-10 pb-10 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <p className="kicker">{UNIT.course} · {UNIT.source}</p>
          <h1 className="mt-3 font-display text-[clamp(3.2rem,2rem+6vw,6.5rem)] font-bold leading-[0.95] tracking-tight">
            Period 4
            <span className="mt-2 block text-[0.42em] font-semibold tracking-normal text-ink-soft">The young republic remade, 1800–1848</span>
          </h1>
          <p className="lede mt-5">
            Parties and presidents, canals and mills, revivals and reformers, and the slavery and Native removal that ran through all of it. Walk
            the exhibit, then practice until all {terms.length} terms stick.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/story/4.1" className="btn btn-primary">
              Begin with the Prologue
            </Link>
            <Link to="/arcade" className="btn btn-secondary">
              Go to the Study Arcade
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <ContinueCard due={due} />
          <div className="panel flex items-center gap-5 p-5">
            <MasteryRing value={mastery} size={112} label="Overall mastery" />
            <dl className="grid gap-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted">Mastered</dt>
                <dd className="font-semibold tabular">{counts.mastered}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">Familiar</dt>
                <dd className="font-semibold tabular">{counts.familiar}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">Learning</dt>
                <dd className="font-semibold tabular">{counts.learning}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">Not yet studied</dt>
                <dd className="font-semibold tabular">{counts.new}</dd>
              </div>
              <Link to="/progress" className="mt-1 font-semibold text-teal underline underline-offset-2">
                Progress details
              </Link>
            </dl>
          </div>
        </div>
      </section>

      <TimelineRibbon />

      {/* Theme doors */}
      <section className="wrap mt-16" aria-labelledby="doors-title">
        <p className="kicker text-center">Three galleries</p>
        <h2 id="doors-title" className="mt-1 text-center text-[clamp(1.8rem,1.4rem+1.6vw,2.6rem)] font-semibold">
          Choose a door
        </h2>
        <Fleuron className="mx-auto mt-3 h-5 w-28 text-brass" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {THEMES.filter((t) => t.id !== 'prologue').map((t) => (
            <Door key={t.id} id={t.id} label={t.label} blurb={t.blurb} colorVar={t.colorVar} count={topicsInTheme(t.id).length} />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">
          New to the period? Start in the{' '}
          <Link to="/hall/prologue" className="font-semibold text-teal underline underline-offset-2">
            Prologue
          </Link>
          , which sets the big themes in one room.
        </p>
      </section>

      {/* Rooms */}
      <section className="wrap mt-16" aria-labelledby="rooms-title">
        <h2 id="rooms-title" className="text-2xl font-semibold">
          More rooms
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['/map', 'Map Room', 'Watch borders, canals and the Cotton Belt change, 1800–1848.', 'compass'],
              ['/timeline', 'Living Timeline', 'Every dated event, with causes and effects.', 'broadside'],
              ['/web', 'Causation Web', 'Trace chains of cause and effect, then build your own.', 'scales'],
              ['/glossary', 'Glossary', `All ${terms.length} terms, searchable.`, 'press'],
            ] as const
          ).map(([to, title, blurb, motif]) => (
            <li key={to}>
              <Link to={to} className="panel group flex h-full flex-col gap-2 p-5 transition-transform duration-200 hover:-translate-y-1">
                <span className="text-brass">
                  <Motif id={motif} className="h-12 w-12" animated={false} />
                </span>
                <span className="font-display text-xl font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{title}</span>
                <span className="text-sm text-ink-soft">{blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ContinueCard({ due }: { due: number }) {
  const progress = useProgress();
  const last = progress.last;
  return (
    <div className="panel p-5">
      <p className="kicker">{last ? 'Continue where you left off' : 'Start here'}</p>
      {last ? (
        <>
          <p className="mt-1 font-display text-xl font-semibold">{last.label}</p>
          <p className="text-xs text-muted">Last visited {timeAgo(last.at)}</p>
          <Link to={last.path} className="btn btn-primary btn-sm mt-3">
            Continue
          </Link>
        </>
      ) : (
        <>
          <p className="mt-1 font-display text-xl font-semibold">Story 4.1: Contextualizing Period 4</p>
          <p className="text-sm text-ink-soft">Your place is saved in this browser as you go.</p>
          <Link to="/story/4.1" className="btn btn-primary btn-sm mt-3">
            Start the Prologue
          </Link>
        </>
      )}
      <p className="mt-3 border-t border-rule pt-2 text-sm text-ink-soft">
        <Link to="/arcade/flashcards" className="font-semibold text-teal underline underline-offset-2">
          {due > 0 ? `${due} flashcard${due === 1 ? '' : 's'} due today` : 'Start a flashcard deck'}
        </Link>
      </p>
    </div>
  );
}

function timeAgo(at: number) {
  const mins = Math.round((Date.now() - at) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/** A gallery door. Clicking swings the leaves open, then walks you through. */
function Door({ id, label, blurb, colorVar, count }: { id: ThemeId; label: string; blurb: string; colorVar: string; count: number }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const to = `/hall/${id}`;
  const color = `var(${colorVar})`;
  const leaf = 'absolute inset-y-0 w-1/2 border-2 bg-card [backface-visibility:hidden]';
  return (
    <Link
      to={to}
      onClick={(e) => {
        if (reduce || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        setOpening(true);
        setTimeout(() => navigate(to), 560);
      }}
      className="group block rounded-md text-center"
      aria-label={`${label}: ${count} topics. ${blurb}`}
    >
      <div className="relative mx-auto aspect-[3/4] max-w-xs overflow-hidden rounded-t-[50%_22%] border-[3px] [perspective:1100px]" style={{ borderColor: color }}>
        {/* the room beyond */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sunk p-6" style={{ color }}>
          <Motif id={DOOR_MOTIF[id]} className="h-24 w-24" />
          <p className="font-display text-lg font-semibold text-ink">{count} topics</p>
        </div>
        {/* the two leaves */}
        <motion.div
          className={`${leaf} left-0 origin-left`}
          style={{ borderColor: color }}
          animate={{ rotateY: opening ? -78 : 0 }}
          whileHover={reduce || opening ? undefined : { rotateY: -10 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <DoorPanels side="left" color={color} />
        </motion.div>
        <motion.div
          className={`${leaf} right-0 origin-right`}
          style={{ borderColor: color }}
          animate={{ rotateY: opening ? 78 : 0 }}
          whileHover={reduce || opening ? undefined : { rotateY: 10 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <DoorPanels side="right" color={color} />
        </motion.div>
      </div>
      <div className="relative mx-auto -mt-3 inline-block rounded border-2 bg-card px-4 py-1.5 shadow-paper" style={{ borderColor: 'var(--brass)' }}>
        <span className="font-display text-xl font-semibold">{label}</span>
      </div>
      <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">{blurb}</p>
    </Link>
  );
}

function DoorPanels({ side, color }: { side: 'left' | 'right'; color: string }) {
  return (
    <svg viewBox="0 0 100 266" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      <rect x="14" y="40" width="72" height="80" rx="3" style={{ fill: 'none', stroke: color, strokeWidth: 2 }} />
      <rect x="14" y="140" width="72" height="100" rx="3" style={{ fill: 'none', stroke: color, strokeWidth: 2 }} />
      <circle cx={side === 'left' ? 90 : 10} cy="135" r="4" style={{ fill: 'var(--brass)' }} />
    </svg>
  );
}

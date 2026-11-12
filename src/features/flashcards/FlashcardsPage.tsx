import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { TopicPicker } from '../../components/TopicPicker';
import { Kbd, PageHeader, ProgressBar, usePageMeta } from '../../components/ui';
import { termById, topicById, topics } from '../../lib/data';
import { type DirectionMode, type QueueCard, buildQueue, deckStats } from '../../lib/deck';
import { useReducedMotion } from '../../lib/prefs';
import { getProgress, reviewCard, useProgress } from '../../lib/progress';
import { type Grade, cardKey, previewInterval } from '../../lib/srs';
import { readItem, writeItem } from '../../lib/storage';

const SETTINGS_KEY = 'period4.flashcards.settings';
const GRADES: Array<{ grade: Grade; label: string; key: string }> = [
  { grade: 'again', label: 'Again', key: '1' },
  { grade: 'hard', label: 'Hard', key: '2' },
  { grade: 'good', label: 'Good', key: '3' },
  { grade: 'easy', label: 'Easy', key: '4' },
];

interface Settings {
  topics: string[];
  mode: DirectionMode;
  newLimit: number;
}

function loadSettings(param: string | null): Settings {
  const fallback: Settings = { topics: topics.map((t) => t.id), mode: 'td', newLimit: 15 };
  try {
    const saved = { ...fallback, ...JSON.parse(readItem(SETTINGS_KEY) ?? '{}') } as Settings;
    const fromUrl = param?.split(',').filter((id) => topicById.has(id));
    return { ...saved, topics: fromUrl?.length ? fromUrl : saved.topics.filter((id) => topicById.has(id)) };
  } catch {
    return fallback;
  }
}

export default function FlashcardsPage() {
  usePageMeta('Flashcards', 'Flashcards');
  const [params] = useSearchParams();
  const [settings, setSettings] = useState<Settings>(() => loadSettings(params.get('topics')));
  const [session, setSession] = useState<QueueCard[] | null>(null);
  const progress = useProgress();
  const stats = useMemo(() => deckStats(progress, settings.topics, settings.mode), [progress, settings.topics, settings.mode]);

  useEffect(() => {
    writeItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const start = () => setSession(buildQueue(getProgress(), settings.topics, settings.mode, settings.newLimit));

  return (
    <div className="wrap">
      <PageHeader
        kicker="Study Arcade · Active recall"
        title="Flashcards"
        lede="Spaced repetition (SM-2): cards you know drift weeks apart; cards you miss come back in ten minutes. Study both directions: term → definition and definition → term."
        motif="press"
      />
      {session ? (
        <Session queue={session} onExit={() => setSession(null)} />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="panel grid gap-6 p-5 sm:p-6">
            <TopicPicker value={settings.topics} onChange={(t) => setSettings((s) => ({ ...s, topics: t }))} label="Deck: which topics?" />
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Direction</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Direction">
                {(
                  [
                    ['td', 'Term → definition'],
                    ['dt', 'Definition → term'],
                    ['both', 'Both directions'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={settings.mode === value}
                    className="chip"
                    onClick={() => setSettings((s) => ({ ...s, mode: value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="new-limit" className="mb-2 block text-sm font-semibold">
                New cards this session
              </label>
              <select
                id="new-limit"
                className="field max-w-48"
                value={settings.newLimit}
                onChange={(e) => setSettings((s) => ({ ...s, newLimit: Number(e.target.value) }))}
              >
                {[5, 10, 15, 25, 40].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary" disabled={!settings.topics.length || stats.due + stats.fresh === 0} onClick={start}>
                Start session · {stats.due + Math.min(stats.fresh, settings.newLimit)} cards
              </button>
              {!settings.topics.length && <p className="text-sm text-muted">Pick at least one topic.</p>}
            </div>
          </div>
          <aside className="panel p-5 sm:p-6" aria-label="Deck status">
            <h2 className="text-xl font-semibold">Today’s queue</h2>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                ['Due', stats.due],
                ['New', stats.fresh],
                ['Scheduled', stats.learned],
              ].map(([label, n]) => (
                <div key={label} className="rounded border border-rule p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
                  <dd className="mt-1 text-2xl font-semibold">{n}</dd>
                </div>
              ))}
            </dl>
            <ProgressBar className="mt-5" value={stats.total ? stats.learned / stats.total : 0} label="Share of cards scheduled for a later day" />
            <p className="mt-2 text-sm text-muted">
              {stats.learned} of {stats.total} cards are scheduled for a later day.
            </p>
            <h3 className="mt-6 font-sans text-sm font-semibold">Keyboard</h3>
            <ul className="mt-2 grid gap-1.5 text-sm text-ink-soft">
              <li>
                <Kbd>Space</Kbd> flip the card
              </li>
              <li>
                <Kbd>1</Kbd> <Kbd>2</Kbd> <Kbd>3</Kbd> <Kbd>4</Kbd> again · hard · good · easy
              </li>
              <li>
                <Kbd>←</Kbd> again · <Kbd>→</Kbd> good
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted">On a phone, swipe a flipped card left for “again” or right for “good”.</p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Session({ queue: initial, onExit }: { queue: QueueCard[]; onExit: () => void }) {
  const [queue, setQueue] = useState(initial);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState<Record<Grade, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [announce, setAnnounce] = useState('');
  const showRef = useRef<HTMLButtonElement>(null);
  const goodRef = useRef<HTMLButtonElement>(null);
  const progress = useProgress();
  const current = queue[index];
  const term = current ? termById.get(current.termId) : undefined;
  const done = index >= queue.length;

  const flip = useCallback(() => {
    if (!term || flipped) return;
    setFlipped(true);
    setAnnounce(`Answer: ${current.dir === 'td' ? term.def : term.term}`);
    requestAnimationFrame(() => goodRef.current?.focus());
  }, [term, flipped, current]);

  const grade = useCallback(
    (g: Grade) => {
      if (!current || !flipped) return;
      reviewCard(current.termId, current.dir, g);
      setTally((t) => ({ ...t, [g]: t[g] + 1 }));
      // A missed card comes back at the end of this session (once more).
      if (g === 'again' && queue.filter((q) => q.termId === current.termId && q.dir === current.dir).length < 3) {
        setQueue((q) => [...q, current]);
      }
      setFlipped(false);
      setIndex((i) => i + 1);
      setAnnounce('Next card.');
      requestAnimationFrame(() => showRef.current?.focus());
    },
    [current, flipped, queue],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      const onButton = tag === 'BUTTON' || tag === 'A';
      if ((e.key === ' ' || e.key === 'Enter') && !onButton && !flipped) {
        e.preventDefault();
        flip();
      }
      const g = GRADES.find((x) => x.key === e.key)?.grade ?? (e.key === 'ArrowLeft' ? 'again' : e.key === 'ArrowRight' ? 'good' : null);
      if (g && flipped) {
        e.preventDefault();
        grade(g);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip, grade, flipped]);

  if (done || !term) {
    const reviewed = Object.values(tally).reduce((a, b) => a + b, 0);
    return (
      <section className="panel mx-auto mt-10 max-w-xl p-6 text-center" aria-labelledby="session-done">
        <h2 id="session-done" className="text-2xl font-semibold">
          Session complete
        </h2>
        <p className="mt-2 text-ink-soft">
          You reviewed {reviewed} card{reviewed === 1 ? '' : 's'}: {tally.again} again, {tally.hard} hard, {tally.good} good, {tally.easy} easy.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={onExit}>
            Back to deck
          </button>
          <Link to="/progress" className="btn btn-secondary">
            See progress
          </Link>
        </div>
      </section>
    );
  }

  const card = progress.srs[cardKey(current.termId, current.dir)];
  const topic = topicById.get(term.topicId);
  const prompt = current.dir === 'td' ? term.term : term.def;
  const answer = current.dir === 'td' ? term.def : term.term;
  const now = Date.now();

  return (
    <section className="mx-auto mt-8 max-w-2xl" aria-label="Flashcard session">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm text-muted">
        <span className="tabular">
          Card {Math.min(index + 1, queue.length)} of {queue.length}
        </span>
        <span>{current.dir === 'td' ? 'Term → definition' : 'Definition → term'}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onExit}>
          End session
        </button>
      </div>
      <ProgressBar value={index / queue.length} label="Session progress" />
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <div className="mt-6">
        <AnimatePresence mode="wait" initial={false}>
          <FlipCard
            key={`${current.termId}-${current.dir}-${index}`}
            prompt={prompt}
            answer={answer}
            promptIsTerm={current.dir === 'td'}
            meta={`${topic?.id} ${topic?.title} · Yawp ${term.yawp}`}
            flipped={flipped}
            onFlip={flip}
            onSwipe={grade}
          />
        </AnimatePresence>
      </div>

      <div className="mt-6 min-h-[5.5rem]">
        {!flipped ? (
          <div className="flex justify-center">
            <button ref={showRef} type="button" className="btn btn-primary min-w-48" onClick={flip} aria-describedby="card-prompt">
              Show answer <Kbd>Space</Kbd>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="How well did you remember?">
            {GRADES.map((g) => (
              <button
                key={g.grade}
                ref={g.grade === 'good' ? goodRef : undefined}
                type="button"
                className={`btn flex-col gap-0.5 ${g.grade === 'good' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => grade(g.grade)}
              >
                <span>{g.label}</span>
                <span className="text-xs font-normal opacity-80">{previewInterval(card, g.grade, now)}</span>
                <span className="sr-only">, key {g.key}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FlipCard({
  prompt,
  answer,
  promptIsTerm,
  meta,
  flipped,
  onFlip,
  onSwipe,
}: {
  prompt: string;
  answer: string;
  promptIsTerm: boolean;
  meta: string;
  flipped: boolean;
  onFlip: () => void;
  onSwipe: (g: Grade) => void;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-220, 220], [-7, 7]);
  const againOpacity = useTransform(x, [-130, -30], [1, 0]);
  const goodOpacity = useTransform(x, [30, 130], [0, 1]);

  const face = 'absolute inset-0 flex flex-col items-center justify-center overflow-auto rounded-md border border-rule bg-card p-6 text-center shadow-paper [backface-visibility:hidden] sm:p-10';
  const termStyle = 'font-display text-[clamp(1.5rem,1.1rem+2vw,2.3rem)] font-semibold leading-tight';
  const defStyle = 'text-[clamp(1.05rem,1rem+0.5vw,1.3rem)] leading-relaxed text-ink';

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="relative"
    >
      <motion.div
        style={reduce ? undefined : { x, rotate: tilt }}
        drag={flipped && !reduce ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={(_, info) => {
          if (info.offset.x > 110) onSwipe('good');
          else if (info.offset.x < -110) onSwipe('again');
        }}
        onClick={() => !flipped && onFlip()}
        className={`relative h-[18rem] w-full touch-pan-y select-none [perspective:1400px] sm:h-[20rem] ${flipped ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      >
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={reduce ? undefined : { rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <div className={face} aria-hidden={flipped} style={reduce && flipped ? { visibility: 'hidden' } : undefined}>
            <p className="kicker mb-4">{promptIsTerm ? 'Term' : 'Definition'}</p>
            <p id="card-prompt" className={promptIsTerm ? termStyle : defStyle}>
              {prompt}
            </p>
            <p className="mt-6 text-xs text-muted">Tap or press Space to flip</p>
          </div>
          <div
            className={face}
            aria-hidden={!flipped}
            style={reduce ? { visibility: flipped ? 'visible' : 'hidden' } : { transform: 'rotateY(180deg)' }}
          >
            <p className="kicker mb-3">{promptIsTerm ? 'Definition' : 'Term'}</p>
            <p className={promptIsTerm ? defStyle : termStyle}>{answer}</p>
            <p className="mt-4 max-w-md border-t border-rule pt-3 text-sm text-muted">
              <span className="font-semibold">{promptIsTerm ? 'Term: ' : 'Definition: '}</span>
              {prompt}
            </p>
            <p className="mt-2 text-xs text-muted">{meta}</p>
          </div>
        </motion.div>
        {flipped && !reduce && (
          <>
            <motion.span style={{ opacity: againOpacity }} className="stamp pointer-events-none absolute left-4 top-4 bg-card text-sm" aria-hidden="true">
              Again
            </motion.span>
            <motion.span
              style={{ opacity: goodOpacity }}
              className="stamp pointer-events-none absolute right-4 top-4 rotate-3 bg-card text-sm !text-teal"
              aria-hidden="true"
            >
              Good
            </motion.span>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

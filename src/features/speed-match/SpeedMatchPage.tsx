import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader, usePageMeta } from '../../components/ui';
import { isSolemn, terms, topicById, topics } from '../../lib/data';
import { useReducedMotion } from '../../lib/prefs';
import { XP, awardXp, recordAnswers, setBest, useProgress } from '../../lib/progress';
import { createRng, shuffle } from '../../lib/random';
import type { Term } from '../../lib/types';
import { TOPIC_SHORT } from '../../unit/config';

const PAIRS = 6;
const PENALTY = 3;

// Timed racing is no way to treat atrocities, so solemn terms sit this game out.
const playable = (t: Term) => !isSolemn(t.id) && t.def.split(/\s+/).length > 3;

export default function SpeedMatchPage() {
  usePageMeta('Speed Match', 'Speed Match');
  const [scope, setScope] = useState('all');
  const [round, setRound] = useState(0);
  const pool = useMemo(() => (scope === 'all' ? terms : (topicById.get(scope)?.terms ?? [])).filter(playable), [scope]);
  return (
    <div className="wrap">
      <PageHeader
        kicker="Study Arcade · Fluency"
        title="Speed Match"
        lede={`Match ${PAIRS} terms to their definitions as fast as you can. Each wrong match adds ${PENALTY} seconds.`}
        motif="canal"
      />
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="sm-scope" className="mb-1 block text-sm font-semibold">
            Topics
          </label>
          <select
            id="sm-scope"
            className="field"
            value={scope}
            onChange={(e) => {
              setScope(e.target.value);
              setRound((r) => r + 1);
            }}
          >
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} {TOPIC_SHORT[t.id]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Board key={`${scope}-${round}`} pool={pool} scope={scope} onAgain={() => setRound((r) => r + 1)} />
    </div>
  );
}

function Board({ pool, scope, onAgain }: { pool: Term[]; scope: string; onAgain: () => void }) {
  const reduce = useReducedMotion();
  const progress = useProgress();
  const [seed] = useState(() => Date.now());
  const picked = useMemo(() => shuffle(pool, createRng(seed)).slice(0, PAIRS), [pool, seed]);
  const left = picked;
  const right = useMemo(() => shuffle(picked, createRng(seed + 1)), [picked, seed]);
  const [started, setStarted] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [penalty, setPenalty] = useState(0);
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [selDef, setSelDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const [final, setFinal] = useState<{ time: number; best: boolean } | null>(null);
  const announce = useRef<HTMLParagraphElement>(null);

  const done = matched.length === picked.length && picked.length > 0;
  const elapsed = started ? ((final ? final.time * 1000 : now - started) / 1000 + (final ? 0 : penalty)) : 0;

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [started, done]);

  useEffect(() => {
    if (!done || final || !started) return;
    const time = (Date.now() - started) / 1000 + penalty;
    const best = setBest(`speed:${scope}:time`, Number(time.toFixed(1)), 'lower');
    setFinal({ time, best });
    awardXp(XP.speedRound);
    recordAnswers(
      picked.map((t) => ({ termId: t.id, correct: !missed.includes(t.id) })),
      0,
    );
  }, [done, final, started, penalty, scope, picked, missed]);

  const attempt = (termId: string, defId: string) => {
    if (termId === defId) {
      setMatched((m) => [...m, termId]);
      if (announce.current) announce.current.textContent = 'Match.';
    } else {
      setPenalty((p) => p + PENALTY);
      setMissed((m) => [...new Set([...m, termId, defId])]);
      setShake(`${termId}|${defId}`);
      setTimeout(() => setShake(null), 400);
      if (announce.current) announce.current.textContent = `Not a match. Plus ${PENALTY} seconds.`;
    }
    setSelTerm(null);
    setSelDef(null);
  };

  const pickTerm = (id: string) => {
    if (!started) setStarted(Date.now());
    if (selDef) attempt(id, selDef);
    else setSelTerm((cur) => (cur === id ? null : id));
  };
  const pickDef = (id: string) => {
    if (!started) setStarted(Date.now());
    if (selTerm) attempt(selTerm, id);
    else setSelDef((cur) => (cur === id ? null : id));
  };

  if (pool.length < PAIRS) return <p className="mt-6 text-muted">Not enough terms in this topic for a round.</p>;

  const best = progress.bests[`speed:${scope}:time`];
  const cell = (id: string, isSel: boolean, isMatched: boolean, side: 'term' | 'def') => {
    const shaking = shake?.split('|').includes(id) && !reduce;
    return {
      animate: shaking ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0, opacity: isMatched ? 0.45 : 1 },
      transition: { duration: shaking ? 0.35 : 0.2 },
      className: `flex min-h-12 w-full items-center rounded border-[1.5px] px-3 py-2 text-left transition-colors ${
        isMatched
          ? 'border-teal bg-card'
          : isSel
            ? 'border-ink bg-ink text-paper'
            : 'border-rule-strong bg-card hover:border-ink'
      } ${side === 'term' ? 'font-semibold' : 'text-sm'}`,
    };
  };

  return (
    <section className="mt-6" aria-label="Speed Match board">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <p className="font-sans text-3xl font-semibold tabular" aria-live="off">
          {elapsed.toFixed(1)}s
        </p>
        <p className="text-sm text-muted">
          {matched.length}/{picked.length} matched{penalty ? ` · +${penalty}s penalty` : ''}
          {best !== undefined && ` · Best ${best.toFixed(1)}s`}
        </p>
        <p ref={announce} className="sr-only" aria-live="polite" />
      </div>
      {!started && <p className="mb-3 text-sm text-ink-soft">The clock starts on your first pick. Select a term, then its definition (or the other way round).</p>}
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 sm:gap-6">
        <ul className="grid content-start gap-2" aria-label="Terms">
          {left.map((t) => {
            const m = matched.includes(t.id);
            const c = cell(t.id, selTerm === t.id, m, 'term');
            return (
              <li key={t.id}>
                <motion.button type="button" disabled={m || !!final} aria-pressed={selTerm === t.id} onClick={() => pickTerm(t.id)} animate={c.animate} transition={c.transition} className={c.className}>
                  {t.term}
                </motion.button>
              </li>
            );
          })}
        </ul>
        <ul className="grid content-start gap-2" aria-label="Definitions">
          {right.map((t) => {
            const m = matched.includes(t.id);
            const c = cell(t.id, selDef === t.id, m, 'def');
            return (
              <li key={t.id}>
                <motion.button type="button" disabled={m || !!final} aria-pressed={selDef === t.id} onClick={() => pickDef(t.id)} animate={c.animate} transition={c.transition} className={c.className}>
                  {t.def}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>
      {final && (
        <div className="panel mt-6 p-5" role="status">
          <p className="text-xl font-semibold">
            Finished in {final.time.toFixed(1)} seconds{final.best ? '. A new personal best.' : '.'}
          </p>
          <button type="button" className="btn btn-primary mt-3" onClick={onAgain}>
            New round
          </button>
        </div>
      )}
    </section>
  );
}

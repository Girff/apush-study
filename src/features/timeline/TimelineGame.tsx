import { useState } from 'react';
import { ReorderList } from '../../components/ReorderList';
import { isSolemn } from '../../lib/data';
import { XP, awardXp, recordAnswers, setBest, useProgress } from '../../lib/progress';
import { maskYears } from '../../lib/dates';
import { createRng, shuffle } from '../../lib/random';
import { type TimelineEvent, timelineEvents } from '../../lib/timeline';

type Level = 'spread' | 'close';
const ROUND = 5;

function pickRound(level: Level, seed: number): TimelineEvent[] {
  const rng = createRng(seed);
  // Long spans ("1790–1860") make ordering ambiguous, so rounds use events
  // that happened at a point or over a few years.
  const pool = shuffle(
    timelineEvents().filter((e) => !e.end || e.end - e.start <= 3),
    rng,
  );
  const out: TimelineEvent[] = [];
  const gap = level === 'spread' ? 6 : 1;
  for (const e of pool) {
    if (out.every((o) => Math.abs(Math.floor(o.start) - Math.floor(e.start)) >= gap)) out.push(e);
    if (out.length === ROUND) break;
  }
  return out;
}

export function TimelineGame() {
  const progress = useProgress();
  const [level, setLevel] = useState<Level>('spread');
  const [seed, setSeed] = useState(() => Date.now());
  const [items, setItems] = useState(() => pickRound('spread', seed));
  const [checked, setChecked] = useState(false);
  const [streak, setStreak] = useState(0);
  const best = progress.bests['timeline:streak'] ?? 0;

  const correctOrder = items.slice().sort((a, b) => a.start - b.start);
  const rightAt = (i: number) => items[i].term.id === correctOrder[i].term.id;
  const allRight = items.every((_, i) => rightAt(i));

  const check = () => {
    setChecked(true);
    const ok = items.every((_, i) => rightAt(i));
    recordAnswers(
      items.map((it, i) => ({ termId: it.term.id, correct: rightAt(i) })),
      0,
    );
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      setBest('timeline:streak', next, 'higher');
      awardXp(XP.timelineRound);
    } else {
      setStreak(0);
    }
  };

  const nextRound = (lvl: Level = level) => {
    const s = Date.now();
    setSeed(s);
    setItems(pickRound(lvl, s));
    setChecked(false);
  };

  return (
    <section aria-labelledby="game-title" className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="game-title" className="text-2xl font-semibold">
            Put these in chronological order
          </h2>
          <p className="mt-1 text-ink-soft">Earliest at the top. Drag the handles, use the arrows, or focus a handle and press ↑/↓.</p>
        </div>
        <dl className="flex gap-3 text-center">
          <div className="rounded border border-rule px-3 py-1.5">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Streak</dt>
            <dd className="text-xl font-semibold tabular">{streak}</dd>
          </div>
          <div className="rounded border border-rule px-3 py-1.5">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Best</dt>
            <dd className="text-xl font-semibold tabular">{best}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Difficulty">
        {(
          [
            ['spread', 'Spread out (6+ years apart)'],
            ['close', 'Close calls'],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={level === v}
            className="chip"
            onClick={() => {
              setLevel(v);
              nextRound(v);
              setStreak(0);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <ReorderList
          key={seed}
          items={items}
          getKey={(e) => e.term.id}
          getLabel={(e) => (checked ? e.term.term : maskYears(e.term.term))}
          onChange={setItems}
          disabled={checked}
          label="Events to order"
          itemClassName={(_, i) => (checked ? (rightAt(i) ? '!border-teal' : '!border-oxblood') : '')}
          renderItem={(e, i) => (
            <div className="py-1">
              <p className="font-semibold leading-snug">{checked ? e.term.term : maskYears(e.term.term)}</p>
              {checked ? (
                <p className="text-sm text-ink-soft">
                  <span className="font-semibold tabular">{e.label}</span>
                  {' · '}
                  {rightAt(i) ? 'In the right place.' : `Belongs at position ${correctOrder.findIndex((c) => c.term.id === e.term.id) + 1}.`}
                </p>
              ) : (
                <p className="line-clamp-1 text-sm text-muted">{maskYears(e.term.def)}</p>
              )}
            </div>
          )}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3" aria-live="polite">
        {!checked ? (
          <button type="button" className="btn btn-primary" onClick={check}>
            Check order
          </button>
        ) : (
          <>
            <p className="font-semibold">
              {allRight
                ? items.some((e) => isSolemn(e.term.id))
                  ? 'Correct order.'
                  : `Correct order. Streak ${streak}.`
                : 'Not quite. The years are shown above.'}
            </p>
            <button type="button" className="btn btn-primary" onClick={() => nextRound()}>
              Next round
            </button>
          </>
        )}
      </div>
    </section>
  );
}

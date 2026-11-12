/**
 * Sort It: drag a card onto a bucket (mouse or touch), tap a card then a
 * bucket, use the buttons on each card, or focus a card and press 1–4.
 */
import { motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { Kbd, PageHeader, usePageMeta } from '../../components/ui';
import { resolveRef } from '../../lib/data';
import { XP, awardXp, recordAnswers } from '../../lib/progress';
import { createRng, shuffle } from '../../lib/random';
import type { Term } from '../../lib/types';
import { SORT_SETS, type SortSet } from '../../unit/games';

export default function SortItPage() {
  usePageMeta('Sort It', 'Sort It');
  const [id, setId] = useState(SORT_SETS[0]?.id ?? '');
  const set = SORT_SETS.find((s) => s.id === id);
  return (
    <div className="wrap">
      <PageHeader
        kicker="Study Arcade · Comparison"
        title="Sort It"
        lede="Drag each term into the right bucket. No mouse? Focus a card and press a number key, or use its buttons."
        motif="loom"
      />
      {!set ? (
      <p className="mt-8 rounded border border-dashed border-rule-strong px-4 py-6 text-center text-sm text-muted">
        No content is configured for this game in the current unit. Add some in <code>src/unit/</code> (see README).
      </p>
      ) : (
      <>
      <div className="mt-6">
        <label htmlFor="sort-pick" className="mb-1 block text-sm font-semibold">
          Sorting challenge
        </label>
        <select id="sort-pick" className="field max-w-md" value={id} onChange={(e) => setId(e.target.value)}>
          {SORT_SETS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
      <Sorter key={id} set={set} />
      </>
      )}
    </div>
  );
}

interface Card {
  term: Term;
  bucket: string;
}

function Sorter({ set }: { set: SortSet }) {
  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        set.items.map((it) => ({ term: resolveRef(it.ref)!, bucket: it.bucket })),
        createRng(Date.now()),
      ),
    [set],
  );
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState('');
  const bucketRefs = useRef(new Map<string, HTMLElement>());

  const place = (termId: string, bucket: string) => {
    if (checked) return;
    setPlaced((p) => ({ ...p, [termId]: bucket }));
    setSelected(null);
    const label = set.buckets.find((b) => b.id === bucket)?.label;
    const term = cards.find((c) => c.term.id === termId)?.term.term;
    setMessage(`${term} placed in ${label}.`);
  };

  const unplace = (termId: string) => {
    if (checked) return;
    setPlaced((p) => {
      const n = { ...p };
      delete n[termId];
      return n;
    });
  };

  const dropAt = (termId: string, x: number, y: number) => {
    for (const [bucket, el] of bucketRefs.current) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        place(termId, bucket);
        return true;
      }
    }
    return false;
  };

  const tray = cards.filter((c) => !placed[c.term.id]);
  const correctCount = cards.filter((c) => placed[c.term.id] === c.bucket).length;

  const check = () => {
    setChecked(true);
    recordAnswers(
      cards.map((c) => ({ termId: c.term.id, correct: placed[c.term.id] === c.bucket })),
      0,
    );
    awardXp(XP.sort);
  };

  const renderCard = (c: Card, inBucket: boolean) => {
    const isRight = checked && placed[c.term.id] === c.bucket;
    const isWrong = checked && placed[c.term.id] && placed[c.term.id] !== c.bucket;
    return (
      <motion.div
        key={c.term.id}
        layout
        drag={!checked}
        dragSnapToOrigin
        dragElastic={0.6}
        whileDrag={{ scale: 1.04, zIndex: 50, boxShadow: '0 16px 30px -14px rgba(0,0,0,0.5)' }}
        onDragEnd={(_, info) => {
          dropAt(c.term.id, info.point.x - window.scrollX, info.point.y - window.scrollY);
        }}
        className={`panel relative cursor-grab touch-none p-2.5 active:cursor-grabbing ${
          selected === c.term.id ? 'ring-2 ring-[var(--focus)]' : ''
        } ${isRight ? '!border-teal' : ''} ${isWrong ? '!border-oxblood' : ''}`}
      >
        <button
          type="button"
          className="w-full text-left text-sm font-semibold leading-snug"
          aria-pressed={selected === c.term.id}
          onClick={() => setSelected((s) => (s === c.term.id ? null : c.term.id))}
          onKeyDown={(e) => {
            const n = Number(e.key);
            if (n >= 1 && n <= set.buckets.length) {
              e.preventDefault();
              place(c.term.id, set.buckets[n - 1].id);
            }
          }}
          aria-label={`${c.term.term}. Press ${set.buckets.map((b, i) => `${i + 1} for ${b.label}`).join(', ')}.`}
        >
          {c.term.term}
        </button>
        {checked && isWrong && <p className="mt-1 text-xs text-ink-soft">Belongs in {set.buckets.find((b) => b.id === c.bucket)?.label}. {c.term.def}</p>}
        {!checked && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {inBucket ? (
              <button type="button" className="rounded px-1.5 py-0.5 text-xs text-muted hover:bg-sunk" onClick={() => unplace(c.term.id)}>
                ↩ Back to tray
              </button>
            ) : (
              set.buckets.map((b, i) => (
                <button key={b.id} type="button" className="rounded border border-rule px-1.5 py-0.5 text-xs text-ink-soft hover:border-ink" onClick={() => place(c.term.id, b.id)}>
                  {i + 1} · {b.label}
                </button>
              ))
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="mt-6">
      <p className="text-ink-soft">{set.prompt}</p>
      <p className="mt-1 text-sm text-muted">
        Keyboard: focus a card, then press {set.buckets.map((_, i) => <Kbd key={i}>{i + 1}</Kbd>)}.
      </p>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      <section aria-label="Unsorted terms" className="mt-4 rounded-md border border-dashed border-rule-strong p-3">
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Tray · {tray.length} left</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{tray.map((c) => renderCard(c, false))}</div>
        {tray.length === 0 && <p className="py-2 text-sm text-muted">All sorted.</p>}
      </section>

      <div className={`mt-4 grid gap-3 ${set.buckets.length > 2 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
        {set.buckets.map((b, i) => (
          <section
            key={b.id}
            ref={(el) => {
              if (el) bucketRefs.current.set(b.id, el);
            }}
            aria-labelledby={`bucket-${b.id}`}
            className="min-h-40 rounded-md border-2 border-rule-strong bg-sunk/40 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 id={`bucket-${b.id}`} className="text-lg font-semibold">
                {b.label}
              </h2>
              {selected && !checked && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => place(selected, b.id)}>
                  Place here
                </button>
              )}
              <span className="text-xs text-muted" aria-hidden="true">
                {i + 1}
              </span>
            </div>
            <div className="mt-2 grid gap-2">{cards.filter((c) => placed[c.term.id] === b.id).map((c) => renderCard(c, true))}</div>
          </section>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button type="button" className="btn btn-primary" disabled={tray.length > 0} onClick={check}>
            Check my sorting
          </button>
        ) : (
          <>
            <p className="text-lg font-semibold" role="status">
              {correctCount} of {cards.length} sorted correctly.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setPlaced({});
                setChecked(false);
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { Fragment, useMemo, useState } from 'react';
import { PageHeader, usePageMeta } from '../../components/ui';
import { resolveRef } from '../../lib/data';
import { XP, awardXp, recordAnswers } from '../../lib/progress';
import { createRng, shuffle } from '../../lib/random';
import type { Term } from '../../lib/types';
import { CLOZE_CHAINS, type ClozeChain } from '../../unit/games';

export default function FillChainPage() {
  usePageMeta('Fill the Chain', 'Fill the Chain');
  const [id, setId] = useState(CLOZE_CHAINS[0]?.id ?? '');
  const chain = CLOZE_CHAINS.find((c) => c.id === id);
  return (
    <div className="wrap">
      <PageHeader
        kicker="Study Arcade · Causation"
        title="Fill the Chain"
        lede="Each sentence is one link in a cause → effect chain with one term missing. Pick a blank, then the term that completes it."
        motif="scales"
      />
      {!chain ? (
      <p className="mt-8 rounded border border-dashed border-rule-strong px-4 py-6 text-center text-sm text-muted">
        No content is configured for this game in the current unit. Add some in <code>src/unit/</code> (see README).
      </p>
      ) : (
      <>
      <div className="mt-6">
        <label htmlFor="fc-pick" className="mb-1 block text-sm font-semibold">
          Chain
        </label>
        <select id="fc-pick" className="field max-w-md" value={id} onChange={(e) => setId(e.target.value)}>
          {CLOZE_CHAINS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <Puzzle key={id} chain={chain} />
      </>
      )}
    </div>
  );
}

function Puzzle({ chain }: { chain: ClozeChain }) {
  const steps = useMemo(
    () =>
      chain.steps.map((s) => {
        const m = /\{\{([^}]+)\}\}/.exec(s)!;
        return { before: s.slice(0, m.index), after: s.slice(m.index + m[0].length), answer: resolveRef(m[1])! };
      }),
    [chain],
  );
  const bank = useMemo(
    () =>
      shuffle(
        [...steps.map((s) => s.answer), ...chain.decoys.map((d) => resolveRef(d)).filter((t): t is Term => !!t)],
        createRng(Date.now()),
      ),
    [steps, chain],
  );
  const [filled, setFilled] = useState<Array<Term | null>>(() => steps.map(() => null));
  const [active, setActive] = useState(0);
  const [checked, setChecked] = useState(false);
  const used = new Set(filled.filter(Boolean).map((t) => t!.id));
  const right = (i: number) => filled[i]?.id === steps[i].answer.id;
  const score = steps.filter((_, i) => right(i)).length;

  const place = (t: Term) => {
    if (checked) return;
    const next = filled.slice();
    next[active] = t;
    setFilled(next);
    const nextEmpty = next.findIndex((x, i) => !x && i !== active);
    if (nextEmpty >= 0) setActive(nextEmpty);
  };

  const check = () => {
    setChecked(true);
    recordAnswers(
      steps.map((s, i) => ({ termId: s.answer.id, correct: right(i) })),
      0,
    );
    awardXp(XP.fillChain);
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <ol className="grid gap-3" aria-label="Chain">
        {steps.map((s, i) => (
          <Fragment key={i}>
            <li className="panel flex gap-3 p-4">
              <span className="font-display text-2xl font-bold leading-none text-brass-ink" aria-hidden="true">
                {i + 1}
              </span>
              <p className="leading-loose">
                {s.before}
                <button
                  type="button"
                  onClick={() => {
                    if (checked) return;
                    if (filled[i]) {
                      const next = filled.slice();
                      next[i] = null;
                      setFilled(next);
                    }
                    setActive(i);
                  }}
                  aria-pressed={active === i && !checked}
                  aria-label={filled[i] ? `Blank ${i + 1}: ${filled[i]!.term}. Activate to clear.` : `Blank ${i + 1}, empty${active === i ? ', selected' : ''}`}
                  className={`mx-1 inline-flex min-h-9 min-w-28 items-center justify-center rounded border-[1.5px] px-2 align-middle font-semibold ${
                    checked
                      ? right(i)
                        ? 'border-teal text-teal'
                        : 'border-oxblood text-oxblood'
                      : active === i
                        ? 'border-ink bg-sunk'
                        : 'border-dashed border-rule-strong'
                  }`}
                >
                  {filled[i]?.term ?? '______'}
                </button>
                {s.after}
              </p>
            </li>
            {checked && !right(i) && (
              <li className="-mt-2 ml-10 text-sm text-ink-soft">
                Answer: <strong>{s.answer.term}</strong>, {s.answer.def.charAt(0).toLowerCase() + s.answer.def.slice(1)}.
              </li>
            )}
          </Fragment>
        ))}
      </ol>
      <div className="grid content-start gap-4">
        <section aria-labelledby="bank-title" className="panel p-4">
          <h2 id="bank-title" className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Word bank · filling blank {active + 1}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {bank.map((t) => (
              <li key={t.id}>
                <button type="button" className="chip" disabled={used.has(t.id) || checked} onClick={() => place(t)}>
                  {t.term}
                </button>
              </li>
            ))}
          </ul>
        </section>
        {!checked ? (
          <button type="button" className="btn btn-primary" disabled={filled.some((f) => !f)} onClick={check}>
            Check the chain
          </button>
        ) : (
          <div className="panel p-4" role="status">
            <p className="text-xl font-semibold">
              {score} of {steps.length} links correct
            </p>
            <button
              type="button"
              className="btn btn-secondary mt-3"
              onClick={() => {
                setFilled(steps.map(() => null));
                setChecked(false);
                setActive(0);
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

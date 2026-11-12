import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader, usePageMeta } from '../../components/ui';
import { resolveRef } from '../../lib/data';
import { awardXp, recordAnswers, setBest, useProgress } from '../../lib/progress';
import { createRng, shuffle } from '../../lib/random';
import type { Term } from '../../lib/types';
import { PEOPLE, type Person } from '../../unit/games';

const ROUND = 5;
const points = (cluesShown: number) => Math.max(10, 100 - (cluesShown - 1) * 25);

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

/** Accepts any alias, and small typos in longer names ("Tecumseth"). */
export function isMatch(guess: string, person: Person) {
  const g = normalize(guess);
  if (!g) return false;
  return person.aliases.some((a) => a === g || (a.length >= 6 && distance(a, g) <= 2));
}

export default function WhoAmIPage() {
  usePageMeta('Who Am I?', 'Who Am I?');
  const [game, setGame] = useState(0);
  return (
    <div className="wrap">
      <PageHeader
        kicker="Study Arcade · People"
        title="Who Am I?"
        lede="Clues come one at a time, hardest first. Guess on the first clue for 100 points; each extra clue costs 25."
        motif="broadside"
      />
      {PEOPLE.length ? (
        <Game key={game} onRestart={() => setGame((g) => g + 1)} />
      ) : (
        <p className="mt-8 text-sm text-muted">No people are configured for this unit.</p>
      )}
    </div>
  );
}

function Game({ onRestart }: { onRestart: () => void }) {
  const progress = useProgress();
  const deck = useMemo(() => shuffle(PEOPLE, createRng(Date.now())).slice(0, ROUND), []);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(1);
  const [guess, setGuess] = useState('');
  const [wrong, setWrong] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<'right' | 'gave-up' | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const person = deck[i];
  const best = progress.bests['whoami:score'] ?? 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outcome || !guess.trim()) return;
    if (isMatch(guess, person)) {
      const pts = points(shown);
      setScore((s) => s + pts);
      setOutcome('right');
      awardXp(Math.round(pts / 10));
    } else {
      setWrong((w) => [...w, guess.trim()]);
      if (shown < person.clues.length) setShown((s) => s + 1);
    }
    setGuess('');
  };

  const next = () => {
    const termIds = person.terms.map((r) => resolveRef(r)?.id).filter((x): x is string => !!x);
    recordAnswers(
      termIds.slice(0, 1).map((termId) => ({ termId, correct: outcome === 'right' })),
      0,
    );
    if (i + 1 >= deck.length) {
      setFinished(true);
      setBest('whoami:score', score, 'higher');
      return;
    }
    setI((x) => x + 1);
    setShown(1);
    setWrong([]);
    setOutcome(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (finished) {
    return (
      <section className="panel mx-auto mt-8 max-w-xl p-6 text-center" role="status">
        <h2 className="text-2xl font-semibold">Round over</h2>
        <p className="mt-1 font-sans text-4xl font-semibold">{score} points</p>
        <p className="mt-1 text-sm text-muted">{score > best ? 'A new personal best.' : `Personal best: ${Math.max(best, score)}`}</p>
        <button type="button" className="btn btn-primary mt-4" onClick={onRestart}>
          Play again
        </button>
      </section>
    );
  }

  const related = person.terms.map((r) => resolveRef(r)).filter((t): t is Term => !!t);

  return (
    <section className="mx-auto mt-8 max-w-2xl" aria-labelledby="whoami-title">
      <div className="mb-3 flex justify-between text-sm text-muted">
        <span>
          Person {i + 1} of {deck.length}
        </span>
        <span className="tabular">{score} points</span>
      </div>
      <div className="panel p-5 sm:p-7">
        <h2 id="whoami-title" className="kicker">
          Clues
        </h2>
        <ol className="mt-3 grid gap-3" aria-live="polite">
          {person.clues.slice(0, outcome ? person.clues.length : shown).map((c, n) => (
            <li key={n} className="flex gap-3">
              <span className="font-display text-2xl font-bold leading-none text-brass-ink" aria-hidden="true">
                {n + 1}
              </span>
              <p className="pt-0.5 text-lg">{c}</p>
            </li>
          ))}
        </ol>

        {!outcome ? (
          <form onSubmit={submit} className="mt-6">
            <label htmlFor="whoami-guess" className="mb-1 block text-sm font-semibold">
              Who am I? <span className="font-normal text-muted">(worth {points(shown)} points now)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="whoami-guess"
                ref={inputRef}
                className="field"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                autoComplete="off"
                autoFocus
              />
              <button type="submit" className="btn btn-primary">
                Guess
              </button>
            </div>
            {wrong.length > 0 && (
              <p className="mt-2 text-sm text-oxblood" aria-live="polite">
                Not {wrong[wrong.length - 1]}.{shown < person.clues.length ? '' : ' That was the last clue.'}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary btn-sm" disabled={shown >= person.clues.length} onClick={() => setShown((s) => s + 1)}>
                Next clue (−25)
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOutcome('gave-up')}>
                Reveal the answer
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 border-t border-rule pt-4" role="status">
            <p className="text-sm font-semibold text-muted">{outcome === 'right' ? `Correct: +${points(shown)} points` : 'The answer was'}</p>
            <p className="font-display text-3xl font-semibold">{person.answer}</p>
            <ul className="mt-3 grid gap-1.5 text-sm">
              {related.map((t) => (
                <li key={t.id}>
                  <Link to={`/glossary?term=${encodeURIComponent(t.id)}`} className="font-semibold underline decoration-[var(--brass)] decoration-2 underline-offset-2">
                    {t.term}
                  </Link>
                  <span className="text-ink-soft">: {t.def}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-primary mt-4" onClick={next} autoFocus>
              {i + 1 >= deck.length ? 'See score' : 'Next person'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

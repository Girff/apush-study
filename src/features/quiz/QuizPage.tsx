import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { TopicPicker } from '../../components/TopicPicker';
import { PageHeader, usePageMeta } from '../../components/ui';
import { termById, topicById, topics } from '../../lib/data';
import { notify } from '../../lib/notify';
import { markDueNow, recordQuiz } from '../../lib/progress';
import { type QuestionKind, type QuizQuestion, buildQuiz } from '../../lib/quiz';
import { createRng } from '../../lib/random';
import type { Term } from '../../lib/types';
import { type QuizResult, QuizRunner } from './QuizRunner';

type Mode = 'mixed' | QuestionKind;

export default function QuizPage() {
  usePageMeta('Quiz', 'Multiple-choice quiz');
  const [params] = useSearchParams();
  const initialTopics = params.get('topics')?.split(',').filter((id) => topicById.has(id));
  const [selected, setSelected] = useState<string[]>(initialTopics?.length ? initialTopics : topics.map((t) => t.id));
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<Mode>('mixed');
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [round, setRound] = useState(0);

  const pool = useMemo(() => selected.flatMap((id) => topicById.get(id)?.terms ?? []), [selected]);

  const start = (terms: Term[] = pool, n = count) => {
    setQuestions(buildQuiz(terms, n, createRng(Date.now()), mode));
    setResults(null);
    setRound((r) => r + 1);
  };

  const finish = (res: QuizResult[]) => {
    setResults(res);
    recordQuiz({
      mode,
      topicIds: [...new Set(res.map((r) => termById.get(r.question.termId)!.topicId))],
      score: res.filter((r) => r.correct).length,
      total: res.length,
      missed: res.filter((r) => !r.correct).map((r) => r.question.termId),
    });
  };

  return (
    <div className="wrap">
      <PageHeader
        kicker="Study Arcade · Multiple choice"
        title="Quiz"
        lede="Every wrong answer is drawn from the same topic, so the choices are plausible and you have to know the difference."
        motif="ballot"
      />
      <div className="mt-8">
        {results && questions ? (
          <QuizResults results={results} onRetryMissed={(missed) => start(missed, missed.length)} onNew={() => setQuestions(null)} />
        ) : questions ? (
          <QuizRunner key={round} questions={questions} onFinish={finish} />
        ) : (
          <div className="panel grid max-w-4xl gap-6 p-5 sm:p-6">
            <TopicPicker value={selected} onChange={setSelected} label="Which topics?" />
            <div className="grid gap-6 sm:grid-cols-2">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">How many questions?</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="How many questions?">
                  {[10, 20, 40].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={count === n} className="chip" onClick={() => setCount(n)}>
                      {n}
                    </button>
                  ))}
                  <button type="button" role="radio" aria-checked={count === 9999} className="chip" onClick={() => setCount(9999)}>
                    All ({pool.length})
                  </button>
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Question style</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Question style">
                  {(
                    [
                      ['mixed', 'Mixed'],
                      ['td', 'Term → definition'],
                      ['dt', 'Definition → term'],
                    ] as const
                  ).map(([v, label]) => (
                    <button key={v} type="button" role="radio" aria-checked={mode === v} className="chip" onClick={() => setMode(v)}>
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <div>
              <button type="button" className="btn btn-primary" disabled={!pool.length} onClick={() => start()}>
                Start quiz · {Math.min(count, pool.length)} questions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizResults({
  results,
  onRetryMissed,
  onNew,
}: {
  results: QuizResult[];
  onRetryMissed: (missed: Term[]) => void;
  onNew: () => void;
}) {
  const score = results.filter((r) => r.correct).length;
  const missed = results.filter((r) => !r.correct);
  const missedTerms = missed.map((r) => termById.get(r.question.termId)!);
  const pct = Math.round((score / results.length) * 100);
  const [queued, setQueued] = useState(false);
  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="quiz-results">
      <div className="panel p-6 text-center">
        <p className="kicker">Results</p>
        <h2 id="quiz-results" className="mt-1 text-3xl font-semibold">
          {score} of {results.length} correct
        </h2>
        <p className="mt-1 font-sans text-5xl font-semibold text-teal">{pct}%</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={onNew}>
            New quiz
          </button>
          {missed.length > 0 && (
            <button type="button" className="btn btn-secondary" onClick={() => onRetryMissed(missedTerms)}>
              Retry the {missed.length} missed
            </button>
          )}
        </div>
      </div>

      {missed.length > 0 ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-2xl font-semibold">Missed-term review</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={queued}
              onClick={() => {
                markDueNow(missedTerms.map((t) => t.id));
                setQueued(true);
                notify({ kind: 'info', title: `${missedTerms.length} cards added to today’s flashcards` });
              }}
            >
              {queued ? 'Added to flashcards' : 'Add all to flashcards'}
            </button>
          </div>
          <ul className="mt-4 grid gap-3">
            {missed.map((r) => {
              const t = termById.get(r.question.termId)!;
              const picked = termById.get(r.question.options[r.chosen].termId)!;
              return (
                <li key={r.question.id} className="panel p-4" style={{ borderLeft: '4px solid var(--oxblood)' }}>
                  <p className="font-display text-lg font-semibold">{t.term}</p>
                  <p className="text-ink-soft">{t.def}</p>
                  <p className="mt-1 text-sm text-muted">
                    You picked: {r.question.kind === 'td' ? `“${picked.def}” (${picked.term})` : picked.term} · Yawp {t.yawp}
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Want the full context? Look the terms up in the <Link to="/glossary" className="font-semibold text-teal underline">glossary</Link> or reread their Story Mode chapters.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-center text-ink-soft">No missed terms this round.</p>
      )}
    </section>
  );
}

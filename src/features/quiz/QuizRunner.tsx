/**
 * Runs a list of multiple-choice questions. Used by the Quiz page and by the
 * end-of-chapter mini-quiz in Story Mode. Feedback is deliberately quiet:
 * no confetti, and solemn terms get a plain "Correct." with no XP flourish.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Kbd, ProgressBar } from '../../components/ui';
import { isSolemn, termById, topicById } from '../../lib/data';
import { XP, recordAnswer } from '../../lib/progress';
import type { QuizQuestion } from '../../lib/quiz';

export interface QuizResult {
  question: QuizQuestion;
  chosen: number;
  correct: boolean;
}

export function QuizRunner({
  questions,
  onFinish,
  compact = false,
}: {
  questions: QuizQuestion[];
  onFinish: (results: QuizResult[]) => void;
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const q = questions[index];
  const answered = chosen !== null;

  const choose = useCallback(
    (i: number) => {
      if (answered || !q) return;
      const correct = i === q.answer;
      setChosen(i);
      setResults((r) => [...r, { question: q, chosen: i, correct }]);
      recordAnswer(q.termId, correct, correct ? XP.correct : 0);
      requestAnimationFrame(() => nextRef.current?.focus());
    },
    [answered, q],
  );

  const next = useCallback(() => {
    if (!answered) return;
    if (index + 1 >= questions.length) {
      onFinish(results);
      return;
    }
    setIndex((i) => i + 1);
    setChosen(null);
    requestAnimationFrame(() => firstOptionRef.current?.focus());
  }, [answered, index, questions.length, onFinish, results]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      const n = Number(e.key);
      if (!answered && n >= 1 && n <= (q?.options.length ?? 0)) {
        e.preventDefault();
        choose(n - 1);
      } else if (answered && (e.key === 'ArrowRight' || (e.key === 'Enter' && tag !== 'BUTTON'))) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, choose, next, q]);

  if (!q) return null;
  const term = termById.get(q.termId)!;
  const solemn = isSolemn(term.id);
  const picked = chosen !== null ? termById.get(q.options[chosen].termId) : undefined;
  const isCorrect = chosen === q.answer;
  const score = results.filter((r) => r.correct).length;

  return (
    <section aria-label="Quiz" className="mx-auto max-w-3xl">
      <div className="mb-2 flex items-center justify-between text-sm text-muted">
        <span className="tabular">
          Question {index + 1} of {questions.length}
        </span>
        <span className="tabular">
          Score {score}/{results.length}
        </span>
      </div>
      <ProgressBar value={(index + (answered ? 1 : 0)) / questions.length} label="Quiz progress" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={q.id + index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={compact ? 'mt-4' : 'mt-6'}
        >
          <div className="panel p-5 sm:p-7">
            <p className="kicker">{q.kind === 'td' ? 'Which definition fits this term?' : 'Which term fits this definition?'}</p>
            <h3
              id={`qprompt-${index}`}
              className={
                q.kind === 'td'
                  ? 'mt-2 font-display text-[clamp(1.4rem,1.1rem+1.6vw,2rem)] font-semibold'
                  : 'mt-2 font-sans text-[clamp(1.1rem,1rem+0.6vw,1.35rem)] font-medium leading-relaxed'
              }
            >
              {q.prompt}
            </h3>
            <div role="group" aria-labelledby={`qprompt-${index}`} className="mt-5 grid gap-2.5">
              {q.options.map((opt, i) => {
                const state = !answered ? 'idle' : i === q.answer ? 'right' : i === chosen ? 'wrong' : 'dim';
                const styles = {
                  idle: 'border-rule-strong hover:border-ink hover:bg-sunk',
                  right: 'border-teal bg-[color-mix(in_srgb,var(--teal)_12%,transparent)]',
                  wrong: 'border-oxblood bg-[color-mix(in_srgb,var(--oxblood)_10%,transparent)]',
                  dim: 'border-rule opacity-60',
                }[state];
                return (
                  <button
                    key={opt.termId}
                    ref={i === 0 ? firstOptionRef : undefined}
                    type="button"
                    onClick={() => choose(i)}
                    aria-disabled={answered}
                    className={`flex min-h-12 w-full items-start gap-3 rounded border-[1.5px] px-4 py-3 text-left transition-colors ${styles}`}
                  >
                    <span className="mt-0.5 shrink-0" aria-hidden="true">
                      <Kbd>{i + 1}</Kbd>
                    </span>
                    <span className={q.kind === 'dt' ? 'font-semibold' : ''}>{opt.text}</span>
                    {state === 'right' && <span className="ml-auto shrink-0 text-sm font-semibold text-teal">Answer</span>}
                    {state === 'wrong' && <span className="ml-auto shrink-0 text-sm font-semibold text-oxblood">Your pick</span>}
                  </button>
                );
              })}
            </div>

            <div aria-live="polite">
              {answered && (
                <div className="mt-5 border-t border-rule pt-4">
                  <p className={`font-semibold ${isCorrect ? 'text-teal' : 'text-oxblood'}`}>
                    {isCorrect ? (solemn ? 'Correct.' : `Correct. +${XP.correct} XP`) : 'Not quite.'}
                  </p>
                  <p className="mt-1 text-ink-soft">
                    <strong className="text-ink">{term.term}</strong>: {term.def}{' '}
                    <span className="text-sm text-muted">
                      (Yawp {term.yawp}, topic {topicById.get(term.topicId)?.id})
                    </span>
                  </p>
                  {!isCorrect && picked && (
                    <p className="mt-2 text-sm text-ink-soft">
                      You picked <strong className="text-ink">{q.kind === 'td' ? `the definition of ${picked.term}` : picked.term}</strong>
                      {q.kind === 'td' ? '.' : `: ${picked.def}.`}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex justify-end">
        <button ref={nextRef} type="button" className="btn btn-primary" disabled={!answered} onClick={next}>
          {index + 1 >= questions.length ? 'See results' : 'Next question'} <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}

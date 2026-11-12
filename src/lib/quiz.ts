/**
 * Multiple-choice question builder. Distractors always come from the SAME
 * topic as the answer so they are plausible, and never from a pair the unit
 * config marks as too close to call.
 */
import { areConfusable, termsOfTopic } from './data';
import { type Rng, shuffle } from './random';
import type { Term } from './types';

export type QuestionKind = 'td' | 'dt';

export interface QuizOption {
  termId: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  termId: string;
  /** td: show the term, pick its definition. dt: show the definition, pick the term. */
  kind: QuestionKind;
  prompt: string;
  options: QuizOption[];
  answer: number;
}

const wordCount = (s: string) => s.trim().split(/\s+/).length;

/** Very short definitions ("War slogan") are too vague to work as prompts. */
export function canAskDefinitionFirst(term: Term): boolean {
  return wordCount(term.def) > 3;
}

export function distractorsFor(term: Term, rng: Rng, n = 3): Term[] {
  const pool = termsOfTopic(term.topicId).filter(
    (t) => t.id !== term.id && !areConfusable(t.id, term.id) && t.def !== term.def && t.term !== term.term,
  );
  return shuffle(pool, rng).slice(0, n);
}

export function buildQuestion(term: Term, rng: Rng, kind?: QuestionKind): QuizQuestion {
  let k: QuestionKind = kind ?? (rng() < 0.5 ? 'td' : 'dt');
  if (k === 'dt' && !canAskDefinitionFirst(term)) k = 'td';
  const choices = shuffle([term, ...distractorsFor(term, rng)], rng);
  return {
    id: `${term.id}#${k}`,
    termId: term.id,
    kind: k,
    prompt: k === 'td' ? term.term : term.def,
    options: choices.map((c) => ({ termId: c.id, text: k === 'td' ? c.def : c.term })),
    answer: choices.findIndex((c) => c.id === term.id),
  };
}

export function buildQuiz(
  pool: Term[],
  count: number,
  rng: Rng,
  mode: 'mixed' | QuestionKind = 'mixed',
): QuizQuestion[] {
  return shuffle(pool, rng)
    .slice(0, count)
    .map((t) => buildQuestion(t, rng, mode === 'mixed' ? undefined : mode));
}

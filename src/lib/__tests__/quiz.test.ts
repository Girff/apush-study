import { describe, expect, it } from 'vitest';
import { areConfusable, termById, terms } from '../data';
import { buildQuestion, buildQuiz, canAskDefinitionFirst } from '../quiz';
import { createRng } from '../random';

describe('quiz builder', () => {
  it('builds a valid question for every term with same-topic distractors', () => {
    const rng = createRng(42);
    for (const term of terms) {
      for (const kind of ['td', 'dt'] as const) {
        const q = buildQuestion(term, rng, kind);
        expect(q.options).toHaveLength(4);
        expect(q.options[q.answer].termId).toBe(term.id);
        const ids = q.options.map((o) => o.termId);
        expect(new Set(ids).size).toBe(4);
        for (const id of ids) {
          expect(termById.get(id)!.topicId).toBe(term.topicId);
          if (id !== term.id) expect(areConfusable(id, term.id)).toBe(false);
        }
        // Options must be distinguishable text.
        expect(new Set(q.options.map((o) => o.text)).size).toBe(4);
      }
    }
  });

  it('never uses a vague three-word definition as a prompt', () => {
    const vague = terms.filter((t) => !canAskDefinitionFirst(t));
    expect(vague.length).toBeGreaterThan(0);
    const rng = createRng(7);
    for (const t of vague) expect(buildQuestion(t, rng, 'dt').kind).toBe('td');
  });

  it('respects the requested count and is reproducible with a seed', () => {
    const a = buildQuiz(terms, 10, createRng(1));
    const b = buildQuiz(terms, 10, createRng(1));
    expect(a).toHaveLength(10);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
});

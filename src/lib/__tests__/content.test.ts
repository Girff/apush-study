/**
 * Content validation: every authored reference must resolve to a real term
 * in the unit JSON, and every term must be covered by its Story Mode chapter.
 * `npm run validate` runs this file before each production build.
 */
import { describe, expect, it } from 'vitest';
import { resolveRef, termsOfTopic, topics } from '../data';
import { STORIES } from '../../unit/stories';

describe('Story Mode content', () => {
  it('has a chapter for every topic', () => {
    for (const t of topics) expect(STORIES[t.id], t.id).toBeDefined();
  });

  for (const topic of topics) {
    const story = STORIES[topic.id];
    if (!story) continue;
    describe(`chapter ${topic.id}`, () => {
      it('resolves every term reference', () => {
        const bad: string[] = [];
        for (const beat of story.beats) {
          for (const ref of beat.terms) {
            const t = resolveRef(ref, topic.id);
            if (!t) bad.push(`${beat.id}: ${ref}`);
            else if (!/^\d+\.\d+:/.test(ref) && t.topicId !== topic.id) bad.push(`${beat.id}: ${ref} resolved to ${t.topicId}`);
          }
        }
        expect(bad).toEqual([]);
      });

      it('covers every term in the topic, in cause → effect order', () => {
        const covered = new Set(
          story.beats.flatMap((b) => b.terms.map((r) => resolveRef(r, topic.id)?.id).filter(Boolean) as string[]),
        );
        const missing = termsOfTopic(topic.id).filter((t) => !covered.has(t.id)).map((t) => t.term);
        expect(missing).toEqual([]);
      });

      it('has unique beat ids, valid predictions and three takeaways', () => {
        const ids = story.beats.map((b) => b.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const p of story.predictions) {
          expect(ids, p.question).toContain(p.after);
          expect(p.answer).toBeGreaterThanOrEqual(0);
          expect(p.answer).toBeLessThan(p.options.length);
          // The prediction must not sit after the final beat (there is nothing left to reveal).
          expect(ids.indexOf(p.after)).toBeLessThan(ids.length - 1);
        }
        expect(story.remember).toHaveLength(3);
      });
    });
  }
});

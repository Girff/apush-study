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

import { CAUSE_LINKS, CAUSE_NODES, EXPERT_CHAINS } from '../../unit/causation';
import { DATE_OVERRIDES, EXTRA_DATES } from '../../unit/timeline';
import { timelineEvents } from '../timeline';

describe('causation web content', () => {
  const ids = new Set(CAUSE_NODES.map((n) => n.id));
  it('has unique nodes whose terms all resolve', () => {
    expect(ids.size).toBe(CAUSE_NODES.length);
    for (const n of CAUSE_NODES) for (const r of n.terms) expect(resolveRef(r), `${n.id}: ${r}`).toBeDefined();
  });
  it('links only existing nodes, once each', () => {
    const seen = new Set<string>();
    for (const l of CAUSE_LINKS) {
      expect(ids.has(l.from), l.from).toBe(true);
      expect(ids.has(l.to), l.to).toBe(true);
      expect(seen.has(`${l.from}>${l.to}`)).toBe(false);
      seen.add(`${l.from}>${l.to}`);
    }
  });
  it('builds every expert chain from real links', () => {
    const has = (a: string, b: string) => CAUSE_LINKS.some((l) => l.from === a && l.to === b);
    for (const c of EXPERT_CHAINS) {
      for (let i = 0; i < c.nodes.length - 1; i++) expect(has(c.nodes[i], c.nodes[i + 1]), `${c.id}: ${c.nodes[i]} → ${c.nodes[i + 1]}`).toBe(true);
      for (const d of c.decoys) {
        expect(ids.has(d), d).toBe(true);
        expect(c.nodes).not.toContain(d);
      }
    }
  });
});

describe('timeline content', () => {
  it('resolves every curated date reference', () => {
    for (const ref of [...Object.keys(DATE_OVERRIDES), ...Object.keys(EXTRA_DATES)]) expect(resolveRef(ref), ref).toBeDefined();
  });
  it('produces a sorted list of dated events', () => {
    const events = timelineEvents();
    expect(events.length).toBeGreaterThan(100);
    for (let i = 1; i < events.length; i++) expect(events[i].start).toBeGreaterThanOrEqual(events[i - 1].start);
    expect(events.find((e) => e.term.term === '1832 Jefferson dinner toasts')).toBeUndefined();
  });
});

import { MAP_FEATURES, MAP_LAYERS } from '../../unit/map';

describe('map content', () => {
  it('uses known layers, unique ids and resolvable terms', () => {
    const layers = new Set(MAP_LAYERS.map((l) => l.id));
    const ids = new Set<string>();
    for (const f of MAP_FEATURES) {
      expect(layers.has(f.layer), f.id).toBe(true);
      expect(ids.has(f.id), f.id).toBe(false);
      ids.add(f.id);
      expect(f.polygon || f.line || f.states || f.point, f.id).toBeTruthy();
      for (const r of f.terms) expect(resolveRef(r), `${f.id}: ${r}`).toBeDefined();
    }
  });
});

import { CLOZE_CHAINS, PEOPLE, SORT_SETS } from '../../unit/games';
import { SAQS } from '../../unit/saq';

describe('arcade content', () => {
  it('Who Am I? people have clues, aliases and real terms', () => {
    for (const p of PEOPLE) {
      expect(p.clues.length, p.id).toBeGreaterThanOrEqual(3);
      expect(p.aliases.every((a) => a === a.toLowerCase())).toBe(true);
      for (const r of p.terms) expect(resolveRef(r), `${p.id}: ${r}`).toBeDefined();
    }
  });
  it('Fill-the-Chain steps each have exactly one resolvable blank', () => {
    for (const c of CLOZE_CHAINS) {
      for (const s of c.steps) {
        const blanks = [...s.matchAll(/\{\{([^}]+)\}\}/g)];
        expect(blanks.length, `${c.id}: ${s}`).toBe(1);
        expect(resolveRef(blanks[0][1]), blanks[0][1]).toBeDefined();
      }
      for (const d of c.decoys) expect(resolveRef(d), d).toBeDefined();
    }
  });
  it('Sort It items resolve and land in a defined bucket', () => {
    for (const set of SORT_SETS) {
      const buckets = new Set(set.buckets.map((b) => b.id));
      for (const it of set.items) {
        expect(resolveRef(it.ref), it.ref).toBeDefined();
        expect(buckets.has(it.bucket), `${set.id}: ${it.ref}`).toBe(true);
      }
    }
  });
  it('SAQ evidence lists resolve', () => {
    for (const q of SAQS) for (const p of q.parts) for (const r of p.evidence) expect(resolveRef(r), `${q.id}${p.label}: ${r}`).toBeDefined();
  });
});

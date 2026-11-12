import { describe, expect, it } from 'vitest';
import { dataIssues, terms, topics, termById, findTerm, isSolemn, areConfusable } from '../data';
import { loadUnit, parseChapters, slugify } from '../loadUnit';
import { CONFUSABLE_PAIRS, SOLEMN_TERMS, TOPIC_MOTIF, TOPIC_THEME, UNIT } from '../../unit/config';

describe('unit data', () => {
  it('loads every topic and all 361 terms with no issues', () => {
    expect(dataIssues).toEqual([]);
    expect(topics).toHaveLength(UNIT.expectedTopicCount);
    expect(terms).toHaveLength(UNIT.expectedTermCount);
    expect(termById.size).toBe(UNIT.expectedTermCount);
  });

  it('keeps every field exactly as written in the JSON', () => {
    const raw = UNIT.raw as Array<{ id: string; terms: Array<{ term: string; def: string; yawp: string }> }>;
    for (const topic of raw) {
      for (const r of topic.terms) {
        const t = findTerm(r.term, topic.id);
        expect(t, r.term).toBeDefined();
        expect(t!.def).toBe(r.def);
        expect(t!.yawp).toBe(r.yawp);
        expect(t!.topicId).toBe(topic.id);
      }
    }
  });

  it('gives every topic a theme and a motif', () => {
    for (const t of topics) {
      expect(TOPIC_THEME[t.id], t.id).toBeDefined();
      expect(TOPIC_MOTIF[t.id], t.id).toBeDefined();
    }
  });

  it('resolves every solemn and confusable term reference', () => {
    for (const [topicId, name] of SOLEMN_TERMS) {
      const t = findTerm(name, topicId);
      expect(t?.topicId, `${topicId} ${name}`).toBe(topicId);
      expect(isSolemn(t!.id)).toBe(true);
    }
    for (const [topicId, a, b] of CONFUSABLE_PAIRS) {
      const ta = findTerm(a, topicId);
      const tb = findTerm(b, topicId);
      expect(ta?.topicId, a).toBe(topicId);
      expect(tb?.topicId, b).toBe(topicId);
      expect(areConfusable(ta!.id, tb!.id)).toBe(true);
    }
  });
});

describe('loadUnit helpers', () => {
  it('slugifies quotes, degree marks and slashes', () => {
    expect(slugify('"Panics"')).toBe('panics');
    expect(slugify('36°30′ line')).toBe('36-30-line');
    expect(slugify('James Callender / Sally Hemings')).toBe('james-callender-sally-hemings');
  });

  it('parses Yawp chapters', () => {
    expect(parseChapters('7.I–IV')).toEqual([7]);
    expect(parseChapters('9.XI, 10.IV, 11.VI')).toEqual([9, 10, 11]);
    expect(parseChapters('10.I, 8.VI')).toEqual([8, 10]);
  });

  it('reports malformed files instead of throwing', () => {
    expect(loadUnit({}).issues).toHaveLength(1);
    const res = loadUnit([{ id: 'x', title: 'X', intro: '', terms: [{ term: 'A', def: '', yawp: '1.I' }] }]);
    expect(res.issues.length).toBeGreaterThan(0);
    expect(res.terms).toHaveLength(0);
  });
});

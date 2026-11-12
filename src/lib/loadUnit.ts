import type { DataIssue, RawTopic, Term, Topic } from './types';

/**
 * Turn a term name into a URL-safe slug. Quotes, apostrophes and degree
 * marks are dropped so `"Panics"` → `panics` and `36°30′ line` → `36-30-line`.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['"’‘“”′″]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "10.I, 11.IV" → [10, 11]; "7.I–IV" → [7]. */
export function parseChapters(yawp: string): number[] {
  const found = new Set<number>();
  for (const match of yawp.matchAll(/(\d+)\./g)) found.add(Number(match[1]));
  return [...found].sort((a, b) => a - b);
}

const YAWP_PATTERN = /^\d+\.[IVXL]+(?:[–-][IVXL]+)?(?:,\s*\d+\.[IVXL]+(?:[–-][IVXL]+)?)*$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate and index a unit file. Never throws: problems are returned in
 * `issues` so the UI and the test suite can report them precisely.
 */
export function loadUnit(raw: unknown): { topics: Topic[]; terms: Term[]; issues: DataIssue[] } {
  const issues: DataIssue[] = [];
  const topics: Topic[] = [];
  const terms: Term[] = [];

  if (!Array.isArray(raw)) {
    issues.push({ path: '$', message: 'Unit file must be a JSON array of topics.' });
    return { topics, terms, issues };
  }

  const topicIds = new Set<string>();
  const termIds = new Set<string>();

  raw.forEach((candidate, topicIndex) => {
    const path = `$[${topicIndex}]`;
    const t = candidate as Partial<RawTopic> | null;
    if (!t || typeof t !== 'object') {
      issues.push({ path, message: 'Topic must be an object.' });
      return;
    }
    if (!isNonEmptyString(t.id)) issues.push({ path: `${path}.id`, message: 'Missing topic id.' });
    if (!isNonEmptyString(t.title)) issues.push({ path: `${path}.title`, message: 'Missing topic title.' });
    if (typeof t.intro !== 'string') issues.push({ path: `${path}.intro`, message: 'intro must be a string (may be empty).' });
    if (!Array.isArray(t.terms)) {
      issues.push({ path: `${path}.terms`, message: 'terms must be an array.' });
      return;
    }
    const topicId = String(t.id ?? `topic-${topicIndex}`);
    if (topicIds.has(topicId)) issues.push({ path: `${path}.id`, message: `Duplicate topic id ${topicId}.` });
    topicIds.add(topicId);

    const topic: Topic = {
      id: topicId,
      title: String(t.title ?? ''),
      intro: typeof t.intro === 'string' ? t.intro : '',
      terms: [],
      order: topicIndex,
    };

    t.terms.forEach((rawTerm, termIndex) => {
      const termPath = `${path}.terms[${termIndex}]`;
      const r = rawTerm as Partial<{ term: unknown; yawp: unknown; def: unknown }> | null;
      if (!r || !isNonEmptyString(r.term) || !isNonEmptyString(r.def) || !isNonEmptyString(r.yawp)) {
        issues.push({ path: termPath, message: 'Term needs non-empty "term", "yawp" and "def" strings.' });
        return;
      }
      if (!YAWP_PATTERN.test(r.yawp)) {
        issues.push({ path: `${termPath}.yawp`, message: `Unrecognised Yawp citation "${r.yawp}".` });
      }
      const id = `${topicId}~${slugify(r.term)}`;
      if (termIds.has(id)) {
        issues.push({ path: termPath, message: `Duplicate term "${r.term}" within topic ${topicId}.` });
        return;
      }
      termIds.add(id);
      const term: Term = {
        id,
        term: r.term,
        yawp: r.yawp,
        def: r.def,
        topicId,
        index: termIndex,
        chapters: parseChapters(r.yawp),
      };
      topic.terms.push(term);
      terms.push(term);
    });

    topics.push(topic);
  });

  return { topics, terms, issues };
}

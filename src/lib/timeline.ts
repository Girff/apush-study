/** Builds the list of dated events for the Living Timeline and the ordering game. */
import { CAUSE_LINKS, CAUSE_NODES, type CauseNode } from '../unit/causation';
import { TOPIC_THEME } from '../unit/config';
import { DATE_OVERRIDES, EXTRA_DATES } from '../unit/timeline';
import { resolveRef, terms } from './data';
import { type ParsedDate, parseTermDate } from './dates';
import type { Term, ThemeId } from './types';

export interface TimelineEvent extends ParsedDate {
  term: Term;
  theme: ThemeId;
  /** Where the date came from: the term name, or a curated entry. */
  source: 'name' | 'curated';
}

let cache: TimelineEvent[] | null = null;

export function timelineEvents(): TimelineEvent[] {
  if (cache) return cache;
  const overrides = new Map<string, ParsedDate | null>();
  for (const [ref, d] of Object.entries(DATE_OVERRIDES)) {
    const t = resolveRef(ref);
    if (t) overrides.set(t.id, d);
  }
  const extras = new Map<string, ParsedDate>();
  for (const [ref, d] of Object.entries(EXTRA_DATES)) {
    const t = resolveRef(ref);
    if (t) extras.set(t.id, d);
  }
  const out: TimelineEvent[] = [];
  for (const term of terms) {
    let date: ParsedDate | null = parseTermDate(term.term);
    let source: TimelineEvent['source'] = 'name';
    if (overrides.has(term.id)) {
      date = overrides.get(term.id) ?? null;
      source = 'curated';
    } else if (!date && extras.has(term.id)) {
      date = extras.get(term.id)!;
      source = 'curated';
    }
    if (date) out.push({ ...date, term, theme: TOPIC_THEME[term.topicId] ?? 'prologue', source });
  }
  cache = out.sort((a, b) => a.start - b.start || (a.end ?? a.start) - (b.end ?? b.start));
  return cache;
}

const nodeTermIds = new Map<string, string[]>(
  CAUSE_NODES.map((n) => [n.id, n.terms.map((r) => resolveRef(r)?.id).filter((x): x is string => !!x)]),
);

export function nodesForTerm(termId: string): CauseNode[] {
  return CAUSE_NODES.filter((n) => nodeTermIds.get(n.id)?.includes(termId));
}

export function nodeTerms(nodeId: string): string[] {
  return nodeTermIds.get(nodeId) ?? [];
}

/** "Caused by" and "led to" links for a term, via the causation nodes it belongs to. */
export function causalContext(termId: string) {
  const nodes = nodesForTerm(termId);
  const ids = new Set(nodes.map((n) => n.id));
  const byId = new Map(CAUSE_NODES.map((n) => [n.id, n]));
  return {
    nodes,
    causedBy: CAUSE_LINKS.filter((l) => ids.has(l.to) && !ids.has(l.from)).map((l) => ({ node: byId.get(l.from)!, why: l.why })),
    ledTo: CAUSE_LINKS.filter((l) => ids.has(l.from) && !ids.has(l.to)).map((l) => ({ node: byId.get(l.to)!, why: l.why })),
  };
}

export function formatYear(y: number): string {
  return String(Math.floor(y));
}

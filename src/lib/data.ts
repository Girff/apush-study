/**
 * The data layer. The unit JSON is imported at build time, validated, and
 * indexed once. Every component reads terms from here, never from copies.
 */
import { CONFUSABLE_PAIRS, SOLEMN_TERMS, THEMES, TOPIC_THEME, UNIT } from '../unit/config';
import { loadUnit } from './loadUnit';
import type { Term, Theme, ThemeId, Topic } from './types';

const loaded = loadUnit(UNIT.raw);

export const topics: Topic[] = loaded.topics;
export const terms: Term[] = loaded.terms;
export const dataIssues = loaded.issues;

export const termById = new Map<string, Term>(terms.map((t) => [t.id, t]));
export const topicById = new Map<string, Topic>(topics.map((t) => [t.id, t]));

if (import.meta.env?.DEV) {
  if (dataIssues.length) console.warn('[data] Unit file issues:', dataIssues);
  if (terms.length !== UNIT.expectedTermCount) {
    console.warn(`[data] Expected ${UNIT.expectedTermCount} terms, loaded ${terms.length}.`);
  }
}

const themeMap = new Map<ThemeId, Theme>(THEMES.map((t) => [t.id, t]));

export function themeOfTopic(topicId: string): Theme {
  return themeMap.get(TOPIC_THEME[topicId] ?? 'prologue') ?? THEMES[0];
}

export function themeById(id: ThemeId): Theme {
  return themeMap.get(id) ?? THEMES[0];
}

export function topicsInTheme(id: ThemeId): Topic[] {
  return topics.filter((t) => (TOPIC_THEME[t.id] ?? 'prologue') === id);
}

/** Look up a term by its exact name, preferring the given topic. */
export function findTerm(name: string, topicId?: string): Term | undefined {
  if (topicId) {
    const inTopic = topicById.get(topicId)?.terms.find((t) => t.term === name);
    if (inTopic) return inTopic;
  }
  return terms.find((t) => t.term === name);
}

/** Resolve "4.4:Term name" or "Term name" (with a default topic). */
export function resolveRef(ref: string, defaultTopic?: string): Term | undefined {
  const m = /^(\d+\.\d+):(.+)$/.exec(ref);
  if (m) return findTerm(m[2], m[1]);
  return findTerm(ref, defaultTopic);
}

const solemnIds = new Set<string>();
for (const [topicId, name] of SOLEMN_TERMS) {
  const t = findTerm(name, topicId);
  if (t && t.topicId === topicId) solemnIds.add(t.id);
}

/** True for terms that must never get celebratory feedback. */
export function isSolemn(termId: string): boolean {
  return solemnIds.has(termId);
}

const confusable = new Set<string>();
for (const [topicId, a, b] of CONFUSABLE_PAIRS) {
  const ta = findTerm(a, topicId);
  const tb = findTerm(b, topicId);
  if (ta && tb) {
    confusable.add(`${ta.id}|${tb.id}`);
    confusable.add(`${tb.id}|${ta.id}`);
  }
}

export function areConfusable(aId: string, bId: string): boolean {
  return confusable.has(`${aId}|${bId}`);
}

export const allChapters: number[] = [...new Set(terms.flatMap((t) => t.chapters))].sort((a, b) => a - b);

export function termsOfTopic(topicId: string): Term[] {
  return topicById.get(topicId)?.terms ?? [];
}

export function topicLabel(topicId: string): string {
  const t = topicById.get(topicId);
  return t ? `${t.id} ${t.title}` : topicId;
}

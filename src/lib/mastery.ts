/**
 * Mastery model. Each term gets a 0–1 score blending spaced-repetition
 * strength (how far out its flashcards are scheduled) with answer accuracy
 * across every game. Accuracy is smoothed so one lucky answer is not
 * "mastered": it takes about five correct answers in a row to reach 0.8.
 */
import { termById, terms, topicById } from './data';
import { cardKey, strength } from './srs';
import type { SrsCard } from './srs';

interface MasterySource {
  srs: Record<string, SrsCard>;
  terms: Record<string, { c: number; w: number; last: number }>;
}

export type MasteryStatus = 'new' | 'learning' | 'familiar' | 'mastered';

export function termMastery(termId: string, s: MasterySource): number {
  const td = s.srs[cardKey(termId, 'td')];
  const dt = s.srs[cardKey(termId, 'dt')];
  const hasCards = !!(td || dt);
  const srsScore = Math.max(strength(td), strength(dt));
  const stat = s.terms[termId];
  const attempts = stat ? stat.c + stat.w : 0;
  if (!attempts) return hasCards ? srsScore : 0;
  const accuracy = stat!.c / (attempts + 1);
  if (!hasCards) return accuracy * Math.min(1, attempts / 3);
  return 0.55 * srsScore + 0.45 * accuracy;
}

export function isSeen(termId: string, s: MasterySource): boolean {
  const stat = s.terms[termId];
  return !!(stat && stat.c + stat.w > 0) || !!s.srs[cardKey(termId, 'td')] || !!s.srs[cardKey(termId, 'dt')];
}

export function masteryStatus(termId: string, s: MasterySource): MasteryStatus {
  if (!isSeen(termId, s)) return 'new';
  const m = termMastery(termId, s);
  if (m >= 0.8) return 'mastered';
  if (m >= 0.4) return 'familiar';
  return 'learning';
}

export const STATUS_LABEL: Record<MasteryStatus, string> = {
  new: 'Not yet studied',
  learning: 'Learning',
  familiar: 'Familiar',
  mastered: 'Mastered',
};

export function topicMastery(topicId: string, s: MasterySource): number {
  const topic = topicById.get(topicId);
  if (!topic || !topic.terms.length) return 0;
  return topic.terms.reduce((sum, t) => sum + termMastery(t.id, s), 0) / topic.terms.length;
}

export function overallMastery(s: MasterySource): number {
  if (!terms.length) return 0;
  return terms.reduce((sum, t) => sum + termMastery(t.id, s), 0) / terms.length;
}

export function statusCounts(s: MasterySource, ids: string[] = terms.map((t) => t.id)) {
  const counts: Record<MasteryStatus, number> = { new: 0, learning: 0, familiar: 0, mastered: 0 };
  for (const id of ids) counts[masteryStatus(id, s)]++;
  return counts;
}

/** Seen terms with the lowest mastery (ties broken by most misses). */
export function weakestTerms(s: MasterySource, n = 10) {
  return terms
    .filter((t) => isSeen(t.id, s))
    .map((t) => ({ term: t, mastery: termMastery(t.id, s), misses: s.terms[t.id]?.w ?? 0 }))
    .filter((x) => x.mastery < 0.8)
    .sort((a, b) => a.mastery - b.mastery || b.misses - a.misses)
    .slice(0, n);
}

export function termOrThrow(id: string) {
  const t = termById.get(id);
  if (!t) throw new Error(`Unknown term ${id}`);
  return t;
}

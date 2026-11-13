/**
 * What a card's history means for the student:
 *   new      never answered
 *   learning missed on its last review (or never yet recalled)
 *   known    recalled; next review is less than three weeks out
 *   mastered recalled across spaced reviews; next review is 21+ days out
 * When both directions have been studied, the weaker one decides.
 */
import { type Direction, type SrsCard } from './srs';
import type { Progress } from './store';

export type Status = 'new' | 'learning' | 'known' | 'mastered';
export const STATUSES: Status[] = ['mastered', 'known', 'learning', 'new'];
export const STATUS_LABEL: Record<Status, string> = { new: 'New', learning: 'Learning', known: 'Known', mastered: 'Mastered' };
export const MASTERED_DAYS = 21;

const RANK: Record<Exclude<Status, 'new'>, number> = { learning: 0, known: 1, mastered: 2 };

export function directionStatus(c: SrsCard): Exclude<Status, 'new'> {
  if (c.reps === 0) return 'learning';
  return c.interval >= MASTERED_DAYS ? 'mastered' : 'known';
}

export function cardStatus(p: Progress, id: string): Status {
  const a = p.srs[`${id}>td`];
  const b = p.srs[`${id}>dt`];
  if (!a && !b) return 'new';
  if (!a) return directionStatus(b!);
  if (!b) return directionStatus(a);
  const sa = directionStatus(a);
  const sb = directionStatus(b);
  return RANK[sa] <= RANK[sb] ? sa : sb;
}

export function isNewCard(p: Progress, id: string): boolean {
  return !p.srs[`${id}>td`] && !p.srs[`${id}>dt`];
}

/** Still learning, or forgotten at least twice after being learned. */
export function isWeak(p: Progress, id: string): boolean {
  if (isNewCard(p, id)) return false;
  if (cardStatus(p, id) === 'learning') return true;
  const lapses = (p.srs[`${id}>td`]?.lapses ?? 0) + (p.srs[`${id}>dt`]?.lapses ?? 0);
  return lapses >= 2;
}

/** The earliest due time among the given directions that have been studied, or null. */
export function dueAt(p: Progress, id: string, dirs: Direction[]): number | null {
  let best: number | null = null;
  for (const d of dirs) {
    const c = p.srs[`${id}>${d}`];
    if (c && (best === null || c.due < best)) best = c.due;
  }
  return best;
}

export function isDue(p: Progress, id: string, dirs: Direction[], now: number): boolean {
  const t = dueAt(p, id, dirs);
  return t !== null && t <= now;
}

export type StatusCounts = Record<Status, number>;

export function countStatuses(p: Progress, ids: string[]): StatusCounts {
  const out: StatusCounts = { new: 0, learning: 0, known: 0, mastered: 0 };
  for (const id of ids) out[cardStatus(p, id)]++;
  return out;
}

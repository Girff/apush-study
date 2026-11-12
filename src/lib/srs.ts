/**
 * Spaced repetition using the SM-2 algorithm (Wozniak, 1990) with four
 * buttons. "Again" puts the card back into today's queue in 10 minutes;
 * passing grades schedule it whole days out, at local midnight.
 */
export type Grade = 'again' | 'hard' | 'good' | 'easy';
/** td = term → definition, dt = definition → term. */
export type Direction = 'td' | 'dt';

export interface SrsCard {
  /** Ease factor (≥ 1.3). */
  ef: number;
  /** Interval in days. 0 while relearning. */
  interval: number;
  /** Consecutive successful reviews. */
  reps: number;
  lapses: number;
  /** Epoch ms when the card is next due. */
  due: number;
  /** Epoch ms of the last review. */
  last: number;
}

export const MINUTE = 60_000;
export const DAY = 86_400_000;

const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

export function cardKey(termId: string, dir: Direction): string {
  return `${termId}>${dir}`;
}

export function parseCardKey(key: string): { termId: string; dir: Direction } | null {
  const i = key.lastIndexOf('>');
  if (i < 0) return null;
  const dir = key.slice(i + 1);
  if (dir !== 'td' && dir !== 'dt') return null;
  return { termId: key.slice(0, i), dir };
}

export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfDay(ms: number): number {
  return startOfDay(ms) + DAY - 1;
}

export function review(card: SrsCard | undefined, grade: Grade, now: number): SrsCard {
  const q = QUALITY[grade];
  const prev: SrsCard = card ?? { ef: 2.5, interval: 0, reps: 0, lapses: 0, due: now, last: now };
  let { ef, interval, reps, lapses } = prev;

  ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (q < 3) {
    return { ef, interval: 0, reps: 0, lapses: lapses + (card && card.reps > 0 ? 1 : 0), due: now + 10 * MINUTE, last: now };
  }

  if (reps === 0) {
    interval = q === 5 ? 3 : 1;
  } else if (reps === 1) {
    interval = q === 3 ? 3 : q === 5 ? 8 : 6;
  } else {
    const factor = q === 3 ? 0.8 : q === 5 ? 1.3 : 1;
    interval = Math.max(interval + 1, Math.round(interval * ef * factor));
  }
  reps += 1;
  return { ef, interval, reps, lapses, due: startOfDay(now) + interval * DAY, last: now };
}

/** Human-readable preview of the next interval for a grade (for button labels). */
export function previewInterval(card: SrsCard | undefined, grade: Grade, now: number): string {
  const next = review(card, grade, now);
  if (next.interval === 0) return '10 min';
  if (next.interval === 1) return '1 day';
  if (next.interval < 30) return `${next.interval} days`;
  const months = Math.round(next.interval / 30);
  return months <= 1 ? '1 month' : `${months} months`;
}

export function isDue(card: SrsCard, now: number): boolean {
  return card.due <= now;
}

/** 0–1 memory strength used by the mastery model. */
export function strength(card: SrsCard | undefined): number {
  if (!card) return 0;
  if (card.reps === 0) return 0.1;
  return Math.min(1, 0.25 + card.interval / 28);
}

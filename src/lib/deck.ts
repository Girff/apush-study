/** Builds the flashcard queue: due reviews first, then a capped batch of new cards. */
import { topicById } from './data';
import type { ProgressState } from './progress';
import { type Direction, cardKey, endOfDay } from './srs';

export type DirectionMode = Direction | 'both';

export interface QueueCard {
  termId: string;
  dir: Direction;
}

function candidates(topicIds: string[], mode: DirectionMode): QueueCard[] {
  const dirs: Direction[] = mode === 'both' ? ['td', 'dt'] : [mode];
  return topicIds.flatMap((id) => (topicById.get(id)?.terms ?? []).flatMap((t) => dirs.map((dir) => ({ termId: t.id, dir }))));
}

export function deckStats(s: ProgressState, topicIds: string[], mode: DirectionMode, now = Date.now()) {
  const all = candidates(topicIds, mode);
  const cutoff = endOfDay(now);
  let due = 0;
  let fresh = 0;
  let learned = 0;
  for (const c of all) {
    const card = s.srs[cardKey(c.termId, c.dir)];
    if (!card) fresh++;
    else if (card.due <= cutoff) due++;
    else learned++;
  }
  return { total: all.length, due, fresh, learned };
}

export function buildQueue(s: ProgressState, topicIds: string[], mode: DirectionMode, newLimit: number, now = Date.now()): QueueCard[] {
  const all = candidates(topicIds, mode);
  const cutoff = endOfDay(now);
  const due = all
    .filter((c) => {
      const card = s.srs[cardKey(c.termId, c.dir)];
      return card && card.due <= cutoff;
    })
    .sort((a, b) => s.srs[cardKey(a.termId, a.dir)].due - s.srs[cardKey(b.termId, b.dir)].due);
  const fresh = all.filter((c) => !s.srs[cardKey(c.termId, c.dir)]).slice(0, newLimit);
  // Weave new cards in after every few reviews so a session never front-loads
  // all the unfamiliar material.
  const out: QueueCard[] = [];
  let i = 0;
  let j = 0;
  while (i < due.length || j < fresh.length) {
    for (let k = 0; k < 3 && i < due.length; k++) out.push(due[i++]);
    if (j < fresh.length) out.push(fresh[j++]);
  }
  return out;
}

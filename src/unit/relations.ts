/**
 * Authored groupings used to compute "related terms". Each group lists term
 * references (exact names; "4.4:Name" for another topic). Story beats and
 * causation-web nodes are folded in automatically.
 */
import { CAUSE_NODES } from './causation';
import { STORIES } from './stories';

export interface RelationGroup {
  topicId?: string;
  refs: string[];
  weight?: number;
}

const fromStories: RelationGroup[] = Object.entries(STORIES).flatMap(([topicId, story]) =>
  story.beats.map((b) => ({ topicId, refs: b.terms, weight: 2 })),
);

const fromCausation: RelationGroup[] = CAUSE_NODES.map((n) => ({ refs: n.terms, weight: 2 }));

export const RELATION_GROUPS: RelationGroup[] = [...fromStories, ...fromCausation];

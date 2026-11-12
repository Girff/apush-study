import { termRefs } from '../../lib/markup';
import type { Story, StorySource } from '../types';

const SOURCES: Record<string, StorySource> = {};

function compile(topicId: string, src: StorySource): Story {
  return {
    ...src,
    topicId,
    beats: src.beats.map((b) => ({ ...b, terms: [...new Set([...termRefs(b.text), ...(b.extra ?? [])])] })),
  };
}

export const STORIES: Record<string, Story> = Object.fromEntries(
  Object.entries(SOURCES).map(([id, src]) => [id, compile(id, src)]),
);

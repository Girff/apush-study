import { termRefs } from '../../lib/markup';
import type { Story, StorySource } from '../types';
import { story as s41 } from './s4-1';
import { story as s42 } from './s4-2';
import { story as s43 } from './s4-3';
import { story as s44 } from './s4-4';
import { story as s45 } from './s4-5';
import { story as s46 } from './s4-6';
import { story as s47 } from './s4-7';
import { story as s48 } from './s4-8';
import { story as s49 } from './s4-9';
import { story as s410 } from './s4-10';
import { story as s411 } from './s4-11';
import { story as s412 } from './s4-12';
import { story as s413 } from './s4-13';

/**
 * Authored Story Mode chapters keyed by topic id. A topic without an entry
 * still gets a chapter: StoryChapter falls back to the JSON order.
 */
const SOURCES: Record<string, StorySource> = {
  '4.1': s41,
  '4.2': s42,
  '4.3': s43,
  '4.4': s44,
  '4.5': s45,
  '4.6': s46,
  '4.7': s47,
  '4.8': s48,
  '4.9': s49,
  '4.10': s410,
  '4.11': s411,
  '4.12': s412,
  '4.13': s413,
};

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

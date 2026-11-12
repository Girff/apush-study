/** Types for authored unit content (everything beyond the term JSON). */
import type { MotifId } from '../lib/types';

export interface StoryBeatSource {
  id: string;
  /** Year or short label shown on the sticky plate. */
  marker: string;
  heading: string;
  /** Narrative with [[Term]] / [[4.4:Term|label]] markup. */
  text: string;
  /** Terms this beat covers that the prose does not name directly. */
  extra?: string[];
  motif?: MotifId;
}

export interface StoryBeat extends StoryBeatSource {
  /** Every term reference in the beat (prose first, then extras). */
  terms: string[];
}

export interface Prediction {
  /** Shown after the beat with this id, before the next one. */
  after: string;
  question: string;
  options: string[];
  answer: number;
  /** One or two sentences revealed after the student commits. */
  reveal: string;
}

export interface StorySource {
  beats: StoryBeatSource[];
  predictions: Prediction[];
  remember: [string, string, string];
}

export interface Story extends Omit<StorySource, 'beats'> {
  topicId: string;
  beats: StoryBeat[];
}

/** Shape of the unit JSON file (the single source of truth for terms). */
export interface RawTerm {
  term: string;
  yawp: string;
  def: string;
}

export interface RawTopic {
  id: string;
  title: string;
  intro: string;
  terms: RawTerm[];
}

/** A term after loading: the raw fields plus stable IDs and derived lookups. */
export interface Term {
  /** Stable ID: `${topicId}~${slug}`. Used as the key for all saved progress. */
  id: string;
  term: string;
  yawp: string;
  def: string;
  topicId: string;
  /** Position within the topic's `terms` array. */
  index: number;
  /** Yawp chapter numbers parsed from `yawp` (e.g. "10.I, 11.IV" → [10, 11]). */
  chapters: number[];
}

export interface Topic {
  id: string;
  title: string;
  intro: string;
  terms: Term[];
  /** Zero-based order in the unit file. */
  order: number;
}

export type ThemeId = 'prologue' | 'politics' | 'economy' | 'culture';

export interface Theme {
  id: ThemeId;
  label: string;
  short: string;
  blurb: string;
  /** CSS custom property name for the theme's accent colour. */
  colorVar: string;
}

export type MotifId =
  | 'compass'
  | 'ballot'
  | 'scales'
  | 'ship'
  | 'canal'
  | 'loom'
  | 'broadside'
  | 'bank'
  | 'press'
  | 'tent'
  | 'petition'
  | 'church'
  | 'cotton';

export interface DataIssue {
  path: string;
  message: string;
}

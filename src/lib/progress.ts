/**
 * Saved progress: SRS cards, per-term accuracy, XP, streaks, badges, quiz
 * history and game bests. One JSON document in localStorage (via the safe
 * wrapper), exposed to React through useSyncExternalStore.
 */
import { useSyncExternalStore } from 'react';
import { ALL_BADGES, TOPIC_BADGE_THRESHOLD, UNIT } from '../unit/config';
import { topics } from './data';
import { topicMastery } from './mastery';
import { notify } from './notify';
import { readItem, writeItem } from './storage';
import { type Direction, type Grade, type SrsCard, cardKey, review } from './srs';

export interface TermStat {
  /** Correct answers across all games. */
  c: number;
  /** Wrong answers across all games. */
  w: number;
  /** Epoch ms of the last answer. */
  last: number;
}

export interface QuizRecord {
  id: string;
  at: number;
  mode: string;
  topicIds: string[];
  score: number;
  total: number;
  missed: string[];
}

export interface DayActivity {
  xp: number;
  n: number;
}

export interface SaqRecord {
  answers: string[];
  checks: boolean[];
  selfScore: number;
  at: number;
}

export interface ProgressState {
  v: 1;
  unit: string;
  createdAt: number;
  xp: number;
  srs: Record<string, SrsCard>;
  terms: Record<string, TermStat>;
  quizzes: QuizRecord[];
  activity: Record<string, DayActivity>;
  badges: Record<string, number>;
  bests: Record<string, number>;
  story: Record<string, { done: boolean; at: number }>;
  predictions: Record<string, number>;
  saq: Record<string, SaqRecord>;
  reviews: number;
  last?: { path: string; label: string; at: number };
}

export const XP = {
  review: 2,
  reviewAgain: 1,
  correct: 5,
  quizDone: 10,
  story: 25,
  predict: 2,
  speedRound: 15,
  chain: 15,
  sort: 10,
  saq: 20,
  timelineRound: 10,
  fillChain: 10,
} as const;

function emptyState(): ProgressState {
  return {
    v: 1,
    unit: UNIT.id,
    createdAt: Date.now(),
    xp: 0,
    srs: {},
    terms: {},
    quizzes: [],
    activity: {},
    badges: {},
    bests: {},
    story: {},
    predictions: {},
    saq: {},
    reviews: 0,
  };
}

// ---------- validation ----------

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function pickRecord<T>(raw: unknown, check: (v: unknown) => v is T): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isObj(raw)) return out;
  for (const [k, v] of Object.entries(raw)) if (check(v)) out[k] = v;
  return out;
}

const isCard = (v: unknown): v is SrsCard =>
  isObj(v) && isNum(v.ef) && isNum(v.interval) && isNum(v.reps) && isNum(v.lapses) && isNum(v.due) && isNum(v.last);
const isStat = (v: unknown): v is TermStat => isObj(v) && isNum(v.c) && isNum(v.w) && isNum(v.last);
const isDay = (v: unknown): v is DayActivity => isObj(v) && isNum(v.xp) && isNum(v.n);
const isStory = (v: unknown): v is { done: boolean; at: number } => isObj(v) && typeof v.done === 'boolean' && isNum(v.at);
const isSaq = (v: unknown): v is SaqRecord =>
  isObj(v) && Array.isArray(v.answers) && Array.isArray(v.checks) && isNum(v.selfScore) && isNum(v.at);
const isQuiz = (v: unknown): v is QuizRecord =>
  isObj(v) &&
  typeof v.id === 'string' &&
  isNum(v.at) &&
  typeof v.mode === 'string' &&
  Array.isArray(v.topicIds) &&
  isNum(v.score) &&
  isNum(v.total) &&
  Array.isArray(v.missed);

/** Accepts anything; returns a well-formed state (or throws for wrong unit). */
export function sanitize(raw: unknown): ProgressState {
  const base = emptyState();
  if (!isObj(raw)) return base;
  if (typeof raw.unit === 'string' && raw.unit !== UNIT.id) {
    throw new Error(`This progress file is for "${raw.unit}", not "${UNIT.id}".`);
  }
  return {
    ...base,
    createdAt: isNum(raw.createdAt) ? raw.createdAt : base.createdAt,
    xp: isNum(raw.xp) ? Math.max(0, raw.xp) : 0,
    srs: pickRecord(raw.srs, isCard),
    terms: pickRecord(raw.terms, isStat),
    quizzes: Array.isArray(raw.quizzes) ? raw.quizzes.filter(isQuiz).slice(-200) : [],
    activity: pickRecord(raw.activity, isDay),
    badges: pickRecord(raw.badges, isNum),
    bests: pickRecord(raw.bests, isNum),
    story: pickRecord(raw.story, isStory),
    predictions: pickRecord(raw.predictions, isNum),
    saq: pickRecord(raw.saq, isSaq),
    reviews: isNum(raw.reviews) ? raw.reviews : 0,
    last:
      isObj(raw.last) && typeof raw.last.path === 'string' && typeof raw.last.label === 'string' && isNum(raw.last.at)
        ? { path: raw.last.path, label: raw.last.label, at: raw.last.at }
        : undefined,
  };
}

function load(): ProgressState {
  const text = readItem(UNIT.storageKey);
  if (!text) return emptyState();
  try {
    return sanitize(JSON.parse(text));
  } catch {
    return emptyState();
  }
}

// ---------- store ----------

let state: ProgressState = load();
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let lastSaveOk = true;

function persistNow() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = undefined;
  lastSaveOk = writeItem(UNIT.storageKey, JSON.stringify(state));
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, 250);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', persistNow);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistNow();
  });
  window.addEventListener('storage', (e) => {
    if (e.key !== UNIT.storageKey || e.newValue == null) return;
    try {
      state = sanitize(JSON.parse(e.newValue));
      listeners.forEach((l) => l());
    } catch {
      /* ignore foreign writes */
    }
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next: ProgressState, opts: { evaluate?: boolean } = {}) {
  state = next;
  if (opts.evaluate !== false) state = evaluateBadges(state);
  scheduleSave();
  listeners.forEach((l) => l());
}

export function getProgress(): ProgressState {
  return state;
}

/** Subscribe to the whole state. Derive values with useMemo in the caller. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}

export function lastSaveSucceeded(): boolean {
  return lastSaveOk;
}

// ---------- dates & streaks ----------

export function dayKey(ms: number = Date.now()): string {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function currentStreak(s: ProgressState, now: number = Date.now()): number {
  let streak = 0;
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  if (!s.activity[dayKey(d.getTime())]) d.setDate(d.getDate() - 1);
  while (s.activity[dayKey(d.getTime())]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function longestStreak(s: ProgressState): number {
  const days = Object.keys(s.activity).sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const k of days) {
    const [y, m, d] = k.split('-').map(Number);
    const t = new Date(y, m - 1, d, 12).getTime();
    run = prev !== null && Math.round((t - prev) / 86_400_000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

// ---------- badges ----------

function evaluateBadges(s: ProgressState): ProgressState {
  const earned: string[] = [];
  const has = (id: string) => s.badges[id] !== undefined || earned.includes(id);
  const award = (id: string) => {
    if (!has(id)) earned.push(id);
  };

  if (s.xp >= 50) award('xp-50');
  if (s.xp >= 500) award('xp-500');
  if (s.xp >= 2000) award('xp-2000');
  const streak = currentStreak(s);
  if (streak >= 3) award('streak-3');
  if (streak >= 7) award('streak-7');
  if (s.reviews >= 100) award('reviews-100');
  if (topics.every((t) => s.story[t.id]?.done)) award('story-all');
  for (const t of topics) {
    if (!has(`topic-${t.id}`) && topicMastery(t.id, s) >= TOPIC_BADGE_THRESHOLD) award(`topic-${t.id}`);
  }

  if (!earned.length) return s;
  const now = Date.now();
  const badges = { ...s.badges };
  for (const id of earned) {
    badges[id] = now;
    const def = ALL_BADGES.find((b) => b.id === id);
    if (def) notify({ kind: 'badge', title: def.name, body: def.description, solemn: def.solemn });
  }
  return { ...s, badges };
}

/** Award a badge. `quiet` keeps the notice plain (used when the context is a tragic event). */
export function awardBadge(id: string, opts: { quiet?: boolean } = {}) {
  if (state.badges[id] !== undefined) return;
  const def = ALL_BADGES.find((b) => b.id === id);
  if (def) notify({ kind: 'badge', title: def.name, body: def.description, solemn: def.solemn || opts.quiet });
  commit({ ...state, badges: { ...state.badges, [id]: Date.now() } });
}

// ---------- actions ----------

function withXp(s: ProgressState, amount: number, actions = 1): ProgressState {
  const key = dayKey();
  const day = s.activity[key] ?? { xp: 0, n: 0 };
  return {
    ...s,
    xp: s.xp + amount,
    activity: { ...s.activity, [key]: { xp: day.xp + amount, n: day.n + actions } },
  };
}

export function awardXp(amount: number) {
  commit(withXp(state, amount));
}

/** Record one answer (any game) for one term. */
export function recordAnswer(termId: string, correct: boolean, xp: number = correct ? XP.correct : 0) {
  const prev = state.terms[termId] ?? { c: 0, w: 0, last: 0 };
  const next: TermStat = { c: prev.c + (correct ? 1 : 0), w: prev.w + (correct ? 0 : 1), last: Date.now() };
  commit(withXp({ ...state, terms: { ...state.terms, [termId]: next } }, xp));
}

/** Record many answers at once (end of a round) without a re-render per answer. */
export function recordAnswers(results: Array<{ termId: string; correct: boolean }>, xp: number) {
  const termsNext = { ...state.terms };
  const now = Date.now();
  for (const r of results) {
    const prev = termsNext[r.termId] ?? { c: 0, w: 0, last: 0 };
    termsNext[r.termId] = { c: prev.c + (r.correct ? 1 : 0), w: prev.w + (r.correct ? 0 : 1), last: now };
  }
  commit(withXp({ ...state, terms: termsNext }, xp, Math.max(1, results.length)));
}

export function reviewCard(termId: string, dir: Direction, grade: Grade) {
  const key = cardKey(termId, dir);
  const now = Date.now();
  const card = review(state.srs[key], grade, now);
  const xp = grade === 'again' ? XP.reviewAgain : XP.review;
  commit(withXp({ ...state, srs: { ...state.srs, [key]: card }, reviews: state.reviews + 1 }, xp));
}

/** Put terms at the front of the flashcard queue (e.g. after missing them in a quiz). */
export function markDueNow(termIds: string[], dir: Direction = 'td') {
  const now = Date.now();
  const srs = { ...state.srs };
  for (const id of termIds) {
    const key = cardKey(id, dir);
    const card = srs[key];
    srs[key] = card
      ? { ...card, due: now }
      : { ef: 2.5, interval: 0, reps: 0, lapses: 0, due: now, last: now };
  }
  commit({ ...state, srs }, { evaluate: false });
}

export function recordQuiz(rec: Omit<QuizRecord, 'id' | 'at'>) {
  const full: QuizRecord = { ...rec, id: `q${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, at: Date.now() };
  commit(withXp({ ...state, quizzes: [...state.quizzes, full].slice(-200) }, XP.quizDone));
  if (rec.total >= 10 && rec.score === rec.total) awardBadge('quiz-perfect');
}

export function completeStory(topicId: string) {
  if (state.story[topicId]?.done) return;
  commit(withXp({ ...state, story: { ...state.story, [topicId]: { done: true, at: Date.now() } } }, XP.story));
}

export function recordPrediction(id: string, choice: number) {
  const first = state.predictions[id] === undefined;
  const next = { ...state, predictions: { ...state.predictions, [id]: choice } };
  commit(first ? withXp(next, XP.predict) : next);
}

/** Store a personal best. Returns true when it beats the previous one. */
export function setBest(key: string, value: number, better: 'lower' | 'higher'): boolean {
  const prev = state.bests[key];
  const isBetter = prev === undefined || (better === 'lower' ? value < prev : value > prev);
  if (isBetter) commit({ ...state, bests: { ...state.bests, [key]: value } }, { evaluate: false });
  return isBetter;
}

export function saveSaq(id: string, rec: Omit<SaqRecord, 'at'>) {
  const first = state.saq[id] === undefined;
  const next = { ...state, saq: { ...state.saq, [id]: { ...rec, at: Date.now() } } };
  commit(first ? withXp(next, XP.saq) : next);
  awardBadge('saq-first');
}

export function setLastVisited(path: string, label: string) {
  if (state.last?.path === path) return;
  commit({ ...state, last: { path, label, at: Date.now() } }, { evaluate: false });
}

export function resetProgress() {
  commit(emptyState(), { evaluate: false });
  persistNow();
}

// ---------- export / import ----------

export function exportProgress(): string {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

function mergeStates(a: ProgressState, b: ProgressState): ProgressState {
  const srs = { ...a.srs };
  for (const [k, card] of Object.entries(b.srs)) if (!srs[k] || card.last > srs[k].last) srs[k] = card;
  const termsMerged = { ...a.terms };
  for (const [k, st] of Object.entries(b.terms)) {
    const cur = termsMerged[k];
    termsMerged[k] = cur ? { c: Math.max(cur.c, st.c), w: Math.max(cur.w, st.w), last: Math.max(cur.last, st.last) } : st;
  }
  const activity = { ...a.activity };
  for (const [k, d] of Object.entries(b.activity)) {
    const cur = activity[k];
    activity[k] = cur ? { xp: Math.max(cur.xp, d.xp), n: Math.max(cur.n, d.n) } : d;
  }
  const badges = { ...a.badges };
  for (const [k, t] of Object.entries(b.badges)) badges[k] = badges[k] === undefined ? t : Math.min(badges[k], t);
  const quizIds = new Set(a.quizzes.map((q) => q.id));
  const quizzes = [...a.quizzes, ...b.quizzes.filter((q) => !quizIds.has(q.id))].sort((x, y) => x.at - y.at).slice(-200);
  const story = { ...a.story };
  for (const [k, v] of Object.entries(b.story)) if (v.done && !story[k]?.done) story[k] = v;
  const saq = { ...a.saq };
  for (const [k, v] of Object.entries(b.saq)) if (!saq[k] || v.at > saq[k].at) saq[k] = v;
  const bests = { ...a.bests };
  for (const [k, v] of Object.entries(b.bests)) {
    // Keys ending in ":time" are lower-is-better; everything else higher-is-better.
    const lower = k.endsWith(':time');
    if (bests[k] === undefined || (lower ? v < bests[k] : v > bests[k])) bests[k] = v;
  }
  return {
    ...a,
    createdAt: Math.min(a.createdAt, b.createdAt),
    xp: Math.max(a.xp, b.xp),
    srs,
    terms: termsMerged,
    quizzes,
    activity,
    badges,
    bests,
    story,
    predictions: { ...b.predictions, ...a.predictions },
    saq,
    reviews: Math.max(a.reviews, b.reviews),
  };
}

/** Import a progress file. Throws a readable Error on bad input. */
export function importProgress(text: string, mode: 'merge' | 'replace'): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!isObj(parsed) || parsed.v !== 1) throw new Error('That file does not look like a Period 4 progress export.');
  const incoming = sanitize(parsed);
  commit(mode === 'replace' ? incoming : mergeStates(state, incoming));
  persistNow();
}

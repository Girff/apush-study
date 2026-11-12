import Fuse, { type FuseResultMatch } from 'fuse.js';
import { type ReactNode, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { StatusPill } from '../../components/TermChip';
import { EmptyNote, Kbd, PageHeader, usePageMeta } from '../../components/ui';
import { allChapters, termById, terms, themeOfTopic, topicById, topics } from '../../lib/data';
import { type MasteryStatus, STATUS_LABEL, masteryStatus } from '../../lib/mastery';
import { notify } from '../../lib/notify';
import { markDueNow, useProgress } from '../../lib/progress';
import { relatedTerms } from '../../lib/related';
import type { Term } from '../../lib/types';

interface Doc {
  id: string;
  term: string;
  def: string;
  yawp: string;
  topic: string;
}

const docs: Doc[] = terms.map((t) => ({
  id: t.id,
  term: t.term,
  def: t.def,
  yawp: t.yawp,
  topic: `${t.topicId} ${topicById.get(t.topicId)?.title ?? ''}`,
}));

const STATUSES: MasteryStatus[] = ['new', 'learning', 'familiar', 'mastered'];

export default function GlossaryPage() {
  usePageMeta('Glossary');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const topic = params.get('topic') ?? '';
  const ch = params.get('ch') ?? '';
  const status = (params.get('status') ?? '') as MasteryStatus | '';
  const focusId = params.get('term');
  const deferredQ = useDeferredValue(q);
  const progress = useProgress();
  const searchRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(docs, {
        keys: [
          { name: 'term', weight: 0.6 },
          { name: 'def', weight: 0.3 },
          { name: 'yawp', weight: 0.05 },
          { name: 'topic', weight: 0.05 },
        ],
        threshold: 0.34,
        ignoreLocation: true,
        includeMatches: true,
        minMatchCharLength: 2,
      }),
    [],
  );

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'term') next.delete('term');
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const base: Array<{ term: Term; matches?: readonly FuseResultMatch[] }> = deferredQ.trim()
      ? fuse.search(deferredQ.trim()).map((r) => ({ term: termById.get(r.item.id)!, matches: r.matches }))
      : terms.map((t) => ({ term: t }));
    return base.filter(
      ({ term }) =>
        (!topic || term.topicId === topic) &&
        (!ch || term.chapters.includes(Number(ch))) &&
        (!status || masteryStatus(term.id, progress) === status),
    );
  }, [deferredQ, fuse, topic, ch, status, progress]);

  const focused = focusId ? termById.get(focusId) : undefined;
  const list = focused && !results.some((r) => r.term.id === focused.id) ? [{ term: focused }, ...results] : results;

  // Scroll a deep-linked term into view and move focus to it.
  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`term-${focusId}`);
    if (el) {
      el.scrollIntoView({ block: 'center' });
      el.focus({ preventScroll: true });
    }
  }, [focusId]);

  // "/" jumps to the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = !!(q || topic || ch || status);
  const grouped = !deferredQ.trim();

  // Paint the first screenful right away; render the rest when the browser is idle.
  const [limit, setLimit] = useState(focusId ? Infinity : 60);
  useEffect(() => {
    if (limit === Infinity) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setLimit(Infinity));
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setLimit(Infinity), 60);
    return () => clearTimeout(t);
  }, [limit]);
  useEffect(() => {
    if (focusId) setLimit(Infinity);
  }, [focusId]);
  const shown = list.slice(0, limit);

  return (
    <div className="wrap">
      <PageHeader
        kicker="Reference room"
        title="Glossary"
        lede={
          <>
            All {terms.length} terms across {topics.length} topics, each with its definition and its place in <i>The American Yawp</i>.
            Search by name, definition or citation (try “canal”, “Tecumseh” or “9.V”).
          </>
        }
        motif="press"
      />

      <div className="z-20 border-b border-rule bg-paper/95 py-4 backdrop-blur-sm md:sticky md:top-0">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative col-span-2 md:col-span-1">
            <label htmlFor="glossary-search" className="sr-only">
              Search the glossary
            </label>
            <input
              id="glossary-search"
              ref={searchRef}
              type="search"
              className="field pr-12"
              placeholder={`Search ${terms.length} terms`}
              value={q}
              onChange={(e) => setParam('q', e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 sm:block">
              <Kbd>/</Kbd>
            </span>
          </div>
          <div>
            <label htmlFor="glossary-topic" className="sr-only">
              Filter by topic
            </label>
            <select id="glossary-topic" className="field" value={topic} onChange={(e) => setParam('topic', e.target.value)}>
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} {t.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="glossary-status" className="sr-only">
              Filter by mastery
            </label>
            <select id="glossary-status" className="field" value={status} onChange={(e) => setParam('status', e.target.value)}>
              <option value="">Any mastery</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by Yawp chapter">
          <span className="mr-1 text-sm font-semibold text-ink-soft">Yawp chapter</span>
          <button type="button" className="chip" aria-pressed={!ch} onClick={() => setParam('ch', '')}>
            All
          </button>
          {allChapters.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={ch === String(c)} onClick={() => setParam('ch', ch === String(c) ? '' : String(c))}>
              Ch. {c}
            </button>
          ))}
          <p className="ml-auto text-sm text-muted" aria-live="polite">
            {results.length === terms.length ? `${terms.length} terms` : `${results.length} of ${terms.length} terms`}
          </p>
          {filtered && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {list.length === 0 ? (
          <EmptyNote>No terms match. Try fewer words, or clear the filters.</EmptyNote>
        ) : grouped ? (
          <GroupedList list={shown.map((r) => r.term)} focusId={focusId} />
        ) : (
          <>
          <h2 className="sr-only">Search results</h2>
          <ul className="grid gap-3">
            {shown.map((r) => (
              <li key={r.term.id}>
                <GlossaryEntry term={r.term} matches={r.matches} focused={r.term.id === focusId} showTopic />
              </li>
            ))}
          </ul>
          </>
        )}
      </div>
    </div>
  );
}

function GroupedList({ list, focusId }: { list: Term[]; focusId: string | null }) {
  const groups = topics.map((t) => ({ topic: t, items: list.filter((x) => x.topicId === t.id) })).filter((g) => g.items.length);
  return (
    <div className="grid gap-10">
      {groups.map(({ topic, items }) => {
        const theme = themeOfTopic(topic.id);
        return (
          <section key={topic.id} aria-labelledby={`g-${topic.id}`}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
              <h2 id={`g-${topic.id}`} className="text-xl font-semibold sm:text-2xl">
                <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: `var(${theme.colorVar})` }} aria-hidden="true" />
                {topic.id} {topic.title}
              </h2>
              <p className="text-sm text-muted">
                {items.length} term{items.length === 1 ? '' : 's'} ·{' '}
                <Link to={`/story/${topic.id}`} className="font-semibold text-teal underline underline-offset-2">
                  Read the story
                </Link>
              </p>
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {items.map((t) => (
                <li key={t.id}>
                  <GlossaryEntry term={t} focused={t.id === focusId} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function highlight(text: string, key: string, matches?: readonly FuseResultMatch[]): ReactNode {
  const m = matches?.find((x) => x.key === key);
  if (!m) return text;
  const ranges = m.indices.filter(([a, b]) => b - a >= 1).sort((x, y) => x[0] - y[0]);
  if (!ranges.length) return text;
  const out: ReactNode[] = [];
  let last = 0;
  ranges.forEach(([a, b], i) => {
    if (a < last) return;
    if (a > last) out.push(text.slice(last, a));
    out.push(
      <mark key={i} className="rounded-sm px-0.5 text-inherit" style={{ background: 'var(--chip-hover)' }}>
        {text.slice(a, b + 1)}
      </mark>,
    );
    last = b + 1;
  });
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function GlossaryEntry({
  term,
  matches,
  focused,
  showTopic,
}: {
  term: Term;
  matches?: readonly FuseResultMatch[];
  focused?: boolean;
  showTopic?: boolean;
}) {
  const progress = useProgress();
  const topic = topicById.get(term.topicId)!;
  const theme = themeOfTopic(term.topicId);
  const related = relatedTerms(term.id, 5)
    .map((id) => termById.get(id))
    .filter((t): t is Term => !!t);
  return (
    <article
      id={`term-${term.id}`}
      tabIndex={-1}
      aria-labelledby={`h-${term.id}`}
      className={`panel cv-auto h-full scroll-mt-48 p-4 outline-none transition-shadow ${focused ? 'ring-2 ring-offset-2 ring-offset-paper' : ''}`}
      style={{ borderLeft: `4px solid var(${theme.colorVar})`, ...(focused ? { ['--tw-ring-color' as string]: 'var(--focus)' } : {}) }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={`h-${term.id}`} className="font-display text-lg font-semibold leading-snug">
          {highlight(term.term, 'term', matches)}
        </h3>
        <StatusPill status={masteryStatus(term.id, progress)} />
      </div>
      <p className="mt-1 text-ink-soft">{highlight(term.def, 'def', matches)}</p>
      <p className="mt-2 text-xs text-muted">
        <span className="font-semibold uppercase tracking-wider">Yawp</span> {term.yawp}
        {showTopic && (
          <>
            {' · '}
            <span className="font-semibold uppercase tracking-wider">Topic</span> {topic.id} {topic.title}
          </>
        )}
      </p>
      {related.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Related</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/glossary?term=${encodeURIComponent(r.id)}`}
                  className="inline-flex min-h-8 items-center rounded border border-rule px-2 text-sm text-ink-soft hover:border-ink hover:text-ink"
                >
                  {r.term}
                  {r.topicId !== term.topicId && <span className="ml-1 text-xs text-muted">({r.topicId})</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm -ml-2"
          onClick={() => {
            markDueNow([term.id]);
            notify({ kind: 'info', title: 'Added to today’s flashcards', body: term.term });
          }}
        >
          + Flashcards
        </button>
        <Link to={`/story/${term.topicId}`} className="btn btn-ghost btn-sm">
          Story {term.topicId}
        </Link>
      </div>
    </article>
  );
}

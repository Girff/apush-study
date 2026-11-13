/** Home: pick baskets (or search for cards), choose how to study, start. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNow } from '../hooks/useNow';
import { ALL_BASKET_IDS, BASKET, BASKETS, type Basket, CARD, DECK_PERIOD, GROUPS, type Group, basketsLabel, cardsOf } from '../lib/deck';
import { type Prefs, sessionDirs, setPrefs, usePrefs } from '../lib/prefs';
import { searchCards } from '../lib/search';
import { isResumable, planSession, poolFor, type Session, specFromPrefs } from '../lib/session';
import { cardKey } from '../lib/srs';
import { countStatuses, isDue, isNewCard, isWeak } from '../lib/status';
import { type Progress, rollDay, setSelected, toggleBasket, useProgress } from '../lib/store';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { CardRow, type ListSpec } from './CardList';
import { Meter, MeterLegend, plural } from './common';
import { type PanelInfo, StudyPanel, startLabel } from './StudyPanel';

export interface DeckActions {
  startSelected: () => void;
  startBasket: (basketId: string) => void;
  practiceCards: (ids: string[], label: string) => void;
  resume: () => void;
  discard: () => void;
  openList: (spec: ListSpec) => void;
  openSettings: () => void;
  openHelp: () => void;
  /** The study-options sheet on phones. */
  openOptions: () => void;
  closeOptions: () => void;
}

export function Header({ onHelp, onSettings, title }: { onHelp: () => void; onSettings: () => void; title?: boolean }) {
  usePrefs(); // re-render when the theme changes
  const dark = document.documentElement.getAttribute('data-theme') === 'lamplight';
  return (
    <header className="wrap flex items-center gap-1 pb-2 pt-[max(0.9rem,env(safe-area-inset-top))] sm:gap-2">
      <div className="mr-auto flex min-w-0 items-center gap-3">
        <img src="./favicon.svg" alt="" width={44} height={44} className="h-11 w-11 flex-none rounded-[10px]" />
        {title && (
          <div className="min-w-0">
            <p className="kicker truncate">
              APUSH · <span className="hidden sm:inline">{DECK_PERIOD}</span>
              <span className="sm:hidden">1800–1848</span>
            </p>
            <h1 className="text-[1.45rem] font-semibold leading-tight sm:text-[1.9rem]">Unit 4 Flashcards</h1>
          </div>
        )}
      </div>
      <button type="button" className="btn btn-ghost btn-icon max-sm:hidden" onClick={() => setPrefs({ theme: dark ? 'light' : 'dark' })} title={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
        <Icon name={dark ? 'sun' : 'moon'} />
        <span className="sr-only">{dark ? 'Light theme' : 'Dark theme'}</span>
      </button>
      <button type="button" className="btn btn-ghost btn-icon" onClick={onHelp} title="How it works and shortcuts (?)">
        <Icon name="help" />
        <span className="sr-only">Help</span>
      </button>
      <button type="button" className="btn btn-ghost btn-icon" onClick={onSettings} title="Settings">
        <Icon name="sliders" />
        <span className="sr-only">Settings</span>
      </button>
    </header>
  );
}

interface TileStats {
  counts: ReturnType<typeof countStatuses>;
  due: number;
  starred: number;
  hidden: number;
  included: number;
}

function basketStats(b: Basket, p: Progress, dirs: ('td' | 'dt')[], now: number): TileStats {
  const included = b.cardIds.filter((id) => !p.excluded[id]);
  return {
    counts: countStatuses(p, included),
    due: included.filter((id) => isDue(p, id, dirs, now)).length,
    starred: b.cardIds.filter((id) => p.starred[id]).length,
    hidden: b.cardIds.length - included.length,
    included: included.length,
  };
}

function tileStatus(stats: TileStats): string {
  const parts: string[] = [];
  if (stats.counts.mastered > 0) parts.push(`${stats.counts.mastered} mastered`);
  const studied = stats.included - stats.counts.new;
  if (parts.length === 0) parts.push(studied === 0 ? 'Not started' : `${studied} studied`);
  return parts.join(' · ');
}

function BasketTile({ basket, on, stats, actions }: { basket: Basket; on: boolean; stats: TileStats; actions: DeckActions }) {
  return (
    <div className="tile h-full" data-on={on}>
      <button type="button" role="checkbox" aria-checked={on} className="tile-toggle" onClick={() => toggleBasket(basket.id)}>
        <span className="check mt-0.5" aria-hidden="true">
          {on && <Icon name="check" size={14} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="tile-title block font-display text-[1.08rem] font-semibold leading-snug">{basket.title}</span>
          <span className="block text-xs text-muted">
            {basket.years} · {plural(stats.included, 'card')}
          </span>
        </span>
      </button>
      <div className="grid gap-1.5">
        <Meter counts={stats.counts} />
        <p className="flex flex-wrap gap-x-2.5 text-xs text-muted">
          <span>{tileStatus(stats)}</span>
          {stats.due > 0 && <span className="font-semibold text-oxblood">{stats.due} due</span>}
          {stats.starred > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Icon name="star" filled size={11} className="text-brass" />
              {stats.starred}
              <span className="sr-only">starred</span>
            </span>
          )}
          {stats.hidden > 0 && <span>{stats.hidden} hidden</span>}
        </p>
      </div>
      <div className="tile-actions mt-auto flex items-center justify-between gap-2">
        <button type="button" className="btn btn-ghost btn-sm -ml-2 !px-2" onClick={() => actions.openList({ kind: 'basket', basketId: basket.id })}>
          <Icon name="list" size={16} />
          Cards
          <span className="sr-only"> in {basket.title}</span>
        </button>
        <button type="button" className="btn btn-secondary btn-sm !px-3" onClick={() => actions.startBasket(basket.id)}>
          <Icon name="play" filled size={13} />
          Study
          <span className="sr-only"> {basket.title} now</span>
        </button>
      </div>
    </div>
  );
}

function GroupSection({ group, progress, stats, actions }: { group: Group; progress: Progress; stats: Map<string, TileStats>; actions: DeckActions }) {
  const selected = new Set(progress.selected);
  const allOn = group.basketIds.every((id) => selected.has(id));
  return (
    <section aria-labelledby={`g-${group.id}`} className="mt-7 first:mt-0">
      <div className="mb-2.5 flex items-end gap-3 border-b border-rule pb-1.5">
        <h2 id={`g-${group.id}`} className="min-w-0 text-[1.3rem] font-semibold">
          {group.title} <span className="ml-1 whitespace-nowrap font-sans text-sm font-normal text-muted">{group.years}</span>
        </h2>
        <button
          type="button"
          className="btn btn-ghost btn-sm ml-auto !min-h-8 whitespace-nowrap !px-2 text-xs"
          onClick={() => setSelected(allOn ? progress.selected.filter((id) => !group.basketIds.includes(id)) : [...progress.selected, ...group.basketIds])}
        >
          {allOn ? 'Deselect group' : 'Select group'}
          <span className="sr-only">: {group.title}</span>
        </button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {group.basketIds.map((id) => {
          const b = BASKET.get(id)!;
          return (
            <li key={id}>
              <BasketTile basket={b} on={selected.has(id)} stats={stats.get(id)!} actions={actions} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SearchResults({ query, progress, actions, onClear }: { query: string; progress: Progress; actions: DeckActions; onClear: () => void }) {
  const results = useMemo(() => searchCards(query), [query]);
  const studyIds = results.map((c) => c.id).filter((id) => !progress.excluded[id]);
  return (
    <section aria-labelledby="results-h">
      <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-rule pb-2">
        <h2 id="results-h" className="mr-auto text-lg font-semibold" aria-live="polite">
          {results.length === 0 ? `No cards match “${query}”` : `${plural(results.length, 'card')} match “${query}”`}
        </h2>
        {studyIds.length > 0 && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.practiceCards(studyIds, `Search: ${query}`)}>
            <Icon name="play" filled size={14} />
            Practice {studyIds.length === 1 ? 'it' : `these ${studyIds.length}`}
          </button>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
          Clear search
        </button>
      </div>
      {results.length === 0 ? (
        <p className="py-6 text-muted">Try a shorter word, a name or a year.</p>
      ) : (
        <ul>
          {results.map((c) => (
            <CardRow key={c.id} card={c} progress={progress} query={query} showBasket />
          ))}
        </ul>
      )}
    </section>
  );
}

function ResumeBanner({ session, actions }: { session: Session; actions: DeckActions }) {
  const left = new Set(session.queue.map((i) => i.id)).size;
  return (
    <div className="panel mb-5 flex flex-wrap items-center gap-3 border-teal px-4 py-3" role="region" aria-label="Unfinished session">
      <Icon name="clock" className="text-teal" />
      <p className="mr-auto min-w-0 text-sm">
        <span className="font-semibold">Pick up where you left off:</span> {session.spec.label} · {plural(left, 'card')} left
      </p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={actions.discard}>
        Discard
      </button>
      <button type="button" className="btn btn-primary btn-sm" onClick={actions.resume}>
        Resume
      </button>
    </div>
  );
}

export function usePanelInfo(prefs: Prefs, progress: Progress, now: number): PanelInfo {
  return useMemo(() => {
    const spec = specFromPrefs(prefs, { baskets: progress.selected, label: '' });
    const plan = planSession(spec, progress, now, () => 0.5);
    const all = cardsOf(progress.selected);
    const visible = all.filter((id) => !progress.excluded[id]);
    const dirs = sessionDirs(prefs);
    let nextDue: number | null = null;
    if (prefs.mode === 'spaced' && plan.items.length === 0) {
      for (const id of poolFor(spec, progress)) {
        for (const d of dirs) {
          const c = progress.srs[cardKey(id, d)];
          if (c && c.due > now && (nextDue === null || c.due < nextDue)) nextDue = c.due;
        }
      }
    }
    return {
      plan,
      selectedCards: visible.length,
      hiddenCards: all.length - visible.length,
      basketCount: progress.selected.length,
      filterCounts: {
        all: visible.length,
        starred: visible.filter((id) => progress.starred[id]).length,
        weak: visible.filter((id) => isWeak(progress, id)).length,
        new: visible.filter((id) => isNewCard(progress, id)).length,
      },
      nextDue,
      now,
    };
  }, [prefs, progress, now]);
}

export function DeckView({ session, actions, optionsOpen }: { session: Session | null; actions: DeckActions; optionsOpen: boolean }) {
  const progress = useProgress();
  const prefs = usePrefs();
  const now = useNow();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const info = usePanelInfo(prefs, progress, now);
  const dirs = sessionDirs(prefs);

  const dirKey = dirs.join();
  const stats = useMemo(() => new Map(BASKETS.map((b) => [b.id, basketStats(b, progress, dirKey.split(',') as ('td' | 'dt')[], now)])), [progress, now, dirKey]);

  const totals = useMemo(() => {
    const ids = [...CARD.keys()].filter((id) => !progress.excluded[id]);
    return { counts: countStatuses(progress, ids), cards: ids.length, due: ids.filter((id) => isDue(progress, id, ['td', 'dt'], now)).length };
  }, [progress, now]);

  const starredCount = Object.keys(progress.starred).filter((id) => CARD.has(id)).length;
  const hiddenCount = Object.keys(progress.excluded).filter((id) => CARD.has(id)).length;
  const allSelected = progress.selected.length === ALL_BASKET_IDS.length;

  // "/" jumps to search, as on many sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable="true"]') || document.querySelector('dialog[open]')) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = () => actions.startSelected();

  return (
    <>
      <Header onHelp={actions.openHelp} onSettings={actions.openSettings} title />
      <main id="main" className="wrap pb-32 pt-1 lg:pb-16">
        <div className="mb-5 flex flex-wrap items-end gap-x-6 gap-y-3">
          <p className="mr-auto max-w-xl text-ink-soft">
            {plural(totals.cards, 'card')} in {BASKETS.length} topic baskets. Pick the baskets you need, choose how to study, and start.
          </p>
          <dl className="flex gap-5 text-sm">
            <div>
              <dt className="text-xs text-muted">Today</dt>
              <dd className="tabular text-lg font-semibold">{rollDay(progress, now).today.reviews}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Due</dt>
              <dd className="tabular text-lg font-semibold">{totals.due}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Mastered</dt>
              <dd className="tabular text-lg font-semibold">
                {totals.counts.mastered}
                <span className="text-sm font-normal text-muted">/{totals.cards}</span>
              </dd>
            </div>
          </dl>
        </div>

        {isResumable(session) && <ResumeBanner session={session} actions={actions} />}

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-8">
          <div className="min-w-0">
            <div className="mb-4 grid gap-3">
              <div className="relative">
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <label htmlFor="search" className="sr-only">
                  Search all cards
                </label>
                <input
                  ref={searchRef}
                  id="search"
                  type="search"
                  className="field pl-10"
                  placeholder="Search terms and definitions"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && query) {
                      e.preventDefault();
                      setQuery('');
                    }
                  }}
                />
                {query ? (
                  <button type="button" className="btn btn-ghost btn-icon btn-sm absolute right-1 top-1/2 -translate-y-1/2" onClick={() => { setQuery(''); searchRef.current?.focus(); }}>
                    <Icon name="x" size={18} />
                    <span className="sr-only">Clear search</span>
                  </button>
                ) : (
                  <span className="kbd pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
                    /
                  </span>
                )}
              </div>
              {!query && (
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelected(allSelected ? [] : ALL_BASKET_IDS)}>
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => actions.openList({ kind: 'starred' })}>
                    <Icon name="star" filled={starredCount > 0} size={16} className={starredCount > 0 ? 'text-brass' : ''} />
                    Starred <span className="tabular text-muted">{starredCount}</span>
                  </button>
                  {hiddenCount > 0 && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => actions.openList({ kind: 'hidden' })}>
                      <Icon name="eyeOff" size={16} />
                      Hidden <span className="tabular text-muted">{hiddenCount}</span>
                    </button>
                  )}
                  <MeterLegend className="ml-auto" />
                </div>
              )}
            </div>

            {query ? (
              <SearchResults query={query} progress={progress} actions={actions} onClear={() => setQuery('')} />
            ) : (
              GROUPS.map((g) => <GroupSection key={g.id} group={g} progress={progress} stats={stats} actions={actions} />)
            )}

            <footer className="mt-12 border-t border-rule pt-4 text-xs leading-relaxed text-muted">
              Definitions keyed to <cite>The American Yawp</cite>, chapters 7–11. Your progress is saved in this browser only. Export it any time in
              Settings.
            </footer>
          </div>

          <aside className="hidden lg:block" aria-labelledby="study-h">
            <div className="panel sticky top-4 p-5">
              <StudyPanel prefs={prefs} info={info} onStart={start} headingId="study-h" />
            </div>
          </aside>
        </div>
      </main>

      {/* Phones and tablets: a thumb-reach start bar with the options in a sheet. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-card/95 backdrop-blur lg:hidden">
        <div className="wrap flex items-center gap-2 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <button type="button" className="btn btn-secondary min-w-0 flex-1 justify-start !px-3" onClick={actions.openOptions} aria-haspopup="dialog">
            <Icon name="sliders" size={18} />
            <span className="min-w-0 truncate text-left text-sm leading-tight">
              <span className="block truncate font-semibold">{basketsLabel(progress.selected)}</span>
              <span className="block truncate text-xs font-normal text-muted">
                {prefs.mode === 'practice' ? 'Practice' : 'Spaced review'} · {prefs.answer === 'type' ? 'typing' : 'flipping'}
                {prefs.filter !== 'all' && ` · ${prefs.filter}`}
              </span>
            </span>
          </button>
          <button type="button" className="btn btn-primary flex-none" disabled={info.plan.items.length === 0} onClick={start}>
            <Icon name="play" filled size={16} />
            {info.plan.items.length === 0 ? 'Start' : startLabel(prefs, info).replace(/ · /, ' ')}
          </button>
        </div>
      </div>
      <Dialog open={optionsOpen} onClose={actions.closeOptions} title="Study options">
        <StudyPanel prefs={prefs} info={info} onStart={start} />
      </Dialog>
    </>
  );
}

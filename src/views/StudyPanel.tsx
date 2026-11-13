/** Study options and the Start button. Lives in the sidebar on wide screens and in a sheet on phones. */
import { type Plan } from '../lib/session';
import { type Prefs, SIZES, setPrefs } from '../lib/prefs';
import { Icon } from '../ui/Icon';
import { Segmented } from '../ui/Segmented';
import { plural, relativeTime } from './common';

export interface PanelInfo {
  plan: Plan;
  selectedCards: number;
  hiddenCards: number;
  basketCount: number;
  filterCounts: Record<Prefs['filter'], number>;
  /** Spaced: the next time something in the selection becomes due. */
  nextDue: number | null;
  now: number;
}

export function startLabel(prefs: Prefs, info: PanelInfo): string {
  const n = info.plan.items.length;
  if (n === 0) return 'Nothing to study';
  return `${prefs.mode === 'spaced' ? 'Review' : 'Start'} · ${plural(n, 'card')}`;
}

function planNote(prefs: Prefs, info: PanelInfo): string {
  const { plan } = info;
  if (info.basketCount === 0) return 'Select at least one basket.';
  if (plan.pool === 0) {
    if (prefs.filter === 'starred') return 'No starred cards in these baskets yet.';
    if (prefs.filter === 'weak') return 'No weak cards here. Cards you miss show up in this filter.';
    if (prefs.filter === 'new') return 'You’ve studied every card here at least once.';
    return 'Every card in these baskets is hidden.';
  }
  if (prefs.mode === 'practice') {
    return plan.items.length < plan.pool ? `${plan.items.length} of ${plan.pool} cards, ${prefs.order === 'shuffle' ? 'shuffled' : 'in deck order'}.` : `All ${plural(plan.pool, 'card')}, ${prefs.order === 'shuffle' ? 'shuffled' : 'in deck order'}.`;
  }
  const parts = [`${plan.due} due`, `${plan.fresh} new`];
  let note = parts.join(' · ');
  if (plan.items.length === 0) {
    note = info.nextDue ? `All caught up. Next review ${relativeTime(info.nextDue, info.now)}.` : 'All caught up.';
  }
  if (plan.newBlocked > 0 && plan.fresh === 0) note += ` Today’s new-card limit (${prefs.newPerDay}) is used up; change it in Settings.`;
  return note;
}

function Count({ n }: { n: number }) {
  return <span className="tabular rounded-full bg-paper px-1.5 text-[0.7rem] leading-[1.15rem] text-muted">{n}</span>;
}

export function StudyPanel({ prefs, info, onStart, headingId }: { prefs: Prefs; info: PanelInfo; onStart: () => void; headingId?: string }) {
  const typeMode = prefs.answer === 'type';
  const n = info.plan.items.length;
  return (
    <div className="grid gap-4">
      <div>
        <h2 id={headingId} className="text-xl font-semibold">
          Study
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          {plural(info.basketCount, 'basket')} · {plural(info.selectedCards, 'card')}
          {info.hiddenCards > 0 && <> · {info.hiddenCards} hidden</>}
        </p>
      </div>

      <Segmented
        label="Mode"
        value={prefs.mode}
        onChange={(mode) => setPrefs({ mode })}
        options={[
          { value: 'practice', label: 'Practice' },
          { value: 'spaced', label: 'Spaced review' },
        ]}
        hint={
          prefs.mode === 'practice'
            ? 'Go through any cards. Ones you miss come back until you know them.'
            : 'Due reviews plus new cards, timed by how well you remember each one.'
        }
      />

      <Segmented
        label="Cards"
        value={prefs.filter}
        onChange={(filter) => setPrefs({ filter })}
        options={[
          { value: 'all', label: <>All</> },
          { value: 'starred', label: <>Starred{info.filterCounts.starred > 0 && <Count n={info.filterCounts.starred} />}</> },
          { value: 'weak', label: <>Weak{info.filterCounts.weak > 0 && <Count n={info.filterCounts.weak} />}</> },
          { value: 'new', label: <>New</> },
        ]}
      />

      <Segmented
        label="Answer by"
        value={prefs.answer}
        onChange={(answer) => setPrefs({ answer })}
        options={[
          { value: 'flip', label: 'Flipping' },
          { value: 'type', label: 'Typing' },
        ]}
        hint={typeMode ? 'You see the definition and type the term. Small typos are fine.' : undefined}
      />

      <Segmented
        label="Show first"
        value={typeMode ? 'dt' : prefs.dir}
        onChange={(dir) => setPrefs({ dir })}
        options={[
          { value: 'td', label: 'Term', disabled: typeMode },
          { value: 'dt', label: 'Definition', disabled: typeMode },
          { value: 'mixed', label: 'Mixed', disabled: typeMode },
        ]}
      />

      <Segmented
        label="Order"
        value={prefs.order}
        onChange={(order) => setPrefs({ order })}
        options={[
          { value: 'shuffle', label: 'Shuffled' },
          { value: 'deck', label: 'In order' },
        ]}
      />

      <Segmented
        label="Cards per session"
        value={prefs.size}
        onChange={(size) => setPrefs({ size })}
        options={SIZES.map((n) => ({ value: n, label: n === 0 ? 'All' : String(n) }))}
      />

      <div className="rounded-lg bg-sunk px-3 py-2.5 text-sm text-ink-soft" aria-live="polite">
        {planNote(prefs, info)}
      </div>

      <button type="button" className="btn btn-primary btn-lg w-full" disabled={n === 0} onClick={onStart}>
        <Icon name="play" filled size={18} />
        {startLabel(prefs, info)}
      </button>
    </div>
  );
}

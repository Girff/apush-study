import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { MasteryRing } from '../../components/MasteryRing';
import { PageHeader, usePageMeta } from '../../components/ui';
import { terms, topics } from '../../lib/data';
import { deckStats } from '../../lib/deck';
import { overallMastery, statusCounts, weakestTerms } from '../../lib/mastery';
import { notify } from '../../lib/notify';
import { type MotionPref, type ThemePref, setPrefs, usePrefs } from '../../lib/prefs';
import { currentStreak, exportProgress, importProgress, longestStreak, markDueNow, resetProgress, useProgress } from '../../lib/progress';
import { storageStatus } from '../../lib/storage';
import { ALL_BADGES } from '../../unit/config';
import { QuizHistory, StatusBar, StreakCalendar, TopicHeatmap } from './charts';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function DashboardPage() {
  usePageMeta('Progress');
  const progress = useProgress();
  const mastery = useMemo(() => overallMastery(progress), [progress]);
  const counts = useMemo(() => statusCounts(progress), [progress]);
  const weakest = useMemo(() => weakestTerms(progress, 10), [progress]);
  const due = deckStats(
    progress,
    topics.map((t) => t.id),
    'both',
  ).due;

  return (
    <div className="wrap">
      <PageHeader kicker="Your ledger" title="Progress" lede="Everything here is stored in this browser only. Export a copy to move it to another device." motif="press" />

      {/* Headline figures */}
      <section aria-label="Summary" className="mt-8 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="panel flex items-center justify-center p-5">
          <MasteryRing value={mastery} size={140} label="Overall mastery" caption={`${counts.mastered} of ${terms.length} terms mastered`} />
        </div>
        <div className="grid gap-4">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Experience', `${progress.xp.toLocaleString()} XP`, plural(Object.keys(progress.activity).length, 'study day')],
              ['Current streak', plural(currentStreak(progress), 'day'), `Longest ${plural(longestStreak(progress), 'day')}`],
              ['Terms mastered', `${counts.mastered}`, `of ${terms.length}`],
              ['Due today', `${due}`, 'flashcards'],
            ].map(([label, value, sub]) => (
              <div key={label} className="panel p-4">
                <dt className="text-xs font-semibold text-muted">{label}</dt>
                <dd className="mt-1 font-sans text-2xl font-semibold">{value}</dd>
                <dd className="text-xs text-muted">{sub}</dd>
              </div>
            ))}
          </dl>
          <div className="panel p-4">
            <h2 className="mb-2 text-sm font-semibold">All {terms.length} terms by status</h2>
            <StatusBar progress={progress} />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="panel p-5">
          <TopicHeatmap progress={progress} />
        </div>
        <div className="grid content-start gap-8">
          <div className="panel p-5">
            <StreakCalendar progress={progress} />
          </div>
          <div className="panel p-5">
            <QuizHistory progress={progress} />
          </div>
        </div>
      </div>

      <section aria-labelledby="weak-title" className="panel mt-8 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="weak-title" className="text-xl font-semibold">
            Your weakest {weakest.length || 10} terms
          </h2>
          {weakest.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                markDueNow(weakest.map((w) => w.term.id));
                notify({ kind: 'info', title: `${weakest.length} cards added to today’s flashcards` });
              }}
            >
              Review these in flashcards
            </button>
          )}
        </div>
        {weakest.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Once you have answered some questions, the terms you miss most will show up here.</p>
        ) : (
          <ol className="mt-3 grid gap-2 md:grid-cols-2">
            {weakest.map((w) => (
              <li key={w.term.id} className="flex items-center gap-3 rounded border border-rule p-2.5">
                <div className="min-w-0 flex-1">
                  <Link to={`/glossary?term=${encodeURIComponent(w.term.id)}`} className="font-semibold underline decoration-[var(--brass)] decoration-2 underline-offset-2">
                    {w.term.term}
                  </Link>
                  <p className="truncate text-xs text-muted">
                    {w.term.topicId} · missed {w.misses}×
                  </p>
                </div>
                <div className="w-24 shrink-0">
                  <div className="h-2 rounded-full" style={{ background: 'var(--seq-track)' }} aria-hidden="true">
                    <div className="h-2 rounded-full" style={{ width: `${Math.max(4, w.mastery * 100)}%`, background: 'var(--viz-line)' }} />
                  </div>
                  <p className="mt-0.5 text-right text-xs tabular text-muted">{Math.round(w.mastery * 100)}%</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Badges />
      <Settings />
      <DataTools />
    </div>
  );
}

function Badges() {
  const progress = useProgress();
  const earned = ALL_BADGES.filter((b) => progress.badges[b.id] !== undefined).length;
  return (
    <section aria-labelledby="badges-title" className="mt-8">
      <h2 id="badges-title" className="text-xl font-semibold">
        Badges <span className="text-base font-normal text-muted">({earned} of {ALL_BADGES.length})</span>
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ALL_BADGES.map((b) => {
          const at = progress.badges[b.id];
          return (
            <li key={b.id} className={`panel p-3.5 ${at === undefined ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-display font-semibold">{b.name}</p>
                {at !== undefined && !b.solemn && <span className="stamp shrink-0 !text-[0.6rem]">Earned</span>}
                {at !== undefined && b.solemn && <span className="shrink-0 text-xs font-semibold text-muted">Earned</span>}
              </div>
              <p className="mt-1 text-xs text-ink-soft">{b.description}</p>
              {at !== undefined && <p className="mt-1 text-xs text-muted">{new Date(at).toLocaleDateString()}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Settings() {
  const prefs = usePrefs();
  const group = <T extends string>(legend: string, value: T, options: Array<[T, string]>, onChange: (v: T) => void) => (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, label]) => (
          <label key={v} className="chip cursor-pointer has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper">
            <input type="radio" className="sr-only" name={legend} checked={value === v} onChange={() => onChange(v)} />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
  return (
    <section aria-labelledby="settings-title" className="panel mt-8 grid gap-5 p-5 md:grid-cols-2">
      <h2 id="settings-title" className="text-xl font-semibold md:col-span-2">
        Display
      </h2>
      {group<ThemePref>(
        'Theme',
        prefs.theme,
        [
          ['system', 'Match my device'],
          ['parchment', 'Parchment (light)'],
          ['lamplight', 'Lamplight (dark)'],
        ],
        (v) => setPrefs({ theme: v }),
      )}
      {group<MotionPref>(
        'Motion',
        prefs.motion,
        [
          ['system', 'Match my device'],
          ['reduce', 'Calm (reduced motion)'],
          ['full', 'Full animation'],
        ],
        (v) => setPrefs({ motion: v }),
      )}
    </section>
  );
}

function DataTools() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `period4-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: 'Progress exported.' });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      importProgress(await file.text(), mode);
      setMessage({ ok: true, text: mode === 'merge' ? 'Progress merged into this browser.' : 'Progress replaced with the imported file.' });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Could not import that file.' });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <section aria-labelledby="data-title" className="panel mt-8 p-5">
      <h2 id="data-title" className="text-xl font-semibold">
        Your data
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Saved in this browser{storageStatus() === 'ok' ? '' : ' (storage is blocked, so only until you close this tab)'}. Export a JSON file to move your
        progress to another device, then import it there.
      </p>
      <div className="mt-4 grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="font-sans text-sm font-semibold">Export</h3>
          <button type="button" className="btn btn-primary btn-sm mt-2" onClick={download}>
            Download progress (.json)
          </button>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold">Import</h3>
          <fieldset className="mt-2 flex flex-wrap gap-2">
            <legend className="sr-only">Import mode</legend>
            {(
              [
                ['merge', 'Merge with mine'],
                ['replace', 'Replace mine'],
              ] as const
            ).map(([v, label]) => (
              <label key={v} className="chip cursor-pointer has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper">
                <input type="radio" name="import-mode" className="sr-only" checked={mode === v} onChange={() => setMode(v)} />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="btn btn-secondary btn-sm mt-2 cursor-pointer">
            Choose a file…
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold">Start over</h3>
          {confirmReset ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                  setMessage({ ok: true, text: 'Progress reset.' });
                }}
              >
                Yes, erase everything
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={() => setConfirmReset(true)}>
              Reset progress…
            </button>
          )}
        </div>
      </div>
      <p role="status" className={`mt-3 text-sm ${message?.ok === false ? 'text-oxblood' : 'text-teal'}`}>
        {message?.text}
      </p>
    </section>
  );
}

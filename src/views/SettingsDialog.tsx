import { useRef, useState } from 'react';
import { CARDS } from '../lib/deck';
import { deckTable, download, parseProgressFile, progressFile } from '../lib/exportData';
import { type Prefs, setPrefs, usePrefs } from '../lib/prefs';
import { storageStatus } from '../lib/storage';
import { commitProgress, getProgress, mergeProgress, resetProgress } from '../lib/store';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { Segmented } from '../ui/Segmented';
import { toast } from '../ui/toast';

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-1">
      <span>
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <input type="checkbox" className="switch mt-0.5" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-rule py-4 first:pt-0 last:border-b-0">
      <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const prefs = usePrefs();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const set = <K extends keyof Prefs>(k: K) => (v: Prefs[K]) => setPrefs({ [k]: v } as Partial<Prefs>);
  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onClose={() => { setConfirmReset(false); onClose(); }} title="Settings">
      <Section title="Display">
        <Segmented
          label="Theme"
          value={prefs.theme}
          onChange={set('theme')}
          options={[
            { value: 'system', label: 'Match device' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
        <Segmented
          label="Text size"
          value={prefs.text}
          onChange={set('text')}
          options={[
            { value: 'sm', label: <span className="text-[0.8rem]">Small</span> },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: <span className="text-[1.05rem]">Large</span> },
          ]}
        />
        <Segmented
          label="Motion"
          value={prefs.motion}
          onChange={set('motion')}
          options={[
            { value: 'system', label: 'Match device' },
            { value: 'reduce', label: 'Reduced' },
            { value: 'full', label: 'Full' },
          ]}
          hint="Reduced motion swaps the card flip and swipes for quick fades."
        />
      </Section>

      <Section title="Studying">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-medium">New cards per day</span>
            <span className="block text-xs text-muted">The most brand-new cards Spaced review adds in a day. Practice has no limit.</span>
          </span>
          <input
            type="number"
            min={0}
            max={300}
            inputMode="numeric"
            className="field w-24 text-right tabular"
            value={prefs.newPerDay}
            onChange={(e) => setPrefs({ newPerDay: Number(e.target.value) })}
          />
        </label>
        <Toggle label="Show textbook references" hint="Adds each card’s American Yawp chapter and section." checked={prefs.showYawp} onChange={set('showYawp')} />
        <Toggle label="Keep the screen awake while studying" hint="Where the browser supports it." checked={prefs.wakeLock} onChange={set('wakeLock')} />
      </Section>

      <Section title="Your data">
        {storageStatus() !== 'ok' && (
          <p className="rounded-lg bg-oxblood/10 px-3 py-2 text-sm text-oxblood">
            This browser isn’t letting the site save, so progress lasts only until you close the tab. Export it to keep it.
          </p>
        )}
        <p className="text-sm text-ink-soft">Progress is saved only in this browser. Back it up, or move it to another device, with a file.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => download(`unit4-flashcards-progress-${stamp}.json`, progressFile(getProgress()), 'application/json')}>
            <Icon name="download" size={16} />
            Export progress
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={16} />
            Import progress
          </button>
          <select className="field !min-h-9 w-auto py-1 text-sm" aria-label="When importing" value={importMode} onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}>
            <option value="merge">Merge with this device</option>
            <option value="replace">Replace this device’s progress</option>
          </select>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              const incoming = parseProgressFile(await file.text());
              if (!incoming) {
                toast('That file isn’t a progress export from this site.');
                return;
              }
              commitProgress(importMode === 'merge' ? mergeProgress(getProgress(), incoming) : incoming);
              toast(importMode === 'merge' ? 'Progress imported and merged.' : 'Progress imported.');
            }}
          />
        </div>
        <div>
          {!confirmReset ? (
            <button type="button" className="btn btn-ghost btn-sm text-oxblood" onClick={() => setConfirmReset(true)}>
              <Icon name="trash" size={16} />
              Reset all progress…
            </button>
          ) : (
            <div className="rounded-lg border border-oxblood p-3">
              <p className="text-sm">This clears every card’s schedule, stats, stars and hidden cards. Your settings stay. It can’t be undone.</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                    toast('Progress reset.');
                  }}
                >
                  Yes, reset everything
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section title="Take the cards elsewhere">
        <p className="text-sm text-ink-soft">
          Download all {CARDS.length} cards. Tab-separated files import straight into Quizlet (“Import”) and Anki (“File → Import”).
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => download('apush-unit4-flashcards.tsv', deckTable('tsv'), 'text/tab-separated-values')}>
            <Icon name="download" size={16} />
            Tab-separated (.tsv)
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => download('apush-unit4-flashcards.csv', deckTable('csv'), 'text/csv')}>
            <Icon name="download" size={16} />
            Spreadsheet (.csv)
          </button>
        </div>
      </Section>
    </Dialog>
  );
}

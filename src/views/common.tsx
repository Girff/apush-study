/** Small shared pieces: the mastery meter and legend, status pill, star button, relative times. */
import { type StatusCounts, STATUS_LABEL, type Status } from '../lib/status';
import { toggleStar } from '../lib/store';
import { Icon } from '../ui/Icon';

export function Meter({ counts, className = '' }: { counts: StatusCounts; className?: string }) {
  const total = counts.new + counts.learning + counts.known + counts.mastered;
  const label = `${counts.mastered} mastered, ${counts.known} known, ${counts.learning} learning, ${counts.new} new`;
  return (
    <div className={`meter ${className}`} role="img" aria-label={label} title={label}>
      {total > 0 &&
        (['mastered', 'known', 'learning'] as const).map((s) =>
          counts[s] > 0 ? <span key={s} className={`m-${s}`} style={{ flexGrow: counts[s], flexBasis: 0 }} /> : null,
        )}
      {counts.new > 0 && <span style={{ flexGrow: counts.new, flexBasis: 0 }} />}
    </div>
  );
}

export function MeterLegend({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted ${className}`} aria-label="Meter colors">
      {(['mastered', 'known', 'learning', 'new'] as const).map((s) => (
        <li key={s} className="inline-flex items-center gap-1.5">
          <span className="swatch" style={{ background: s === 'new' ? 'var(--m-track)' : `var(--m-${s})`, boxShadow: s === 'new' ? 'inset 0 0 0 1px var(--rule-strong)' : undefined }} />
          {STATUS_LABEL[s]}
        </li>
      ))}
    </ul>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className="pill" data-s={status}>
      {status !== 'new' && <span className="swatch" style={{ background: `var(--m-${status})`, width: '0.5rem', height: '0.5rem', borderRadius: 999 }} />}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function StarButton({ id, on, term, size = 'sm' }: { id: string; on: boolean; term: string; size?: 'sm' | 'md' }) {
  return (
    <button
      type="button"
      className={`btn btn-ghost btn-icon ${size === 'sm' ? 'btn-sm' : ''} ${on ? 'text-brass' : 'text-muted'}`}
      aria-pressed={on}
      onClick={(e) => {
        e.stopPropagation();
        toggleStar(id);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      title={on ? 'Unstar' : 'Star'}
    >
      <Icon name="star" filled={on} size={size === 'sm' ? 18 : 20} />
      <span className="sr-only">Star {term}</span>
    </button>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
export { plural };

/** "in 10 min", "in 3 hours", "tomorrow", "in 4 days". */
export function relativeTime(at: number, now: number): string {
  const ms = at - now;
  if (ms <= 0) return 'now';
  const min = Math.round(ms / 60_000);
  if (min < 60) return `in ${plural(Math.max(1, min), 'minute')}`;
  const today = new Date(now);
  const then = new Date(at);
  const dayDiff = Math.round((new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86_400_000);
  if (dayDiff === 0) return `in ${plural(Math.round(min / 60), 'hour')}`;
  if (dayDiff === 1) return 'tomorrow';
  if (dayDiff < 30) return `in ${dayDiff} days`;
  const months = Math.round(dayDiff / 30);
  return `in ${plural(months, 'month')}`;
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return r ? `${m} min ${r} s` : `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

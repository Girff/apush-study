import { TOPIC_SHORT } from '../unit/config';
import { topics } from '../lib/data';

/** Multi-select topic filter built from toggle buttons (keyboard friendly). */
export function TopicPicker({
  value,
  onChange,
  label = 'Topics',
  compact = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  compact?: boolean;
}) {
  const all = value.length === topics.length;
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="chip"
          aria-pressed={all}
          onClick={() => onChange(all ? [] : topics.map((t) => t.id))}
        >
          All topics
        </button>
        {topics.map((t) => (
          <button
            key={t.id}
            type="button"
            className="chip"
            aria-pressed={value.includes(t.id)}
            onClick={() => toggle(t.id)}
            title={`${t.id} ${t.title}`}
          >
            <span className="tabular font-semibold">{t.id}</span>
            {!compact && <span className="hidden sm:inline">{TOPIC_SHORT[t.id]}</span>}
            <span className="sr-only">{t.title}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

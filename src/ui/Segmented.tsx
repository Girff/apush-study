import { type ReactNode, useId } from 'react';

export interface SegOption<T extends string | number> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  title?: string;
}

/** A radio group drawn as a pill bar. Arrow keys move between options, as with any radio group. */
export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  hint?: ReactNode;
}) {
  const name = useId();
  const hintId = useId();
  return (
    <fieldset aria-describedby={hint ? hintId : undefined}>
      <legend className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</legend>
      <div className="seg">
        {options.map((o) => (
          <label key={String(o.value)} className="seg-opt" title={o.title}>
            <input type="radio" name={name} checked={o.value === value} disabled={o.disabled} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs leading-snug text-muted">
          {hint}
        </p>
      )}
    </fieldset>
  );
}

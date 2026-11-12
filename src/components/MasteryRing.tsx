/**
 * Single ratio against a limit → a meter, drawn as a ring. The track is a
 * light step of the same teal ramp; the figure is set in the sans face.
 */
import { m } from 'framer-motion';
import { useReducedMotion } from '../lib/prefs';

export function MasteryRing({
  value,
  size = 132,
  label = 'Overall mastery',
  caption,
}: {
  value: number;
  size?: number;
  label?: string;
  caption?: string;
}) {
  const reduce = useReducedMotion();
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const stroke = Math.max(8, size * 0.075);
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="inline-flex flex-col items-center" role="img" aria-label={`${label}: ${pct}%${caption ? `. ${caption}` : ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: 'var(--seq-track)' }} />
        {pct > 0 && (
          <m.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            style={{ stroke: 'var(--viz-line)' }}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            initial={reduce ? false : { strokeDasharray: `0 ${c}` }}
            animate={{ strokeDasharray: `${dash} ${c}` }}
            transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          />
        )}
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          style={{ fill: 'var(--ink)', fontFamily: 'var(--font-sans)', fontWeight: 650, fontSize: size * 0.24 }}
        >
          {pct}%
        </text>
      </svg>
      <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted" aria-hidden="true">
        {label}
      </p>
      {caption && (
        <p className="mt-0.5 text-center text-xs text-muted" aria-hidden="true">
          {caption}
        </p>
      )}
    </div>
  );
}

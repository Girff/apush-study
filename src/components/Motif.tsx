/**
 * Original line-engraving style SVG motifs, one per topic. Decorative only
 * (aria-hidden). Ambient animation classes are switched off by the global
 * reduced-motion rule in index.css.
 */
import { useId } from 'react';
import type { MotifId } from '../lib/types';

interface MotifProps {
  id: MotifId;
  className?: string;
  animated?: boolean;
  title?: string;
}

const wave = (y: number, amp = 4, from = -24, to = 144) => {
  let d = `M${from} ${y}`;
  for (let x = from; x < to; x += 12) d += ` q6 ${-amp} 12 0`;
  return d;
};

function Shapes({ id, a }: { id: MotifId; a: (cls: string) => string | undefined }) {
  switch (id) {
    case 'compass':
      return (
        <>
          <circle cx="60" cy="60" r="46" />
          <circle cx="60" cy="60" r="38" strokeDasharray="1.5 5" strokeWidth="1.6" />
          <g className={a('motif-spin')}>
            <path d="M60 14 L67 60 L60 106 L53 60 Z" />
            <path d="M14 60 L60 53 L106 60 L60 67 Z" />
            <path d="M60 14 L67 60 L53 60 Z" fill="currentColor" fillOpacity="0.85" />
            <path d="M44 44 L76 76 M76 44 L44 76" strokeWidth="1.4" />
          </g>
          <circle cx="60" cy="60" r="3.5" fill="currentColor" />
        </>
      );
    case 'ballot':
      return (
        <>
          <path d="M22 58 L32 46 H88 L98 58" />
          <rect x="22" y="58" width="76" height="44" rx="2" />
          <path d="M46 52 H74" strokeWidth="4" />
          <path d="M60 70 l3.2 6.5 7.1 1 -5.1 5 1.2 7 -6.4 -3.4 -6.4 3.4 1.2 -7 -5.1 -5 7.1 -1 Z" strokeWidth="1.8" />
          <g className={a('motif-float')}>
            <path d="M48 12 L74 9 L77 44 L51 47 Z" style={{ fill: 'var(--card)' }} />
            <path d="M55 22 L68 35 M68 21 L55 36" strokeWidth="2.2" />
          </g>
        </>
      );
    case 'scales':
      return (
        <>
          <path d="M60 24 V98" />
          <path d="M40 100 H80 M46 98 Q60 90 74 98" />
          <circle cx="60" cy="20" r="4" fill="currentColor" />
          <g className={a('motif-sway')} style={{ transformOrigin: '60px 24px' }}>
            <path d="M22 32 H98" />
            <path d="M24 32 L12 62 M24 32 L36 62 M96 32 L84 62 M96 32 L108 62" strokeWidth="1.6" />
            <path d="M10 62 Q24 74 38 62 Z M82 62 Q96 74 110 62 Z" />
          </g>
        </>
      );
    case 'ship':
      return (
        <>
          <path d="M16 74 H104 L94 88 H28 Z" />
          <path d="M40 74 V24 M62 74 V16 M84 74 V28" />
          <path d="M30 28 H50 Q53 36 50 44 H30 Q33 36 30 28 Z" />
          <path d="M30 48 H50 Q53 57 50 66 H30 Q33 57 30 48 Z" />
          <path d="M52 20 H72 Q75 29 72 38 H52 Q55 29 52 20 Z" />
          <path d="M52 42 H72 Q75 53 72 64 H52 Q55 53 52 42 Z" />
          <path d="M76 32 H92 Q95 40 92 48 H76 Q79 40 76 32 Z" />
          <path d="M62 16 L74 12 L62 9" strokeWidth="1.8" />
          <g className={a('motif-drift')}>
            <path d={wave(98)} strokeWidth="1.8" />
            <path d={wave(108, 3)} strokeWidth="1.4" />
          </g>
        </>
      );
    case 'canal':
      return (
        <>
          <path d="M6 38 H114 M6 94 H114" />
          <path d="M6 32 H114" strokeWidth="1.2" strokeDasharray="2 6" />
          <g className={a('motif-drift')}>
            <path d={wave(54, 3)} strokeWidth="1.5" />
            <path d={wave(66, 3)} strokeWidth="1.5" />
            <path d={wave(78, 3)} strokeWidth="1.5" />
          </g>
          <path d="M28 38 L40 66 L28 94" strokeWidth="3.2" />
          <path d="M66 58 H104 L98 68 H72 Z" style={{ fill: 'var(--card)' }} />
          <path d="M76 58 V50 H92 V58" strokeWidth="1.8" />
        </>
      );
    case 'loom':
      return (
        <>
          <rect x="18" y="22" width="84" height="76" rx="2" />
          <path d="M28 30 V90 M36 30 V90 M44 30 V90 M52 30 V90 M60 30 V90 M68 30 V90 M76 30 V90 M84 30 V90 M92 30 V90" strokeWidth="1" />
          <path d="M18 40 H102 M18 82 H102" strokeWidth="1.6" />
          <g className={a('motif-float')}>
            <path d="M22 62 L42 55 H78 L98 62 L78 69 H42 Z" style={{ fill: 'var(--card)' }} />
            <circle cx="60" cy="62" r="3" fill="currentColor" />
          </g>
          <circle cx="30" cy="14" r="6" />
          <circle cx="90" cy="14" r="6" />
          <path d="M36 14 H84" strokeWidth="1.4" />
        </>
      );
    case 'broadside':
      return (
        <>
          <path d="M26 12 H94 V108 H26 Z" />
          <path d="M34 24 H86" strokeWidth="5" />
          <path d="M40 35 H80" strokeWidth="1.6" />
          <path d="M60 44 l3.2 6.5 7.1 1 -5.1 5 1.2 7 -6.4 -3.4 -6.4 3.4 1.2 -7 -5.1 -5 7.1 -1 Z" strokeWidth="1.8" />
          <path d="M34 72 H86 M34 80 H78 M34 88 H84 M34 96 H70" strokeWidth="1.6" />
          <path d="M30 66 H90" strokeWidth="1" strokeDasharray="1 3" />
        </>
      );
    case 'bank':
      return (
        <>
          <path d="M18 44 L60 18 L102 44 Z" />
          <circle cx="60" cy="35" r="4" />
          <path d="M22 48 H98" strokeWidth="3" />
          <path d="M30 54 V88 M46 54 V88 M74 54 V88 M90 54 V88" strokeWidth="3.4" />
          <path d="M54 88 V66 H66 V88" strokeWidth="1.8" />
          <path d="M22 92 H98 M16 100 H104" />
        </>
      );
    case 'press':
      return (
        <>
          <path d="M32 16 V104 M88 16 V104 M26 16 H94 M26 104 H94" />
          <path d="M54 22 L66 27 L54 32 L66 37 L54 42" strokeWidth="2" />
          <rect x="40" y="46" width="40" height="8" />
          <rect x="20" y="64" width="80" height="8" />
          <path d="M60 26 L104 16" strokeWidth="2.6" />
          <circle cx="106" cy="15" r="3.5" fill="currentColor" />
          <path d="M44 80 H76 M44 86 H70 M44 92 H74" strokeWidth="1.4" />
        </>
      );
    case 'tent':
      return (
        <>
          <path d="M6 94 H114" />
          <path d="M14 94 L60 26 L106 94" />
          <path d="M60 26 V14 M60 14 L74 18 L60 22" strokeWidth="2" />
          <path d="M36 62 L60 26 L84 62" strokeWidth="1.2" />
          <g className={a('motif-flicker')}>
            <path d="M48 94 Q56 72 60 54 Q64 72 72 94 Z" fill="currentColor" fillOpacity="0.28" stroke="none" />
            <circle cx="60" cy="80" r="3.4" fill="currentColor" stroke="none" />
          </g>
          <path d="M48 94 Q56 72 60 54 Q64 72 72 94" />
          <path d="M14 94 L6 102 M106 94 L114 102" strokeWidth="1.4" />
        </>
      );
    case 'petition':
      return (
        <>
          <path d="M28 20 H84 Q92 20 92 28 V94 H36 Q28 94 28 86 Z" />
          <path d="M28 86 Q28 102 40 102 H96 Q104 102 104 94 H36" />
          <path d="M38 34 H80" strokeWidth="3.2" />
          <path d={'M38 50 q3 -5 6 0 t6 0 t6 0 t6 0 M38 62 q3 -5 6 0 t6 0 t6 0 M38 74 q3 -5 6 0 t6 0 t6 0 t6 0 t6 0'} strokeWidth="1.6" />
          <g className={a('motif-sway')} style={{ transformOrigin: '72px 74px' }}>
            <path d="M108 8 Q84 28 74 64 L72 74 L80 66 Q92 34 108 8 Z" style={{ fill: 'var(--card)' }} />
            <path d="M104 14 Q88 34 78 62" strokeWidth="1.2" />
          </g>
        </>
      );
    case 'church':
      return (
        <>
          <path d="M28 58 V102 H92 V58" />
          <path d="M22 60 L60 34 L98 60" />
          <path d="M52 40 V22 H68 V40" />
          <path d="M50 22 L60 6 L70 22" />
          <path d="M56 28 H64" strokeWidth="1.6" />
          <path d="M54 102 V82 Q60 74 66 82 V102" />
          <path d="M38 70 V86 M82 70 V86" strokeWidth="3" />
          <path d="M14 102 H106" />
        </>
      );
    case 'cotton':
      return (
        <>
          <path d="M60 108 Q57 84 60 64 M60 84 Q46 76 36 60 M60 78 Q74 70 84 54" strokeWidth="2" />
          {[
            [60, 44],
            [34, 48],
            [86, 42],
          ].map(([cx, cy], i) => (
            <g key={i} className={a('motif-sway')} style={{ transformOrigin: `${cx}px ${cy + 16}px` }}>
              <circle cx={cx - 7} cy={cy} r="8" style={{ fill: 'var(--card)' }} />
              <circle cx={cx + 7} cy={cy} r="8" style={{ fill: 'var(--card)' }} />
              <circle cx={cx} cy={cy - 9} r="8" style={{ fill: 'var(--card)' }} />
              <circle cx={cx} cy={cy + 4} r="7" style={{ fill: 'var(--card)' }} />
              <path d={`M${cx - 12} ${cy + 10} L${cx - 4} ${cy + 18} L${cx} ${cy + 12} L${cx + 4} ${cy + 18} L${cx + 12} ${cy + 10}`} strokeWidth="1.8" />
            </g>
          ))}
        </>
      );
  }
}

export function Motif({ id, className = 'h-16 w-16', animated = true, title }: MotifProps) {
  const a = (cls: string) => (animated ? cls : undefined);
  const clipId = `clip-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="120" height="120" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <Shapes id={id} a={a} />
      </g>
    </svg>
  );
}

/** A small printer's fleuron used between sections. */
export function Fleuron({ className = 'h-5 w-24 text-brass' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 20" className={className} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 10 H44 M76 10 H116" />
      <path d="M60 3 C54 3 50 10 60 17 C70 10 66 3 60 3 Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M48 10 Q54 4 58 10 Q54 16 48 10 Z M72 10 Q66 4 62 10 Q66 16 72 10 Z" />
    </svg>
  );
}

/** Rough-ink SVG filter used by `.stamp`. Rendered once in the layout. */
export function InkFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="ink-rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" />
      </filter>
    </svg>
  );
}

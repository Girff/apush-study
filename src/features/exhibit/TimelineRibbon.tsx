/**
 * The landing page's scroll-scrubbed ribbon: a long paper scroll that unrolls
 * from 1800 to 1848 as the reader scrolls, revealing key events behind a
 * moving roller. With reduced motion it renders fully unrolled, statically.
 */
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useReducedMotion } from '../../lib/prefs';

const W = 3200;
const H = 360;
const X0 = 80;
const X1 = W - 80;
const xOf = (y: number) => X0 + ((y - 1800) / 48) * (X1 - X0);

/** tier: 1 = near the line, 2 = further out; negative = above the line. */
const HIGHLIGHTS: Array<{ year: number; label: string; color: string; tier: -2 | -1 | 1 | 2 }> = [
  { year: 1800, label: 'Election of 1800', color: 'var(--viz-politics)', tier: -1 },
  { year: 1803, label: 'Louisiana Purchase', color: 'var(--viz-politics)', tier: 1 },
  { year: 1807, label: 'Embargo Act', color: 'var(--viz-politics)', tier: -1 },
  { year: 1812, label: 'War of 1812', color: 'var(--viz-politics)', tier: 1 },
  { year: 1820, label: 'Missouri Compromise', color: 'var(--viz-politics)', tier: -1 },
  { year: 1825, label: 'Erie Canal opens', color: 'var(--viz-economy)', tier: 1 },
  { year: 1828, label: 'Jackson elected', color: 'var(--viz-politics)', tier: -1 },
  { year: 1830, label: 'Indian Removal Act', color: 'var(--viz-politics)', tier: 1 },
  { year: 1831, label: 'The Liberator', color: 'var(--viz-culture)', tier: -2 },
  { year: 1832, label: 'Bank veto', color: 'var(--viz-politics)', tier: 2 },
  { year: 1837, label: 'Panic of 1837', color: 'var(--viz-economy)', tier: -1 },
  { year: 1838, label: 'Trail of Tears', color: 'var(--ink-soft)', tier: 1 },
  { year: 1840, label: '"Log cabin" campaign', color: 'var(--viz-politics)', tier: -2 },
  { year: 1848, label: 'Seneca Falls', color: 'var(--viz-culture)', tier: 1 },
];

function Strip() {
  return (
    <>
      <rect x="0" y="20" width={W} height={H - 40} rx="6" style={{ fill: 'var(--card)', stroke: 'var(--rule-strong)', strokeWidth: 1.5 }} />
      <line x1={X0 - 30} x2={X1 + 30} y1={H / 2} y2={H / 2} style={{ stroke: 'var(--ink-soft)', strokeWidth: 2 }} />
      {Array.from({ length: 49 }, (_, i) => 1800 + i).map((y) => (
        <g key={y}>
          <line x1={xOf(y)} x2={xOf(y)} y1={H / 2 - (y % 10 === 0 ? 10 : 4)} y2={H / 2 + (y % 10 === 0 ? 10 : 4)} style={{ stroke: 'var(--ink-soft)', strokeWidth: 1.2 }} />
          {y % 10 === 0 && (
            <text x={xOf(y)} y={H / 2 + 28} textAnchor="middle" style={{ fill: 'var(--muted)', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
              {y}
            </text>
          )}
        </g>
      ))}
      {HIGHLIGHTS.map((h) => {
        const x = xOf(h.year);
        const up = h.tier < 0;
        const y2 = up ? H / 2 - 22 - Math.abs(h.tier) * 46 : H / 2 + 6 + h.tier * 46;
        return (
          <g key={h.label}>
            <line x1={x} x2={x} y1={H / 2} y2={up ? y2 + 8 : y2 - 18} style={{ stroke: h.color, strokeWidth: 1.5 }} />
            <circle cx={x} cy={H / 2} r={6} style={{ fill: h.color, stroke: 'var(--card)', strokeWidth: 2 }} />
            <text x={x} y={y2} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 17, fontWeight: 650, fontFamily: 'var(--font-display)' }}>
              {h.label}
            </text>
            <text x={x} y={y2 + (up ? -20 : 20)} textAnchor="middle" style={{ fill: 'var(--muted)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
              {h.year}
            </text>
          </g>
        );
      })}
    </>
  );
}

function Roller() {
  return (
    <g>
      <rect x="-14" y="8" width="28" height={H - 16} rx="14" style={{ fill: 'var(--sunk)', stroke: 'var(--rule-strong)', strokeWidth: 1.5 }} />
      <rect x="-6" y="-2" width="12" height="20" rx="3" style={{ fill: 'var(--brass)' }} />
      <rect x="-6" y={H - 18} width="12" height="20" rx="3" style={{ fill: 'var(--brass)' }} />
      <path d="M-8 60 Q0 70 8 60 M-8 120 Q0 130 8 120 M-8 180 Q0 190 8 180 M-8 240 Q0 250 8 240" style={{ fill: 'none', stroke: 'var(--rule-strong)', strokeWidth: 1.2 }} />
    </g>
  );
}

const highlightList = (
  <ol className="sr-only">
    {HIGHLIGHTS.map((h) => (
      <li key={h.label}>
        {h.year}: {h.label}
      </li>
    ))}
  </ol>
);

export function TimelineRibbon() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="ribbon-title" className="mt-6">
      <div className="wrap">
        <p className="kicker">Scroll to unroll</p>
        <h2 id="ribbon-title" className="mt-1 text-[clamp(1.6rem,1.3rem+1.2vw,2.3rem)] font-semibold">
          Forty-eight years on one scroll
        </h2>
        {highlightList}
      </div>
      {reduce ? <StaticRibbon /> : <ScrubbedRibbon />}
      <div className="wrap mt-4">
        <Link to="/timeline" className="font-semibold text-teal underline underline-offset-2">
          Explore every dated event in the Living Timeline →
        </Link>
      </div>
    </section>
  );
}

function StaticRibbon() {
  return (
    <div className="wrap mt-4">
      <div className="scrollbar-thin overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[240px] w-auto max-w-none sm:h-[280px]" aria-hidden="true">
          <Strip />
        </svg>
      </div>
    </div>
  );
}

function ScrubbedRibbon() {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [stageW, setStageW] = useState(1200);
  const [year, setYear] = useState(1800);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const revealYear = useTransform(scrollYProgress, [0.04, 0.92], [1800, 1848], { clamp: true });
  // Rendered height of the SVG strip is fixed; its on-screen scale depends on that height.
  const scale = 280 / H;
  const reveal = useTransform(revealYear, (y) => xOf(y) + 22);
  const tx = useTransform(reveal, (r) => {
    const visibleW = stageW / scale;
    return Math.max(-(W - visibleW), Math.min(0, visibleW * 0.62 - r)) * scale;
  });

  useMotionValueEvent(revealYear, 'change', (v) => setYear(Math.round(v)));
  useEffect(() => {
    const measure = () => stage.current && setStageW(stage.current.clientWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div ref={section} className="relative h-[240vh]">
      <div ref={stage} className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="wrap mb-4 flex items-end justify-between gap-4">
          <p className="font-display text-[clamp(3rem,2rem+5vw,6rem)] font-bold leading-none tabular text-ink" aria-hidden="true">
            {year}
          </p>
          <p className="max-w-xs text-right text-sm text-muted">Keep scrolling: the scroll unrolls one year at a time.</p>
        </div>
        <motion.div style={{ x: tx }} className="relative h-[280px] w-max will-change-transform" aria-hidden="true">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ height: 280, width: W * scale }}>
            <defs>
              <clipPath id="ribbon-clip">
                <motion.rect x="0" y="0" height={H} style={{ width: reveal }} />
              </clipPath>
            </defs>
            <g clipPath="url(#ribbon-clip)">
              <Strip />
            </g>
            <motion.g style={{ x: reveal }}>
              <Roller />
            </motion.g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

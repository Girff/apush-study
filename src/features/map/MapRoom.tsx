import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader, usePageMeta } from '../../components/ui';
import { resolveRef } from '../../lib/data';
import { useReducedMotion } from '../../lib/prefs';
import type { Term } from '../../lib/types';
import { type LayerId, MAP_FEATURES, MAP_LAYERS, type MapFeature, STATEHOOD, YEAR_PRESETS } from '../../unit/map';
import { HEIGHT, STATES, STATE_BY_ID, TERRITORY_1800, WIDTH, linePath, polygonPath, project } from './geo';

const FIRST = 1800;
const LAST = 1848;

const layerColor = (id: LayerId) => MAP_LAYERS.find((l) => l.id === id)?.color ?? 'var(--ink)';

export default function MapRoom() {
  usePageMeta('Map Room', 'Map Room');
  const reduce = useReducedMotion();
  const [year, setYear] = useState(1803);
  const [playing, setPlaying] = useState(false);
  const [layers, setLayers] = useState<LayerId[]>(MAP_LAYERS.map((l) => l.id));
  const [selected, setSelected] = useState<string | null>('louisiana');

  useEffect(() => {
    if (!playing) return;
    if (year >= LAST) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setYear((y) => Math.min(LAST, y + 1)), 650);
    return () => clearTimeout(t);
  }, [playing, year]);

  const shapes = useMemo(
    () =>
      new Map(
        MAP_FEATURES.map((f) => [
          f.id,
          {
            d: f.polygon ? polygonPath(f.polygon) : f.line ? linePath(f.line) : f.states ? f.states.map((s) => STATE_BY_ID.get(s)?.d ?? '').join(' ') : '',
            pt: f.point ? project(f.point) : undefined,
            label: f.labelAt ? project(f.labelAt) : f.point ? project(f.point) : undefined,
          },
        ]),
      ),
    [],
  );

  const on = (l: LayerId) => layers.includes(l);
  const visible = MAP_FEATURES.filter((f) => on(f.layer) && f.from <= year && (f.until ?? 9999) >= year);
  const newThisYear = MAP_FEATURES.filter((f) => f.from === year && on(f.layer));
  const admitted = STATES.filter((s) => STATEHOOD[s.id] === year && year > FIRST);
  const isState = (id: string) => (STATEHOOD[id] ?? 9999) <= year;
  const selectedFeature = MAP_FEATURES.find((f) => f.id === selected);
  const selectedState = selected?.startsWith('state:') ? STATE_BY_ID.get(selected.slice(6)) : undefined;

  const draw = (f: MapFeature) => !reduce && !f.solemn;

  return (
    <div className="wrap">
      <PageHeader
        kicker="Map Room"
        title="A nation redrawn, 1800–1848"
        lede="Move the slider to watch borders, canals, roads and the Cotton Belt change, and to see the routes of forced removal. Select anything on the map, or in the list, for its terms."
        motif="compass"
      />

      <div className="mt-6 grid gap-6">
        <div className="min-w-0">
          {/* Year controls */}
          <div className="panel flex flex-wrap items-center gap-x-5 gap-y-3 p-4">
            <div className="w-28">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Year</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={year}
                  initial={reduce ? false : { opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="font-display text-5xl font-bold leading-none tabular"
                  aria-hidden="true"
                >
                  {year}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="min-w-[14rem] flex-1">
              <label htmlFor="map-year" className="sr-only">
                Year
              </label>
              <input
                id="map-year"
                type="range"
                min={FIRST}
                max={LAST}
                step={1}
                value={year}
                onChange={(e) => {
                  setPlaying(false);
                  setYear(Number(e.target.value));
                }}
                className="w-full accent-[var(--oxblood)]"
                aria-valuetext={String(year)}
              />
              <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label="Jump to a year">
                {YEAR_PRESETS.map((y) => (
                  <button key={y} type="button" className="rounded px-1.5 py-0.5 text-xs font-semibold tabular text-ink-soft hover:bg-sunk" aria-pressed={y === year} onClick={() => setYear(y)}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary btn-sm w-10 px-0" onClick={() => setYear((y) => Math.max(FIRST, y - 1))} aria-label="Previous year">
                ←
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (year >= LAST) setYear(FIRST);
                  setPlaying((p) => !p);
                }}
              >
                {playing ? 'Pause' : year >= LAST ? 'Replay' : 'Play'}
              </button>
              <button type="button" className="btn btn-secondary btn-sm w-10 px-0" onClick={() => setYear((y) => Math.min(LAST, y + 1))} aria-label="Next year">
                →
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              {year}.{' '}
              {newThisYear.length || admitted.length
                ? `New: ${[...newThisYear.map((f) => f.title), ...admitted.map((s) => `${s.name} becomes a state`)].join('; ')}.`
                : ''}
            </p>
          </div>

          {/* Map */}
          <div
            ref={(el) => {
              if (el && !el.dataset.init) {
                el.dataset.init = '1';
                el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.62;
              }
            }}
            className="scrollbar-thin mt-4 overflow-x-auto rounded-md border border-rule bg-card"
            tabIndex={0}
            role="region"
            aria-label="Map (scrolls sideways on small screens)"
          >
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full min-w-[640px]" role="img" aria-label={`Map of the United States in ${year}. A list of the features shown follows the map.`}>
              <defs>
                <pattern id="map-cotton" width="11" height="11" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="1.7" style={{ fill: 'var(--viz-culture)' }} />
                  <circle cx="8.5" cy="8.5" r="1.7" style={{ fill: 'var(--viz-culture)' }} />
                </pattern>
                <pattern id="map-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" style={{ stroke: 'var(--ink-soft)', strokeWidth: 1.2 }} />
                </pattern>
                <marker id="map-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M0 0L10 5L0 10z" style={{ fill: 'var(--ink)' }} />
                </marker>
              </defs>

              {/* Modern outlines for reference */}
              {STATES.map((s) => (
                <path
                  key={s.id}
                  d={s.d}
                  style={{ fill: 'var(--card)', stroke: 'var(--rule-strong)', strokeWidth: 0.6 }}
                  onClick={() => setSelected(`state:${s.id}`)}
                  className="cursor-pointer"
                />
              ))}

              {on('borders') && (
                <g pointerEvents="none">
                  <path d={TERRITORY_1800} style={{ fill: 'color-mix(in srgb, var(--ink) 7%, transparent)' }} />
                  {STATES.filter((s) => isState(s.id)).map((s) => (
                    <path key={s.id} d={s.d} style={{ fill: 'color-mix(in srgb, var(--ink) 8%, transparent)', stroke: 'var(--ink-soft)', strokeWidth: 0.7 }} />
                  ))}
                </g>
              )}

              <AnimatePresence>
                {visible.map((f) => {
                  const s = shapes.get(f.id)!;
                  const color = layerColor(f.layer);
                  const isSel = selected === f.id;
                  if (f.point) return null;
                  const isArea = !!(f.polygon || f.states);
                  const fill =
                    f.layer === 'cotton'
                      ? 'url(#map-cotton)'
                      : f.id === 'indian-territory'
                        ? 'url(#map-hatch)'
                        : isArea
                          ? `color-mix(in srgb, ${color} ${f.layer === 'missouri' ? 26 : 14}%, transparent)`
                          : 'none';
                  return (
                    <motion.g
                      key={f.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.5 }}
                      onClick={() => setSelected(f.id)}
                      className="cursor-pointer"
                    >
                      {!isArea && <path d={s.d} style={{ fill: 'none', stroke: 'transparent', strokeWidth: 16 }} />}
                      <motion.path
                        d={s.d}
                        initial={!isArea && draw(f) ? { pathLength: 0 } : false}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                        markerEnd={f.layer === 'removal' && f.line ? 'url(#map-arrow)' : undefined}
                        style={{
                          fill,
                          stroke: color,
                          strokeWidth: isSel ? 3.6 : isArea ? 1.4 : f.id === 'line-3630' ? 3 : 2.4,
                          strokeDasharray: f.dashed ? '7 5' : f.id === 'louisiana' ? '5 3' : undefined,
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                        }}
                      />
                      {s.label && (
                        <MapLabel x={s.label[0]} y={s.label[1]} text={f.id === 'line-3630' ? '36°30′' : f.title} strong={isSel} />
                      )}
                    </motion.g>
                  );
                })}
              </AnimatePresence>

              {/* Points on top */}
              <AnimatePresence>
                {visible
                  .filter((f) => f.point)
                  .map((f) => {
                    const [x, y] = shapes.get(f.id)!.pt!;
                    const isSel = selected === f.id;
                    return (
                      <motion.g
                        key={f.id}
                        initial={{ opacity: 0, scale: reduce || f.solemn ? 1 : 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, duration: reduce ? 0 : undefined }}
                        style={{ transformOrigin: `${x}px ${y}px` }}
                        onClick={() => setSelected(f.id)}
                        className="map-pt cursor-pointer"
                        data-selected={isSel}
                      >
                        <circle cx={x} cy={y} r={13} style={{ fill: 'transparent' }} />
                        <circle cx={x} cy={y} r={isSel ? 7 : 5} style={{ fill: f.solemn ? 'var(--ink-soft)' : 'var(--ink)', stroke: 'var(--card)', strokeWidth: 2 }} />
                        <MapLabel x={x + 9} y={y - 8} text={f.title} anchor="start" small strong={isSel} className="pt-label" />
                      </motion.g>
                    );
                  })}
              </AnimatePresence>

              {selectedState && (
                <path d={selectedState.d} pointerEvents="none" style={{ fill: 'none', stroke: 'var(--focus)', strokeWidth: 2.5 }} />
              )}
            </svg>
          </div>
          <p className="mt-2 text-xs text-muted">
            Modern state lines are drawn faintly for reference. Shaded areas: darker = a state by {year}; lighter = U.S. territory. Historical
            boundaries and routes are approximate. Texas (1845), Oregon (1846) and the Mexican Cession (1848) belong to Period 5 and are not drawn.
          </p>

          {/* Layer toggles = legend */}
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-semibold">Layers</legend>
            <div className="flex flex-wrap gap-2">
              {MAP_LAYERS.map((l) => (
                <label key={l.id} className="chip cursor-pointer has-[:checked]:border-ink">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on(l.id)}
                    onChange={() => setLayers((cur) => (cur.includes(l.id) ? cur.filter((v) => v !== l.id) : [...cur, l.id]))}
                  />
                  <Swatch kind={l.swatch} color={l.color} active={on(l.id)} />
                  {l.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Side panel */}
        <aside className="grid content-start gap-4 md:grid-cols-2" aria-label="Map details">
          <div className="panel p-4" aria-live="polite">
            {selectedFeature ? (
              <FeatureDetail f={selectedFeature} year={year} />
            ) : selectedState ? (
              <div>
                <p className="kicker">State (modern outline)</p>
                <h2 className="mt-1 text-xl font-semibold">{selectedState.name}</h2>
                <p className="mt-1 text-ink-soft">
                  {STATEHOOD[selectedState.id]
                    ? STATEHOOD[selectedState.id] <= year
                      ? `In the Union by ${year}${STATEHOOD[selectedState.id] > 1790 ? ` (statehood ${STATEHOOD[selectedState.id]})` : ''}.`
                      : `Statehood ${STATEHOOD[selectedState.id]}.`
                    : 'Not a state before 1849.'}
                </p>
                {['47', '39', '28', '17'].includes(selectedState.id) && <TermList refs={['4.3:New western states']} />}
              </div>
            ) : (
              <p className="text-sm text-muted">Select a feature on the map or in the list below.</p>
            )}
          </div>

          <div className="panel p-4">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">On the map in {year}</h2>
            <ul className="mt-2 grid gap-0.5">
              {visible.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(f.id)}
                    aria-pressed={selected === f.id}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${selected === f.id ? 'bg-ink text-paper' : 'hover:bg-sunk'}`}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: layerColor(f.layer) }} aria-hidden="true" />
                    <span className="flex-1">{f.title}</span>
                    <span className="text-xs opacity-75">{f.when}</span>
                  </button>
                </li>
              ))}
            </ul>
            {admitted.length > 0 && (
              <p className="mt-3 border-t border-rule pt-2 text-sm text-ink-soft">
                New state{admitted.length > 1 ? 's' : ''} in {year}: {admitted.map((s) => s.name).join(', ')}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function MapLabel({
  x,
  y,
  text,
  anchor = 'middle',
  small,
  strong,
  className,
}: {
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle';
  small?: boolean;
  strong?: boolean;
  className?: string;
}) {
  return (
    <text
      className={className}
      x={x}
      y={y}
      textAnchor={anchor}
      pointerEvents="none"
      style={{
        fill: 'var(--ink)',
        stroke: 'var(--card)',
        strokeWidth: 3.5,
        paintOrder: 'stroke',
        fontFamily: 'var(--font-sans)',
        fontSize: small ? 11.5 : 13,
        fontWeight: strong ? 750 : 600,
      }}
    >
      {text}
    </text>
  );
}

function Swatch({ kind, color, active }: { kind: string; color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 22 12" className="h-3 w-6" aria-hidden="true" style={{ opacity: active ? 1 : 0.45 }}>
      {kind === 'fill' && <rect x="1" y="1" width="20" height="10" rx="2" style={{ fill: `color-mix(in srgb, ${color} 25%, transparent)`, stroke: color }} />}
      {kind === 'line' && <line x1="1" y1="6" x2="21" y2="6" style={{ stroke: color, strokeWidth: 3, strokeLinecap: 'round' }} />}
      {kind === 'dash' && <line x1="1" y1="6" x2="21" y2="6" style={{ stroke: color, strokeWidth: 2.5, strokeDasharray: '4 3' }} />}
      {kind === 'dots' && (
        <g style={{ fill: color }}>
          <circle cx="4" cy="4" r="1.8" />
          <circle cx="11" cy="8" r="1.8" />
          <circle cx="18" cy="4" r="1.8" />
        </g>
      )}
      {kind === 'point' && <circle cx="11" cy="6" r="4" style={{ fill: color }} />}
    </svg>
  );
}

function FeatureDetail({ f, year }: { f: MapFeature; year: number }) {
  const layer = MAP_LAYERS.find((l) => l.id === f.layer);
  const shown = f.from <= year && (f.until ?? 9999) >= year;
  return (
    <div>
      <p className="kicker" style={{ color: layer?.color }}>
        {layer?.label}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{f.title}</h2>
      <p className="text-sm font-semibold text-muted">{f.when}</p>
      <p className="mt-2 text-ink-soft">{f.desc}</p>
      {!shown && <p className="mt-2 text-sm text-muted">Not on the map in {year}; move the slider to {f.from}.</p>}
      <TermList refs={f.terms} />
    </div>
  );
}

function TermList({ refs }: { refs: string[] }) {
  const items = refs.map((r) => resolveRef(r)).filter((t): t is Term => !!t);
  return (
    <div className="mt-3 border-t border-rule pt-3">
      <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Related terms</h3>
      <ul className="mt-2 grid gap-2">
        {items.map((t) => (
          <li key={t.id} className="text-sm">
            <Link to={`/glossary?term=${encodeURIComponent(t.id)}`} className="font-semibold text-ink underline decoration-[var(--brass)] decoration-2 underline-offset-2">
              {t.term}
            </Link>
            <p className="text-ink-soft">{t.def}</p>
            <p className="text-xs text-muted">
              Yawp {t.yawp} · Topic {t.topicId}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Kbd, PageHeader, usePageMeta } from '../../components/ui';
import { termById, topicById, topics } from '../../lib/data';
import { type TimelineEvent, causalContext, nodeTerms, timelineEvents } from '../../lib/timeline';
import type { ThemeId } from '../../lib/types';
import { THEMES, TOPIC_SHORT } from '../../unit/config';
import { TimelineGame } from './TimelineGame';

const DOMAIN: [number, number] = [1775, 1862];
const PAD = 24;
const ROW = 34;
const LANE_PAD = 30;
const AXIS = 34;
const LANES: Array<{ id: ThemeId; label: string; color: string }> = [
  { id: 'politics', label: 'Politics & Power', color: 'var(--viz-politics)' },
  { id: 'economy', label: 'Economy & Society', color: 'var(--viz-economy)' },
  { id: 'culture', label: 'Religion, Reform & Culture', color: 'var(--viz-culture)' },
];
const laneColor = (id: ThemeId) => LANES.find((l) => l.id === id)?.color ?? 'var(--viz-prologue)';

export default function TimelinePage() {
  usePageMeta('Living Timeline', 'Living Timeline');
  const [params, setParams] = useSearchParams();
  const tab = params.get('mode') === 'game' ? 'game' : 'explore';
  const setTab = (t: 'explore' | 'game') => {
    const next = new URLSearchParams(params);
    if (t === 'game') next.set('mode', 'game');
    else next.delete('mode');
    setParams(next, { replace: true });
  };
  return (
    <div className="wrap">
      <PageHeader
        kicker="The long view"
        title="Living Timeline"
        lede="Every dated event in the unit, from the term names and their definitions, in three lanes by theme. Select an event to see what caused it and what it led to."
        motif="compass"
      />
      <div role="tablist" aria-label="Timeline mode" className="mt-6 inline-flex rounded-md border border-rule-strong p-1">
        {(
          [
            ['explore', 'Explore'],
            ['game', 'Game: put in order'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const nextTab = tab === 'explore' ? 'game' : 'explore';
                setTab(nextTab);
                requestAnimationFrame(() => document.getElementById(`tab-${nextTab}`)?.focus());
              }
            }}
            className={`min-h-10 rounded px-4 text-sm font-semibold ${tab === id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-sunk'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
        {tab === 'explore' ? <Explorer /> : <TimelineGame />}
      </div>
    </div>
  );
}

interface Placed {
  e: TimelineEvent;
  x0: number;
  xEnd: number;
  top: number;
  labelW: number;
}

function Explorer() {
  const all = timelineEvents();
  const [themes, setThemes] = useState<ThemeId[]>(['politics', 'economy', 'culture']);
  const [topic, setTopic] = useState('');
  const [pxPerYear, setPx] = useState(30);
  const [view, setView] = useState<'chart' | 'list'>('chart');
  const [selected, setSelected] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const visible = useMemo(() => all.filter((e) => themes.includes(e.theme) && (!topic || e.term.topicId === topic)), [all, themes, topic]);
  const x = (y: number) => (y - DOMAIN[0]) * pxPerYear + PAD;
  const width = x(DOMAIN[1]) + PAD;

  const lanes = useMemo(() => {
    let offset = AXIS;
    return LANES.filter((l) => themes.includes(l.id)).map((lane) => {
      const rows: number[] = [];
      const items: Placed[] = [];
      for (const e of visible.filter((v) => v.theme === lane.id)) {
        const x0 = x(e.start);
        const xEnd = e.end ? x(e.end) : x0;
        const labelW = Math.min(180, e.term.term.length * 6.4 + 28);
        const right = Math.max(xEnd, x0 + labelW) + 10;
        let row = rows.findIndex((r) => r <= x0 - 6);
        if (row === -1) {
          row = rows.length;
          rows.push(0);
        }
        rows[row] = right;
        items.push({ e, x0, xEnd, labelW, top: offset + LANE_PAD + row * ROW });
      }
      const height = LANE_PAD + Math.max(1, rows.length) * ROW + 10;
      const out = { ...lane, items, top: offset, height };
      offset += height;
      return out;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, pxPerYear, themes]);

  const placed = useMemo(() => lanes.flatMap((l) => l.items).sort((a, b) => a.e.start - b.e.start || a.top - b.top), [lanes]);
  const totalHeight = lanes.length ? lanes[lanes.length - 1].top + lanes[lanes.length - 1].height : AXIS + 60;

  // Start scrolled to 1800.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = x(1797);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ctrl/⌘ + wheel zooms around the pointer (needs a non-passive listener).
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      if (!ev.ctrlKey && !ev.metaKey) return;
      ev.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = ev.clientX - rect.left + el.scrollLeft;
      setPx((cur) => {
        const year = (px - PAD) / cur + DOMAIN[0];
        const next = Math.max(14, Math.min(160, cur * (ev.deltaY < 0 ? 1.15 : 1 / 1.15)));
        requestAnimationFrame(() => {
          el.scrollLeft = (year - DOMAIN[0]) * next + PAD - (ev.clientX - rect.left);
        });
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [view]);

  const zoom = (factor: number) => {
    const el = scroller.current;
    const centerYear = el ? (el.scrollLeft + el.clientWidth / 2 - PAD) / pxPerYear + DOMAIN[0] : 1825;
    const next = Math.max(14, Math.min(160, pxPerYear * factor));
    setPx(next);
    requestAnimationFrame(() => {
      if (el) el.scrollLeft = (centerYear - DOMAIN[0]) * next + PAD - el.clientWidth / 2;
    });
  };

  // Mouse drag pans the chart (touch already pans natively).
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || (e.target as HTMLElement).closest('button')) return;
    const el = scroller.current!;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const el = scroller.current!;
    el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    el.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };
  const endDrag = () => (drag.current = null);

  const focusEvent = (i: number) => {
    const n = Math.max(0, Math.min(placed.length - 1, i));
    setFocusIdx(n);
    const b = buttons.current[n];
    b?.focus({ preventScroll: true });
    b?.scrollIntoView({ block: 'nearest', inline: 'center' });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => focusEvent(focusIdx + 1),
      ArrowDown: () => focusEvent(focusIdx + 1),
      ArrowLeft: () => focusEvent(focusIdx - 1),
      ArrowUp: () => focusEvent(focusIdx - 1),
      Home: () => focusEvent(0),
      End: () => focusEvent(placed.length - 1),
      '+': () => zoom(1.3),
      '=': () => zoom(1.3),
      '-': () => zoom(1 / 1.3),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  const ticks = [];
  const labelEvery = pxPerYear >= 40 ? 5 : 10;
  for (let y = Math.ceil(DOMAIN[0]); y <= DOMAIN[1]; y++) ticks.push(y);
  const selectedEvent = selected ? all.find((e) => e.term.id === selected) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Themes</legend>
            {LANES.map((l) => (
              <label key={l.id} className="chip cursor-pointer has-[:checked]:border-ink">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={themes.includes(l.id)}
                  onChange={() => setThemes((t) => (t.includes(l.id) ? t.filter((v) => v !== l.id) : [...t, l.id]))}
                />
                <span className="h-3 w-3 rounded-full" style={{ background: themes.includes(l.id) ? l.color : 'transparent', boxShadow: `inset 0 0 0 2px ${l.color}` }} aria-hidden="true" />
                {l.label}
              </label>
            ))}
          </fieldset>
          <div>
            <label htmlFor="tl-topic" className="sr-only">
              Topic
            </label>
            <select id="tl-topic" className="field min-h-10 py-1.5" value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} {TOPIC_SHORT[t.id]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="View">
            <button type="button" className="chip" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>
              Chart
            </button>
            <button type="button" className="chip" aria-pressed={view === 'list'} onClick={() => setView('list')}>
              List
            </button>
          </div>
          {view === 'chart' && (
            <div className="flex items-center gap-1" role="group" aria-label="Zoom">
              <button type="button" className="btn btn-secondary btn-sm w-10 px-0" onClick={() => zoom(1 / 1.3)} aria-label="Zoom out">
                −
              </button>
              <button type="button" className="btn btn-secondary btn-sm w-10 px-0" onClick={() => zoom(1.3)} aria-label="Zoom in">
                +
              </button>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {visible.length} events. {view === 'chart' && <>Drag or scroll to pan; <Kbd>Ctrl</Kbd> + wheel or the buttons to zoom; arrow keys step through events.</>}
        </p>

        {view === 'chart' ? (
          <div
            ref={scroller}
            className="scrollbar-thin panel relative mt-3 max-h-[64vh] cursor-grab overflow-auto overscroll-contain active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="relative" style={{ width, height: totalHeight }}>
              {/* Period 4 band */}
              <div
                className="absolute bottom-0 top-0"
                style={{ left: x(1800), width: x(1848) - x(1800), background: 'color-mix(in srgb, var(--brass) 9%, transparent)' }}
                aria-hidden="true"
              />
              {/* gridlines + axis */}
              <div className="sticky top-0 z-20 border-b border-rule bg-card" style={{ height: AXIS, width }} aria-hidden="true">
                {ticks.map((y) => (
                  <div key={y} className="absolute bottom-0" style={{ left: x(y) }}>
                    <div className="w-px bg-rule-strong" style={{ height: y % labelEvery === 0 ? 10 : 4 }} />
                    {y % labelEvery === 0 && (
                      <span className="absolute bottom-3 -translate-x-1/2 text-[11px] font-semibold tabular text-muted">{y}</span>
                    )}
                  </div>
                ))}
                <span className="absolute top-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brass-ink" style={{ left: x(1800) + 6 }}>
                  Period 4
                </span>
              </div>
              {ticks
                .filter((y) => y % 10 === 0)
                .map((y) => (
                  <div key={`g${y}`} className="absolute bottom-0 w-px" style={{ left: x(y), top: AXIS, background: 'var(--viz-grid)' }} aria-hidden="true" />
                ))}
              {lanes.map((l) => (
                <div key={l.id} className="absolute left-0 border-t border-rule" style={{ top: l.top, height: l.height, width }} aria-hidden="true">
                  <span className="sticky left-2 top-1 ml-2 mt-1.5 inline-flex items-center gap-1.5 rounded bg-card/90 px-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                    {l.label}
                  </span>
                </div>
              ))}
              {/* events */}
              <div role="group" aria-label="Timeline events. Use the arrow keys to move between events, Enter to open one." onKeyDown={onKeyDown}>
                {placed.map((p, i) => {
                  const isSel = selected === p.e.term.id;
                  const color = laneColor(p.e.theme);
                  return (
                    <div key={p.e.term.id}>
                      {p.e.end && (
                        <span
                          className="absolute h-[3px] rounded-full"
                          style={{ left: p.x0, width: Math.max(4, p.xEnd - p.x0), top: p.top + 27, background: color, opacity: 0.7 }}
                          aria-hidden="true"
                        />
                      )}
                      <button
                        ref={(el) => {
                          buttons.current[i] = el;
                        }}
                        type="button"
                        tabIndex={i === focusIdx ? 0 : -1}
                        aria-pressed={isSel}
                        aria-label={`${p.e.term.term}, ${p.e.label}`}
                        onFocus={() => setFocusIdx(i)}
                        onClick={() => setSelected(p.e.term.id)}
                        className={`absolute flex h-[26px] items-center gap-1.5 rounded-full pl-0.5 pr-2 text-[12.5px] leading-none transition-colors ${
                          isSel ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-sunk hover:text-ink'
                        }`}
                        style={{ left: p.x0 - 7, top: p.top }}
                      >
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: color, boxShadow: '0 0 0 2px var(--card)' }} aria-hidden="true" />
                        <span className="truncate" style={{ maxWidth: p.labelW - 22 }}>
                          {p.e.term.term}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <EventList events={visible} selected={selected} onSelect={setSelected} />
        )}
      </div>

      <EventDetail
        event={selectedEvent}
        onClose={() => setSelected(null)}
        onJump={(termId) => {
          setSelected(termId);
          const i = placed.findIndex((p) => p.e.term.id === termId);
          if (i >= 0 && view === 'chart') focusEvent(i);
        }}
      />
    </div>
  );
}

function EventList({ events, selected, onSelect }: { events: TimelineEvent[]; selected: string | null; onSelect: (id: string) => void }) {
  const decades = new Map<number, TimelineEvent[]>();
  for (const e of events) {
    const d = Math.floor(e.start / 10) * 10;
    decades.set(d, [...(decades.get(d) ?? []), e]);
  }
  return (
    <div className="mt-3 grid gap-6">
      {[...decades.entries()].map(([d, list]) => (
        <section key={d} aria-labelledby={`dec-${d}`}>
          <h3 id={`dec-${d}`} className="border-b border-rule pb-1 text-xl font-semibold">
            {d}s
          </h3>
          <ul className="mt-2 grid gap-1">
            {list.map((e) => (
              <li key={e.term.id}>
                <button
                  type="button"
                  aria-pressed={selected === e.term.id}
                  onClick={() => onSelect(e.term.id)}
                  className={`flex w-full items-baseline gap-3 rounded px-2 py-1.5 text-left ${selected === e.term.id ? 'bg-ink text-paper' : 'hover:bg-sunk'}`}
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 self-start rounded-full" style={{ background: laneColor(e.theme) }} aria-hidden="true" />
                  <span className="w-28 shrink-0 text-sm tabular opacity-80">{e.label}</span>
                  <span className="flex-1">{e.term.term}</span>
                  <span className="text-xs opacity-70">{e.term.topicId}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function EventDetail({ event, onClose, onJump }: { event?: TimelineEvent; onClose: () => void; onJump: (termId: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const datedIds = useMemo(() => new Set(timelineEvents().map((e) => e.term.id)), []);
  useEffect(() => {
    if (event && window.matchMedia('(max-width: 1023px)').matches) ref.current?.focus();
  }, [event]);
  const theme = THEMES.find((t) => t.id === event?.theme);
  const ctx = event ? causalContext(event.term.id) : null;
  const jumpTarget = (nodeId: string) => nodeTerms(nodeId).find((id) => datedIds.has(id));

  return (
    <aside
      ref={ref}
      tabIndex={-1}
      aria-label="Event details"
      className={`${event ? 'fixed inset-x-0 bottom-0 z-40 max-h-[62vh] overflow-auto rounded-t-xl border-t-2 border-rule-strong bg-card shadow-paper' : 'hidden'} outline-none lg:sticky lg:top-4 lg:block lg:max-h-[calc(100vh-2rem)] lg:self-start lg:rounded-md lg:border lg:border-rule`}
    >
      {!event ? (
        <div className="p-5 text-sm text-muted">
          <p className="font-display text-lg font-semibold text-ink">Select an event</p>
          <p className="mt-1">Its definition, Yawp citation and causes and effects appear here.</p>
          <ul className="mt-4 grid gap-1.5">
            {LANES.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: l.color }} aria-hidden="true" />
                {l.label}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-5" style={{ borderTop: `4px solid ${laneColor(event.theme)}` }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="kicker">{event.label}</p>
              <h2 className="mt-1 text-xl font-semibold">{event.term.term}</h2>
            </div>
            <button type="button" className="btn btn-ghost btn-sm -mr-2" onClick={onClose} aria-label="Close details">
              ✕
            </button>
          </div>
          <p className="mt-2 text-ink-soft">{event.term.def}</p>
          <p className="mt-2 text-xs text-muted">
            Yawp {event.term.yawp} · {topicById.get(event.term.topicId)?.id} {topicById.get(event.term.topicId)?.title} · {theme?.label}
            {event.source === 'curated' && ' · Date added from the definition or a standard date (see Content Notes).'}
          </p>
          {ctx && (ctx.causedBy.length > 0 || ctx.ledTo.length > 0) ? (
            <div className="mt-4 grid gap-4">
              {(
                [
                  ['Caused by', ctx.causedBy],
                  ['Led to', ctx.ledTo],
                ] as const
              ).map(([title, list]) =>
                list.length ? (
                  <div key={title}>
                    <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">{title}</h3>
                    <ul className="mt-1.5 grid gap-2">
                      {list.map(({ node, why }) => {
                        const target = jumpTarget(node.id);
                        return (
                          <li key={node.id} className="rounded border border-rule p-2.5 text-sm">
                            <p className="font-semibold">
                              {title === 'Caused by' ? '← ' : '→ '}
                              {node.label} <span className="font-normal text-muted">({node.when})</span>
                            </p>
                            <p className="mt-0.5 text-ink-soft">{why}</p>
                            {target && (
                              <button type="button" className="mt-1 text-sm font-semibold text-teal underline underline-offset-2" onClick={() => onJump(target)}>
                                Show {termById.get(target)?.term}
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No cause-and-effect links are mapped for this term yet. Try the Causation Web for the big chains.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/glossary?term=${encodeURIComponent(event.term.id)}`} className="btn btn-secondary btn-sm">
              Glossary entry
            </Link>
            <Link to={`/story/${event.term.topicId}`} className="btn btn-ghost btn-sm">
              Story {event.term.topicId}
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

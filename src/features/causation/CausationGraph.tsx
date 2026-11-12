/**
 * Force-directed causation graph. The layout is computed once (d3-force,
 * with a gentle pull toward each node's year so time reads left → right);
 * nodes can then be dragged, which re-heats the simulation briefly.
 */
import { type Simulation, type SimulationLinkDatum, type SimulationNodeDatum, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { resolveRef } from '../../lib/data';
import type { Term } from '../../lib/types';
import { CAUSE_LINKS, CAUSE_NODES, type CauseNode } from '../../unit/causation';

const W = 1100;
const H = 760;
/** Each theme gets its own band, so the web reads like the timeline: time left → right, theme top → bottom. */
const BAND_Y: Record<CauseNode['theme'], number> = { politics: H * 0.26, economy: H * 0.58, culture: H * 0.84 };
const THEME_COLOR: Record<CauseNode['theme'], string> = {
  politics: 'var(--viz-politics)',
  economy: 'var(--viz-economy)',
  culture: 'var(--viz-culture)',
};
const THEME_LABEL: Record<CauseNode['theme'], string> = {
  politics: 'Politics & Power',
  economy: 'Economy & Society',
  culture: 'Religion, Reform & Culture',
};

interface SimNode extends SimulationNodeDatum {
  id: string;
  node: CauseNode;
}
type SimLink = SimulationLinkDatum<SimNode> & { why: string };

function yearX(y: number) {
  return 70 + ((Math.min(1850, Math.max(1790, y)) - 1790) / 60) * (W - 140);
}

export function CausationGraph() {
  const [selected, setSelected] = useState<string | null>('cottonBoom');
  const [view, setView] = useState<'graph' | 'list'>('graph');
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const sim = useRef<Simulation<SimNode, SimLink> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const nodes: SimNode[] = CAUSE_NODES.map((n, i) => ({ id: n.id, node: n, x: yearX(n.year), y: BAND_Y[n.theme] + ((i * 37) % 80) - 40 }));
    const links: SimLink[] = CAUSE_LINKS.map((l) => ({ source: l.from, target: l.to, why: l.why }));
    const s = forceSimulation<SimNode, SimLink>(nodes)
      .force('link', forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(80).strength(0.35))
      .force('charge', forceManyBody().strength(-170))
      .force('x', forceX<SimNode>((d) => yearX(d.node.year)).strength(0.38))
      .force('y', forceY<SimNode>((d) => BAND_Y[d.node.theme]).strength(0.16))
      .force('collide', forceCollide<SimNode>((d) => 16 + Math.min(62, d.node.label.length * 2.4)).strength(0.95))
      .stop();
    for (let i = 0; i < 320; i++) s.tick();
    const clamp = () => {
      for (const n of nodes) {
        n.x = Math.max(40, Math.min(W - 40, n.x ?? 0));
        n.y = Math.max(40, Math.min(H - 24, n.y ?? 0));
      }
    };
    clamp();
    const snapshot = () => setPositions(new Map(nodes.map((n) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }])));
    snapshot();
    let frame = 0;
    s.on('tick', () => {
      clamp();
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          snapshot();
        });
      }
    });
    sim.current = s;
    nodesRef.current = nodes;
    return () => {
      s.stop();
      cancelAnimationFrame(frame);
    };
  }, []);

  const dragging = useRef<SimNode | null>(null);
  const toSvg = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
  };

  const active = selected ? CAUSE_NODES.find((n) => n.id === selected) : undefined;
  const linked = useMemo(() => {
    const ids = new Set<string>();
    if (selected) {
      ids.add(selected);
      for (const l of CAUSE_LINKS) {
        if (l.from === selected) ids.add(l.to);
        if (l.to === selected) ids.add(l.from);
      }
    }
    return ids;
  }, [selected]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1" role="group" aria-label="View">
            <button type="button" className="chip" aria-pressed={view === 'graph'} onClick={() => setView('graph')}>
              Web
            </button>
            <button type="button" className="chip" aria-pressed={view === 'list'} onClick={() => setView('list')}>
              List
            </button>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft" aria-label="Legend">
            {(Object.keys(THEME_COLOR) as CauseNode['theme'][]).map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: THEME_COLOR[t] }} aria-hidden="true" />
                {THEME_LABEL[t]}
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true">→</span> cause → effect · earlier events sit to the left
            </li>
          </ul>
        </div>

        {view === 'graph' ? (
          <div className="scrollbar-thin panel mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Causation web (scrolls sideways on small screens)">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="block w-full min-w-[760px] touch-none select-none"
              role="img"
              aria-label="Causation web. Use the List view for a text version of every node and link."
              onPointerMove={(e) => {
                const d = dragging.current;
                if (!d) return;
                const p = toSvg(e);
                d.fx = p.x;
                d.fy = p.y;
              }}
              onPointerUp={() => {
                const d = dragging.current;
                if (d) {
                  d.fx = null;
                  d.fy = null;
                }
                dragging.current = null;
                sim.current?.alphaTarget(0);
              }}
            >
              <defs>
                <marker id="cw-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0L10 5L0 10z" style={{ fill: 'var(--rule-strong)' }} />
                </marker>
                <marker id="cw-arrow-on" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0L10 5L0 10z" style={{ fill: 'var(--ink)' }} />
                </marker>
              </defs>
              {[1800, 1810, 1820, 1830, 1840, 1850].map((y) => (
                <g key={y} aria-hidden="true">
                  <line x1={yearX(y)} x2={yearX(y)} y1={18} y2={H - 8} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
                  <text x={yearX(y)} y={14} textAnchor="middle" style={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                    {y}
                  </text>
                </g>
              ))}
              {CAUSE_LINKS.map((l) => {
                const a = positions.get(l.from);
                const b = positions.get(l.to);
                if (!a || !b) return null;
                const on = selected && (l.from === selected || l.to === selected);
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const len = Math.hypot(dx, dy) || 1;
                const r = 11;
                return (
                  <line
                    key={`${l.from}-${l.to}`}
                    x1={a.x + (dx / len) * r}
                    y1={a.y + (dy / len) * r}
                    x2={b.x - (dx / len) * (r + 2)}
                    y2={b.y - (dy / len) * (r + 2)}
                    markerEnd={on ? 'url(#cw-arrow-on)' : 'url(#cw-arrow)'}
                    style={{ stroke: on ? 'var(--ink)' : 'var(--rule-strong)', strokeWidth: on ? 2.2 : 1.2, opacity: selected && !on ? 0.35 : 1 }}
                  />
                );
              })}
              {CAUSE_NODES.map((n) => {
                const p = positions.get(n.id);
                if (!p) return null;
                const isSel = selected === n.id;
                const dim = selected && !linked.has(n.id);
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x},${p.y})`}
                    className="cursor-pointer"
                    style={{ opacity: dim ? 0.3 : 1, transition: 'opacity 0.2s' }}
                    onPointerDown={(e) => {
                      const d = nodesRef.current.find((x) => x.id === n.id);
                      if (!d) return;
                      (e.target as Element).setPointerCapture?.(e.pointerId);
                      dragging.current = d;
                      sim.current?.alphaTarget(0.25).restart();
                    }}
                    onClick={() => setSelected(n.id)}
                  >
                    <circle r={18} style={{ fill: 'transparent' }} />
                    <circle r={isSel ? 11 : 8.5} style={{ fill: THEME_COLOR[n.theme], stroke: 'var(--card)', strokeWidth: 2.5 }} />
                    <text
                      y={isSel ? -16 : -13}
                      textAnchor="middle"
                      style={{
                        fill: 'var(--ink)',
                        stroke: 'var(--card)',
                        strokeWidth: 4,
                        paintOrder: 'stroke',
                        fontSize: isSel ? 13.5 : 12,
                        fontWeight: isSel ? 750 : 600,
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <NodeList selected={selected} onSelect={setSelected} />
        )}
        <p className="mt-2 text-xs text-muted">Click a node to trace its causes and effects. Drag nodes to untangle the web.</p>
      </div>

      <aside className="panel content-start self-start p-4 xl:sticky xl:top-4" aria-live="polite" aria-label="Node details">
        {active ? <NodeDetail node={active} onSelect={setSelected} /> : <p className="text-sm text-muted">Select a node.</p>}
      </aside>
    </div>
  );
}

function NodeDetail({ node, onSelect }: { node: CauseNode; onSelect: (id: string) => void }) {
  const byId = new Map(CAUSE_NODES.map((n) => [n.id, n]));
  const causes = CAUSE_LINKS.filter((l) => l.to === node.id);
  const effects = CAUSE_LINKS.filter((l) => l.from === node.id);
  const termsList = node.terms.map((r) => resolveRef(r)).filter((t): t is Term => !!t);
  return (
    <div>
      <p className="kicker" style={{ color: THEME_COLOR[node.theme] }}>
        {THEME_LABEL[node.theme]} · {node.when}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{node.label}</h2>
      {(
        [
          ['Causes', causes, 'from'],
          ['Effects', effects, 'to'],
        ] as const
      ).map(([title, list, key]) => (
        <div key={title} className="mt-4">
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">{title}</h3>
          {list.length === 0 ? (
            <p className="mt-1 text-sm text-muted">None mapped in this web.</p>
          ) : (
            <ul className="mt-1.5 grid gap-2">
              {list.map((l) => {
                const other = byId.get(l[key])!;
                return (
                  <li key={`${l.from}-${l.to}`} className="rounded border border-rule p-2.5 text-sm">
                    <button type="button" className="font-semibold text-teal underline underline-offset-2" onClick={() => onSelect(other.id)}>
                      {title === 'Causes' ? '← ' : '→ '}
                      {other.label}
                    </button>
                    <p className="mt-0.5 text-ink-soft">{l.why}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
      <div className="mt-4 border-t border-rule pt-3">
        <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Terms</h3>
        <ul className="mt-1.5 grid gap-1.5 text-sm">
          {termsList.map((t) => (
            <li key={t.id}>
              <Link to={`/glossary?term=${encodeURIComponent(t.id)}`} className="font-semibold underline decoration-[var(--brass)] decoration-2 underline-offset-2">
                {t.term}
              </Link>
              <span className="text-ink-soft">: {t.def}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NodeList({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const sorted = CAUSE_NODES.slice().sort((a, b) => a.year - b.year);
  return (
    <ul className="mt-3 grid gap-1">
      {sorted.map((n) => {
        const effects = CAUSE_LINKS.filter((l) => l.from === n.id).map((l) => CAUSE_NODES.find((x) => x.id === l.to)!.label);
        return (
          <li key={n.id}>
            <button
              type="button"
              aria-pressed={selected === n.id}
              onClick={() => onSelect(n.id)}
              className={`flex w-full items-start gap-3 rounded px-3 py-2 text-left ${selected === n.id ? 'bg-ink text-paper' : 'hover:bg-sunk'}`}
            >
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: THEME_COLOR[n.theme] }} aria-hidden="true" />
              <span className="flex-1">
                <span className="font-semibold">{n.label}</span> <span className="text-sm opacity-75">({n.when})</span>
                {effects.length > 0 && <span className="block text-sm opacity-80">Led to: {effects.join('; ')}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

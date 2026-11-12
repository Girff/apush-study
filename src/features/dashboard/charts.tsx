/**
 * Dashboard charts. Built to the dataviz rules used across the site: one
 * validated teal ramp for ordered values, text in text tokens, a 2px surface
 * gap between touching marks, hover/focus tooltips that only enhance, and a
 * table view for every chart.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { topics } from '../../lib/data';
import { type MasteryStatus, isSeen, statusCounts, topicMastery } from '../../lib/mastery';
import { type ProgressState, dayKey } from '../../lib/progress';
import { TOPIC_SHORT } from '../../unit/config';

const BIN_STEPS = ['--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5'];
const BIN_TEXT = ['--seq-text-1', '--seq-text-2', '--seq-text-3', '--seq-text-4', '--seq-text-5'];
const bin = (v: number) => Math.min(4, Math.floor(v * 5));

function ViewToggle({ table, setTable, label }: { table: boolean; setTable: (v: boolean) => void; label: string }) {
  return (
    <div className="flex gap-1" role="group" aria-label={`${label} view`}>
      <button type="button" className="chip !min-h-8 !py-0.5 text-xs" aria-pressed={!table} onClick={() => setTable(false)}>
        Chart
      </button>
      <button type="button" className="chip !min-h-8 !py-0.5 text-xs" aria-pressed={table} onClick={() => setTable(true)}>
        Table
      </button>
    </div>
  );
}

/** One whole (all terms) split into four ordered statuses: a tall segmented bar. */
export function StatusBar({ progress }: { progress: ProgressState }) {
  const counts = statusCounts(progress);
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const parts: Array<{ key: MasteryStatus; label: string; fill: string; text: string }> = [
    { key: 'mastered', label: 'Mastered', fill: 'var(--seq-5)', text: 'var(--seq-text-5)' },
    { key: 'familiar', label: 'Familiar', fill: 'var(--seq-4)', text: 'var(--seq-text-4)' },
    { key: 'learning', label: 'Learning', fill: 'var(--seq-2)', text: 'var(--seq-text-2)' },
    { key: 'new', label: 'Not yet studied', fill: 'var(--seq-track)', text: 'var(--ink)' },
  ];
  return (
    <figure>
      <div
        className="flex h-7 w-full gap-[2px] overflow-hidden rounded"
        role="img"
        aria-label={parts.map((p) => `${p.label}: ${counts[p.key]} of ${total}`).join('; ')}
      >
        {parts
          .filter((p) => counts[p.key] > 0)
          .map((p) => {
            const share = counts[p.key] / total;
            return (
              <div
                key={p.key}
                className="flex h-full items-center rounded-[4px] px-2 text-xs font-semibold"
                style={{ width: `${share * 100}%`, background: p.fill, color: p.text }}
                title={`${p.label}: ${counts[p.key]} (${Math.round(share * 100)}%)`}
              >
                {share > 0.09 ? `${Math.round(share * 100)}%` : ''}
              </div>
            );
          })}
      </div>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        {parts.map((p) => (
          <span key={p.key} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: p.fill }} aria-hidden="true" />
            {p.label} <span className="font-semibold tabular text-ink">{counts[p.key]}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/** Topic mastery as a heat grid: one tile per topic, five ordered bins of one hue. */
export function TopicHeatmap({ progress }: { progress: ProgressState }) {
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      topics.map((t) => ({
        topic: t,
        mastery: topicMastery(t.id, progress),
        started: t.terms.some((term) => isSeen(term.id, progress)),
        counts: statusCounts(
          progress,
          t.terms.map((x) => x.id),
        ),
      })),
    [progress],
  );
  return (
    <section aria-labelledby="heat-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="heat-title" className="text-xl font-semibold">
          Mastery by topic
        </h2>
        <ViewToggle table={table} setTable={setTable} label="Mastery by topic" />
      </div>
      {table ? (
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="py-1.5 pr-2 font-semibold">Topic</th>
              <th className="py-1.5 pr-2 text-right font-semibold">Mastery</th>
              <th className="py-1.5 pr-2 text-right font-semibold">Mastered</th>
              <th className="py-1.5 text-right font-semibold">Studied</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {rows.map((r) => (
              <tr key={r.topic.id} className="border-t border-rule">
                <td className="py-1.5 pr-2">
                  {r.topic.id} {r.topic.title}
                </td>
                <td className="py-1.5 pr-2 text-right">{Math.round(r.mastery * 100)}%</td>
                <td className="py-1.5 pr-2 text-right">{r.counts.mastered}</td>
                <td className="py-1.5 text-right">
                  {r.topic.terms.length - r.counts.new}/{r.topic.terms.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <ul className="mt-3 grid grid-cols-2 gap-[3px] sm:grid-cols-4 lg:grid-cols-5">
            {rows.map((r) => {
              const b = bin(r.mastery);
              const style = r.started
                ? { background: `var(${BIN_STEPS[b]})`, color: `var(${BIN_TEXT[b]})` }
                : { background: 'var(--sunk)', color: 'var(--ink-soft)' };
              return (
                <li key={r.topic.id} className="relative">
                  <Link
                    to={`/story/${r.topic.id}`}
                    className={`flex h-24 flex-col justify-between rounded-[4px] p-2.5 transition-[filter] hover:brightness-110 ${r.started ? '' : 'border border-dashed border-rule-strong'}`}
                    style={style}
                    onPointerEnter={() => setHover(r.topic.id)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(r.topic.id)}
                    onBlur={() => setHover(null)}
                  >
                    <span className="text-xs font-semibold">
                      {r.topic.id} · {TOPIC_SHORT[r.topic.id]}
                      <span className="sr-only">, {r.topic.title}:</span>
                    </span>
                    <span className="font-sans text-2xl font-semibold">
                      {r.started ? `${Math.round(r.mastery * 100)}%` : <span aria-hidden="true">—</span>}
                      <span className="sr-only">{r.started ? ' mastery' : 'not started'}</span>
                    </span>
                  </Link>
                  {hover === r.topic.id && (
                    <div className="panel pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-56 -translate-x-1/2 p-2.5 text-xs" role="tooltip">
                      <p className="text-sm font-semibold text-ink">{Math.round(r.mastery * 100)}% mastery</p>
                      <p className="text-muted">
                        {r.topic.id} {r.topic.title}
                      </p>
                      <p className="mt-1 text-ink-soft">
                        {r.counts.mastered} mastered · {r.counts.familiar} familiar · {r.counts.learning} learning · {r.counts.new} not yet studied
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft" aria-label="Legend">
            {['0–19%', '20–39%', '40–59%', '60–79%', '80–100%'].map((l, i) => (
              <span key={l} className="flex items-center gap-1">
                <span className="h-3 w-5 rounded-sm" style={{ background: `var(${BIN_STEPS[i]})` }} aria-hidden="true" />
                {l}
              </span>
            ))}
            <span className="flex items-center gap-1">
              <span className="h-3 w-5 rounded-sm border border-dashed border-rule-strong bg-sunk" aria-hidden="true" />
              Not started
            </span>
          </div>
        </>
      )}
    </section>
  );
}

/** Study calendar for the last 18 weeks; each cell's shade is that day's XP. */
export function StreakCalendar({ progress }: { progress: ProgressState }) {
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<{ key: string; xp: number; x: number; y: number } | null>(null);
  const weeks = 18;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const start = new Date(today);
  // Columns are weeks (Sunday first); the last column is this week, ending today.
  start.setDate(start.getDate() - ((weeks - 1) * 7 + today.getDay()));
  const days: Array<{ key: string; date: Date; xp: number }> = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d > today) break;
    const key = dayKey(d.getTime());
    days.push({ key, date: d, xp: progress.activity[key]?.xp ?? 0 });
  }
  const level = (xp: number) => (xp === 0 ? -1 : xp <= 20 ? 1 : xp <= 60 ? 2 : xp <= 120 ? 3 : 4);
  const active = days.filter((d) => d.xp > 0);
  const cell = 14;
  const gap = 3;
  return (
    <section aria-labelledby="cal-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="cal-title" className="text-xl font-semibold">
          Study calendar
        </h2>
        <ViewToggle table={table} setTable={setTable} label="Study calendar" />
      </div>
      <p className="mt-1 text-sm text-muted">
        {active.length} day{active.length === 1 ? '' : 's'} with study in the last {weeks} weeks.
      </p>
      {table ? (
        active.length ? (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-1 font-semibold">Day</th>
                <th className="py-1 text-right font-semibold">XP</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {active
                .slice()
                .reverse()
                .map((d) => (
                  <tr key={d.key} className="border-t border-rule">
                    <td className="py-1">{d.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td className="py-1 text-right">{d.xp}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-3 text-sm text-muted">No study days yet.</p>
        )
      ) : (
        <div className="relative mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Study calendar grid, by week">
          <svg width={weeks * (cell + gap)} height={7 * (cell + gap)} role="img" aria-label={`${active.length} study days in the last ${weeks} weeks. Use the table view for the list.`}>
            {days.map((d, i) => {
              const lv = level(d.xp);
              const col = Math.floor(i / 7);
              const row = i % 7;
              return (
                <rect
                  key={d.key}
                  x={col * (cell + gap)}
                  y={row * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx={3}
                  style={{ fill: lv < 0 ? 'var(--sunk)' : `var(${BIN_STEPS[lv]})`, stroke: d.key === dayKey() ? 'var(--ink)' : 'none', strokeWidth: 1.5 }}
                  onPointerEnter={() => setHover({ key: d.key, xp: d.xp, x: col * (cell + gap), y: row * (cell + gap) })}
                  onPointerLeave={() => setHover(null)}
                />
              );
            })}
          </svg>
          {hover && (
            <div className="panel pointer-events-none absolute z-10 px-2 py-1 text-xs" style={{ left: hover.x + 18, top: hover.y - 6 }} role="tooltip">
              <span className="font-semibold">{hover.xp} XP</span> · {hover.key}
            </div>
          )}
          <div className="mt-2 flex items-center gap-1 text-xs text-ink-soft" aria-hidden="true">
            Less
            <span className="h-3 w-3 rounded-sm bg-sunk" />
            {[1, 2, 3, 4].map((l) => (
              <span key={l} className="h-3 w-3 rounded-sm" style={{ background: `var(${BIN_STEPS[l]})` }} />
            ))}
            More
          </div>
        </div>
      )}
    </section>
  );
}

/** Quiz scores over time: one series, so no legend box; the title names it. */
export function QuizHistory({ progress }: { progress: ProgressState }) {
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const quizzes = progress.quizzes.slice(-20);
  const W = 460;
  const H = 210;
  const pad = { l: 44, r: 14, t: 16, b: 30 };
  const x = (i: number) => pad.l + (quizzes.length <= 1 ? (W - pad.l - pad.r) / 2 : (i / (quizzes.length - 1)) * (W - pad.l - pad.r));
  const y = (pct: number) => pad.t + (1 - pct) * (H - pad.t - pad.b);
  const pts = quizzes.map((q, i) => ({ q, i, pct: q.total ? q.score / q.total : 0 }));
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.i)},${y(p.pct)}`).join(' ');
  const h = hover !== null ? pts[hover] : null;

  return (
    <section aria-labelledby="quiz-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="quiz-title" className="text-xl font-semibold">
          Quiz scores (last {Math.max(quizzes.length, 1)})
        </h2>
        <ViewToggle table={table} setTable={setTable} label="Quiz scores" />
      </div>
      {quizzes.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          No quizzes yet. <Link to="/arcade/quiz" className="font-semibold text-teal underline">Take one</Link> and your scores will chart here.
        </p>
      ) : table ? (
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="py-1.5 pr-2 font-semibold">Date</th>
              <th className="py-1.5 pr-2 font-semibold">Kind</th>
              <th className="py-1.5 pr-2 font-semibold">Topics</th>
              <th className="py-1.5 text-right font-semibold">Score</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {quizzes
              .slice()
              .reverse()
              .map((q) => (
                <tr key={q.id} className="border-t border-rule">
                  <td className="py-1.5 pr-2">{new Date(q.at).toLocaleDateString()}</td>
                  <td className="py-1.5 pr-2">{q.mode === 'story' ? 'Story mini-quiz' : 'Quiz'}</td>
                  <td className="py-1.5 pr-2">{q.topicIds.length > 4 ? `${q.topicIds.length} topics` : q.topicIds.join(', ')}</td>
                  <td className="py-1.5 text-right">
                    {q.score}/{q.total} ({Math.round((q.score / q.total) * 100)}%)
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <div className="relative mt-3">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`Quiz scores for your last ${quizzes.length} quizzes. Latest: ${Math.round(pts[pts.length - 1].pct * 100)}%. Use the table view for every score.`}
            onPointerMove={(e) => {
              const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
              const px = ((e.clientX - r.left) / r.width) * W;
              let best = 0;
              pts.forEach((p, i) => {
                if (Math.abs(x(p.i) - px) < Math.abs(x(pts[best].i) - px)) best = i;
              });
              setHover(best);
            }}
            onPointerLeave={() => setHover(null)}
          >
            {[0, 0.5, 1].map((g) => (
              <g key={g}>
                <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
                <text x={pad.l - 8} y={y(g) + 4} textAnchor="end" className="tabular" style={{ fill: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-sans)' }}>
                  {g * 100}%
                </text>
              </g>
            ))}
            {h && <line x1={x(h.i)} x2={x(h.i)} y1={pad.t} y2={H - pad.b} style={{ stroke: 'var(--rule-strong)', strokeWidth: 1 }} />}
            <path d={path} style={{ fill: 'none', stroke: 'var(--viz-line)', strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' }} />
            {pts.map((p) => (
              <circle key={p.q.id} cx={x(p.i)} cy={y(p.pct)} r={hover === p.i ? 5.5 : 4} style={{ fill: 'var(--viz-line)', stroke: 'var(--card)', strokeWidth: 2 }} />
            ))}
            <text x={x(pts[pts.length - 1].i)} y={y(pts[pts.length - 1].pct) - 10} textAnchor="end" style={{ fill: 'var(--ink)', fontSize: 14, fontWeight: 650, fontFamily: 'var(--font-sans)' }}>
              {Math.round(pts[pts.length - 1].pct * 100)}%
            </text>
            <text x={pad.l} y={H - 8} style={{ fill: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-sans)' }}>
              Oldest
            </text>
            <text x={W - pad.r} y={H - 8} textAnchor="end" style={{ fill: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-sans)' }}>
              Latest
            </text>
          </svg>
          {h && (
            <div
              className="panel pointer-events-none absolute z-10 px-2.5 py-1.5 text-xs"
              style={{ left: `${(x(h.i) / W) * 100}%`, top: 0, transform: `translateX(${h.i > pts.length / 2 ? '-105%' : '8%'})` }}
              role="tooltip"
            >
              <p className="text-sm font-semibold text-ink">{Math.round(h.pct * 100)}%</p>
              <p className="text-muted">
                <span className="mr-1 inline-block h-0.5 w-3 align-middle" style={{ background: 'var(--viz-line)' }} />
                {h.q.score}/{h.q.total} · {new Date(h.q.at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

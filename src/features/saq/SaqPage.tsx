import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader, usePageMeta } from '../../components/ui';
import { resolveRef, terms } from '../../lib/data';
import { getProgress, saveSaq } from '../../lib/progress';
import { nameCores } from '../../lib/related';
import type { Term } from '../../lib/types';
import { SAQS, SAQ_RUBRIC, type SaqPrompt } from '../../unit/saq';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const corePatterns = terms.flatMap((t) => nameCores(t.term).map((core) => ({ term: t, re: new RegExp(`\\b${escapeRe(core)}\\b`, 'i') })));

/** Specific terms ("ESPNs") a student actually used in an answer. */
export function detectTerms(text: string): Term[] {
  const seen = new Map<string, Term>();
  for (const p of corePatterns) if (p.re.test(text) && !seen.has(p.term.term)) seen.set(p.term.term, p.term);
  return [...seen.values()].slice(0, 12);
}

export default function SaqPage() {
  usePageMeta('SAQ Practice', 'SAQ Practice');
  const [id, setId] = useState(SAQS[0]?.id ?? '');
  const prompt = SAQS.find((s) => s.id === id);
  return (
    <div className="wrap">
      <PageHeader
        kicker="Study Arcade · Writing"
        title="SAQ Practice"
        lede="AP short-answer questions have three parts, a point each. Write your answers, then grade yourself against the rubric and a model answer."
        motif="petition"
      />
      {!prompt ? (
      <p className="mt-8 rounded border border-dashed border-rule-strong px-4 py-6 text-center text-sm text-muted">
        No content is configured for this game in the current unit. Add some in <code>src/unit/</code> (see README).
      </p>
      ) : (
      <>
      <div className="mt-6">
        <label htmlFor="saq-pick" className="mb-1 block text-sm font-semibold">
          Prompt
        </label>
        <select id="saq-pick" className="field max-w-md" value={id} onChange={(e) => setId(e.target.value)}>
          {SAQS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.topics.join(', ')})
            </option>
          ))}
        </select>
      </div>
      <Saq key={id} prompt={prompt} />
      </>
      )}
    </div>
  );
}

function Saq({ prompt }: { prompt: SaqPrompt }) {
  const saved = getProgress().saq[prompt.id];
  const [answers, setAnswers] = useState<string[]>(() => saved?.answers ?? ['', '', '']);
  const [checks, setChecks] = useState<boolean[]>(() => saved?.checks ?? [false, false, false]);
  const [revealed, setRevealed] = useState(!!saved);
  const [savedAt, setSavedAt] = useState<number | null>(saved?.at ?? null);
  const detected = useMemo(() => answers.map(detectTerms), [answers]);
  const score = checks.filter(Boolean).length;

  return (
    <div className="mt-6 grid gap-6">
      <p className="text-sm text-muted">Format: no-stimulus SAQ · about 13 minutes on the exam. Topics {prompt.topics.join(' and ')}.</p>
      {prompt.parts.map((part, i) => (
        <section key={part.label} aria-labelledby={`saq-${part.label}`} className="panel p-5">
          <h2 id={`saq-${part.label}`} className="text-lg font-semibold">
            <span className="mr-2 font-display text-2xl text-brass-ink">{part.label}.</span>
            {part.task}
          </h2>
          <label htmlFor={`saq-text-${part.label}`} className="sr-only">
            Your answer to part {part.label}
          </label>
          <textarea
            id={`saq-text-${part.label}`}
            className="field mt-3 min-h-28 resize-y leading-relaxed"
            value={answers[i]}
            onChange={(e) => setAnswers((a) => a.map((x, n) => (n === i ? e.target.value : x)))}
            placeholder="Two or three sentences. Name a specific development, then explain."
          />
          <p className="mt-1 text-xs text-muted">
            {answers[i].trim().split(/\s+/).filter(Boolean).length} words
            {detected[i].length > 0 && <> · Specific terms you used: {detected[i].map((t) => t.term).join('; ')}</>}
          </p>

          {revealed && (
            <div className="mt-4 grid gap-4 border-t border-rule pt-4 md:grid-cols-2">
              <div>
                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Rubric check</h3>
                <ul className="mt-2 grid gap-1.5 text-sm text-ink-soft">
                  {SAQ_RUBRIC.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span aria-hidden="true">□</span>
                      {r}
                    </li>
                  ))}
                </ul>
                <label className="mt-3 flex cursor-pointer items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--teal)]"
                    checked={checks[i]}
                    onChange={(e) => setChecks((c) => c.map((x, n) => (n === i ? e.target.checked : x)))}
                  />
                  I earned the point for part {part.label}
                </label>
              </div>
              <div>
                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Model answer</h3>
                <p className="mt-2 text-sm leading-relaxed">{part.model}</p>
                <h3 className="mt-3 font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Evidence you could use</h3>
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {part.evidence
                    .map((r) => resolveRef(r))
                    .filter((t): t is Term => !!t)
                    .map((t) => (
                      <li key={t.id}>
                        <Link
                          to={`/glossary?term=${encodeURIComponent(t.id)}`}
                          className="inline-flex min-h-8 items-center rounded border border-rule px-2 text-xs text-ink-soft hover:border-ink"
                        >
                          {t.term}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        {!revealed ? (
          <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)} disabled={answers.every((a) => !a.trim())}>
            Show rubric &amp; model answers
          </button>
        ) : (
          <>
            <p className="text-lg font-semibold">Self-score: {score} / 3</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                saveSaq(prompt.id, { answers, checks, selfScore: score });
                setSavedAt(Date.now());
              }}
            >
              Save my score
            </button>
            {savedAt && (
              <p className="text-sm text-muted" role="status">
                Saved {new Date(savedAt).toLocaleString()}.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

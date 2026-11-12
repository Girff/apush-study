import { useMemo, useState } from 'react';
import { ReorderList } from '../../components/ReorderList';
import { XP, awardBadge, awardXp, setBest } from '../../lib/progress';
import { createRng, shuffle } from '../../lib/random';
import { CAUSE_LINKS, CAUSE_NODES, type CauseNode, EXPERT_CHAINS, type ExpertChain, SOLEMN_NODES } from '../../unit/causation';

const byId = new Map(CAUSE_NODES.map((n) => [n.id, n]));
const linkWhy = (a: string, b: string) => CAUSE_LINKS.find((l) => l.from === a && l.to === b)?.why;

/** Longest common subsequence length: rewards the right order even with extra or missing steps. */
function lcs(a: string[], b: string[]): number {
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function scoreChain(user: string[], expert: string[]) {
  const pairs = user.slice(1).map((id, i) => ({ from: user[i], to: id, why: linkWhy(user[i], id) }));
  const valid = pairs.filter((p) => p.why).length;
  const linkScore = pairs.length ? valid / pairs.length : 0;
  const orderScore = lcs(user, expert) / expert.length;
  return { pairs, valid, score: Math.round((0.5 * linkScore + 0.5 * orderScore) * 100) };
}

export function BuildChain() {
  const [chainId, setChainId] = useState(EXPERT_CHAINS[0]?.id ?? '');
  const challenge = EXPERT_CHAINS.find((c) => c.id === chainId);
  if (!challenge) return <p className="text-sm text-muted">No expert chains are configured for this unit.</p>;
  return (
    <div>
      <label htmlFor="chain-pick" className="mb-2 block text-sm font-semibold">
        Challenge
      </label>
      <select id="chain-pick" className="field max-w-md" value={chainId} onChange={(e) => setChainId(e.target.value)}>
        {EXPERT_CHAINS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      <Challenge key={chainId} challenge={challenge} />
    </div>
  );
}

function Challenge({ challenge }: { challenge: ExpertChain }) {
  const pool = useMemo(
    () => shuffle([...challenge.nodes, ...challenge.decoys], createRng(challenge.id.length * 7919 + Date.now() % 1000)).map((id) => byId.get(id)!),
    [challenge],
  );
  const [chain, setChain] = useState<CauseNode[]>([]);
  const [result, setResult] = useState<ReturnType<typeof scoreChain> | null>(null);
  const available = pool.filter((n) => !chain.some((c) => c.id === n.id));

  const check = () => {
    const r = scoreChain(
      chain.map((c) => c.id),
      challenge.nodes,
    );
    setResult(r);
    awardXp(XP.chain);
    setBest(`chain:${challenge.id}`, r.score, 'higher');
    if (r.score >= 80) awardBadge('chain-builder', { quiet: challenge.nodes.some((id) => SOLEMN_NODES.has(id)) });
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="chain-prompt" className="panel p-5">
        <p className="kicker">Your task</p>
        <h2 id="chain-prompt" className="mt-1 text-xl font-semibold">
          {challenge.prompt}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Add steps from the pool in cause → effect order. Some cards are decoys. Then drag, or use the arrows, to fix the order.
        </p>
        <h3 className="mt-4 font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Pool</h3>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {available.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                disabled={!!result}
                onClick={() => setChain((c) => [...c, n])}
                className="flex w-full items-center gap-2 rounded border-[1.5px] border-rule-strong bg-card px-3 py-2 text-left text-sm hover:border-ink disabled:opacity-50"
              >
                <span aria-hidden="true" className="font-bold text-teal">
                  +
                </span>
                <span className="flex-1">
                  <span className="font-semibold">{n.label}</span> <span className="text-muted">({n.when})</span>
                </span>
                <span className="sr-only">Add to chain</span>
              </button>
            </li>
          ))}
          {available.length === 0 && <li className="text-sm text-muted">Every card is in your chain.</li>}
        </ul>
      </section>

      <section aria-labelledby="your-chain" className="grid content-start gap-3">
        <h2 id="your-chain" className="text-xl font-semibold">
          Your chain
        </h2>
        {chain.length === 0 ? (
          <p className="rounded border border-dashed border-rule-strong p-6 text-center text-sm text-muted">Add a cause from the pool to start.</p>
        ) : (
          <ReorderList
            items={chain}
            getKey={(n) => n.id}
            getLabel={(n) => n.label}
            onChange={setChain}
            onRemove={(n) => setChain((c) => c.filter((x) => x.id !== n.id))}
            disabled={!!result}
            label="Your cause and effect chain"
            renderItem={(n, i) => {
              const pair = result?.pairs[i];
              return (
                <div className="py-1">
                  <p className="font-semibold leading-snug">
                    {n.label} <span className="font-normal text-muted">({n.when})</span>
                  </p>
                  {result && pair && (
                    <p className={`mt-0.5 text-sm ${pair.why ? 'text-teal' : 'text-oxblood'}`}>
                      {pair.why ? `✓ leads to the next step: ${pair.why}` : '✗ No direct link to the next step in this web. What happened in between?'}
                    </p>
                  )}
                </div>
              );
            }}
          />
        )}
        <div className="flex flex-wrap gap-3">
          {!result ? (
            <button type="button" className="btn btn-primary" disabled={chain.length < 2} onClick={check}>
              Compare with the expert chain
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setChain([]);
                setResult(null);
              }}
            >
              Try again
            </button>
          )}
        </div>

        {result && (
          <div className="panel mt-2 p-5" aria-live="polite">
            <p className="kicker">Score</p>
            <p className="mt-1 font-sans text-4xl font-semibold">{result.score}%</p>
            <p className="mt-1 text-sm text-ink-soft">
              {result.valid} of {result.pairs.length} links are real cause → effect links; the rest of the score is how closely your order matches the
              expert chain.
            </p>
            <h3 className="mt-4 font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Expert chain</h3>
            <ol className="mt-2 grid gap-2">
              {challenge.nodes.map((id, i) => {
                const n = byId.get(id)!;
                const next = challenge.nodes[i + 1];
                return (
                  <li key={id} className="text-sm">
                    <p className="font-semibold">
                      {i + 1}. {n.label} <span className="font-normal text-muted">({n.when})</span>
                    </p>
                    {next && <p className="ml-4 border-l-2 border-rule-strong pl-3 text-ink-soft">↓ {linkWhy(id, next)}</p>}
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-xs text-muted">
              On an LEQ, each arrow is a sentence: name the cause, name the effect, and explain how one produced the other.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

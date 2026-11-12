import { useSearchParams } from 'react-router';
import { PageHeader, usePageMeta } from '../../components/ui';
import { BuildChain } from './BuildChain';
import { CausationGraph } from './CausationGraph';

export default function CausationPage() {
  usePageMeta('Causation Web', 'Causation Web');
  const [params, setParams] = useSearchParams();
  const tab = params.get('mode') === 'build' ? 'build' : 'explore';
  const setTab = (t: 'explore' | 'build') => {
    const next = new URLSearchParams(params);
    if (t === 'build') next.set('mode', 'build');
    else next.delete('mode');
    setParams(next, { replace: true });
  };
  return (
    <div className="wrap">
      <PageHeader
        kicker="Causation · LEQ & DBQ skills"
        title="The Causation Web"
        lede="Big developments rarely have one cause. Explore how events connect, then build your own cause → effect chain and compare it with an expert’s."
        motif="scales"
      />
      <div role="tablist" aria-label="Causation mode" className="mt-6 inline-flex rounded-md border border-rule-strong p-1">
        {(
          [
            ['explore', 'Explore the web'],
            ['build', 'Build a chain'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            id={`ctab-${id}`}
            aria-selected={tab === id}
            aria-controls={`cpanel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const other = tab === 'explore' ? 'build' : 'explore';
                setTab(other);
                requestAnimationFrame(() => document.getElementById(`ctab-${other}`)?.focus());
              }
            }}
            className={`min-h-10 rounded px-4 text-sm font-semibold ${tab === id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-sunk'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`cpanel-${tab}`} aria-labelledby={`ctab-${tab}`} className="mt-6">
        {tab === 'explore' ? <CausationGraph /> : <BuildChain />}
      </div>
    </div>
  );
}

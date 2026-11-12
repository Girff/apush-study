import { PageHeader, usePageMeta } from '../../components/ui';

export default function CausationPage() {
  usePageMeta('Causation Web');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Causation Web" lede="This room is still being built." />
    </div>
  );
}

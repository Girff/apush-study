import { PageHeader, usePageMeta } from '../../components/ui';

export default function TimelinePage() {
  usePageMeta('Living Timeline');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Living Timeline" lede="This room is still being built." />
    </div>
  );
}

import { PageHeader, usePageMeta } from '../../components/ui';

export default function DashboardPage() {
  usePageMeta('Progress');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Progress" lede="This room is still being built." />
    </div>
  );
}

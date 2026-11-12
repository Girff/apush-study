import { PageHeader, usePageMeta } from '../../components/ui';

export default function SpeedMatchPage() {
  usePageMeta('Speed Match');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Speed Match" lede="This room is still being built." />
    </div>
  );
}

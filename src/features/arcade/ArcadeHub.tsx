import { PageHeader, usePageMeta } from '../../components/ui';

export default function ArcadeHub() {
  usePageMeta('Study Arcade');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Study Arcade" lede="This room is still being built." />
    </div>
  );
}

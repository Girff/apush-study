import { PageHeader, usePageMeta } from '../../components/ui';

export default function SortItPage() {
  usePageMeta('Sort It');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Sort It" lede="This room is still being built." />
    </div>
  );
}

import { PageHeader, usePageMeta } from '../../components/ui';

export default function MapRoom() {
  usePageMeta('Map Room');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Map Room" lede="This room is still being built." />
    </div>
  );
}

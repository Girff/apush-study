import { PageHeader, usePageMeta } from '../../components/ui';

export default function SaqPage() {
  usePageMeta('SAQ Practice');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="SAQ Practice" lede="This room is still being built." />
    </div>
  );
}

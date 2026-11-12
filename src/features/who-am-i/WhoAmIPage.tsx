import { PageHeader, usePageMeta } from '../../components/ui';

export default function WhoAmIPage() {
  usePageMeta('Who Am I?');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Who Am I?" lede="This room is still being built." />
    </div>
  );
}

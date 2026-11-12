import { PageHeader, usePageMeta } from '../../components/ui';

export default function FillChainPage() {
  usePageMeta('Fill the Chain');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Fill the Chain" lede="This room is still being built." />
    </div>
  );
}

import { PageHeader, usePageMeta } from '../../components/ui';

export default function ExhibitHall() {
  usePageMeta('Exhibit Hall');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Exhibit Hall" lede="This room is still being built." />
    </div>
  );
}

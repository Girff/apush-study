import { PageHeader, usePageMeta } from '../../components/ui';

export default function ThemeHall() {
  usePageMeta('Theme Hall');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Theme Hall" lede="This room is still being built." />
    </div>
  );
}

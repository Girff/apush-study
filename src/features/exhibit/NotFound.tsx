import { PageHeader, usePageMeta } from '../../components/ui';

export default function NotFound() {
  usePageMeta('Page not found');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Page not found" lede="This room is still being built." />
    </div>
  );
}

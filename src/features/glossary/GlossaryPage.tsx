import { PageHeader, usePageMeta } from '../../components/ui';

export default function GlossaryPage() {
  usePageMeta('Glossary');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Glossary" lede="This room is still being built." />
    </div>
  );
}

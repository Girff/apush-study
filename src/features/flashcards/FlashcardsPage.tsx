import { PageHeader, usePageMeta } from '../../components/ui';

export default function FlashcardsPage() {
  usePageMeta('Flashcards');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Flashcards" lede="This room is still being built." />
    </div>
  );
}

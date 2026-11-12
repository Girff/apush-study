import { PageHeader, usePageMeta } from '../../components/ui';

export default function QuizPage() {
  usePageMeta('Quiz');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Quiz" lede="This room is still being built." />
    </div>
  );
}

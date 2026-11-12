import { PageHeader, usePageMeta } from '../../components/ui';

export default function StoryChapter() {
  usePageMeta('Story chapter');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Story chapter" lede="This room is still being built." />
    </div>
  );
}

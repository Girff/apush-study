import { PageHeader, usePageMeta } from '../../components/ui';

export default function StoryIndex() {
  usePageMeta('Story Mode');
  return (
    <div className="wrap">
      <PageHeader kicker="Coming together" title="Story Mode" lede="This room is still being built." />
    </div>
  );
}

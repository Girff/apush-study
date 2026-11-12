import { topicById } from '../../lib/data';
import { TOPIC_MOTIF } from '../../unit/config';
import { STORIES } from '../../unit/stories';
import type { Story } from '../../unit/types';

/**
 * The authored chapter for a topic, or (for a new unit with no authored
 * content yet) a plain chapter that walks the JSON terms in file order.
 */
export function storyFor(topicId: string): Story | undefined {
  if (STORIES[topicId]) return STORIES[topicId];
  const topic = topicById.get(topicId);
  if (!topic) return undefined;
  const chunks: Story['beats'] = [];
  for (let i = 0; i < topic.terms.length; i += 4) {
    const slice = topic.terms.slice(i, i + 4);
    chunks.push({
      id: `part-${i / 4 + 1}`,
      marker: `Part ${i / 4 + 1}`,
      heading: slice[0].term,
      text: slice.map((t) => `[[${t.term}]]: ${t.def}.`).join(' '),
      terms: slice.map((t) => t.term),
      motif: TOPIC_MOTIF[topicId],
    });
  }
  return {
    topicId,
    beats: chunks,
    predictions: [],
    remember: ['Review the terms above.', 'Try the mini-quiz below.', 'Add missed terms to flashcards.'],
  };
}

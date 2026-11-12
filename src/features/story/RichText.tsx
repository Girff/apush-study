import { Fragment } from 'react';
import { TermChip } from '../../components/TermChip';
import { resolveRef } from '../../lib/data';
import { parseMarkup } from '../../lib/markup';

/** Renders authored markup, turning [[Term]] references into ESPN chips. */
export function RichText({ text, topicId }: { text: string; topicId?: string }) {
  return (
    <>
      {parseMarkup(text).map((seg, i) => {
        if (seg.type === 'text') return <Fragment key={i}>{seg.text}</Fragment>;
        if (seg.type === 'em') return <i key={i}>{seg.text}</i>;
        const term = resolveRef(seg.ref, topicId);
        if (!term) return <Fragment key={i}>{seg.label ?? seg.ref}</Fragment>;
        return (
          <TermChip key={i} term={term}>
            {seg.label ?? term.term}
          </TermChip>
        );
      })}
    </>
  );
}

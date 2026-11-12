/**
 * Minimal markup for authored narrative text:
 *   [[Term name]]            → ESPN chip for that term (current topic first)
 *   [[4.4:Term name]]        → chip for a term in another topic
 *   [[Term name|shown text]] → chip with custom visible text
 *   *words*                  → italics (titles of works)
 */
export type Segment =
  | { type: 'text'; text: string }
  | { type: 'em'; text: string }
  | { type: 'term'; ref: string; label?: string };

const TOKEN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\*([^*]+)\*/g;

export function parseMarkup(source: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of source.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ type: 'text', text: source.slice(last, at) });
    if (m[1] !== undefined) out.push({ type: 'term', ref: m[1].trim(), label: m[2]?.trim() });
    else out.push({ type: 'em', text: m[3] });
    last = at + m[0].length;
  }
  if (last < source.length) out.push({ type: 'text', text: source.slice(last) });
  return out;
}

/** All term references in a string, in order. */
export function termRefs(source: string): string[] {
  return parseMarkup(source)
    .filter((s): s is Extract<Segment, { type: 'term' }> => s.type === 'term')
    .map((s) => s.ref);
}

/** Plain text (for aria labels, search, previews). */
export function plainText(source: string): string {
  return parseMarkup(source)
    .map((s) => (s.type === 'term' ? (s.label ?? s.ref.replace(/^\d+\.\d+:/, '')) : s.text))
    .join('');
}

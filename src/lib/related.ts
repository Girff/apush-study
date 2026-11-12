/**
 * "Related terms" for the glossary and term cards. Built once from:
 *  1. the same name appearing in two topics (e.g. "Nativism" in 4.1 and 4.6),
 *  2. authored groupings (story beats, causation-web nodes) in src/unit,
 *  3. one term's name appearing inside another term's definition.
 */
import { RELATION_GROUPS } from '../unit/relations';
import { resolveRef, terms } from './data';

/** "Thomas Dartmouth Rice / "Jim Crow"" → ['Thomas Dartmouth Rice', 'Jim Crow'] */
export function nameCores(name: string): string[] {
  return name
    .split(' / ')
    .map((part) =>
      part
        .replace(/\([^)]*\)/g, '')
        .replace(/["“”]/g, '')
        .trim(),
    )
    .filter((p) => p.length >= 4);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let cache: Map<string, string[]> | null = null;

function build(): Map<string, string[]> {
  const scores = new Map<string, Map<string, number>>();
  const bump = (a: string, b: string, w: number) => {
    if (a === b) return;
    let m = scores.get(a);
    if (!m) scores.set(a, (m = new Map()));
    m.set(b, (m.get(b) ?? 0) + w);
  };

  // 1. duplicates across topics
  const byName = new Map<string, string[]>();
  for (const t of terms) byName.set(t.term, [...(byName.get(t.term) ?? []), t.id]);
  for (const ids of byName.values()) for (const a of ids) for (const b of ids) bump(a, b, 5);

  // 2. authored groups
  for (const group of RELATION_GROUPS) {
    const ids = group.refs.map((r) => resolveRef(r, group.topicId)?.id).filter((x): x is string => !!x);
    for (const a of ids) for (const b of ids) bump(a, b, group.weight ?? 2);
  }

  // 3. mentions: a term's core name inside another definition
  const patterns = terms.flatMap((t) => nameCores(t.term).map((core) => ({ id: t.id, re: new RegExp(`\\b${escapeRe(core)}\\b`) })));
  for (const t of terms) {
    for (const p of patterns) {
      if (p.id !== t.id && p.re.test(t.def)) {
        bump(t.id, p.id, 3);
        bump(p.id, t.id, 3);
      }
    }
  }

  const out = new Map<string, string[]>();
  for (const [id, m] of scores) {
    out.set(
      id,
      [...m.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([other]) => other),
    );
  }
  return out;
}

export function relatedTerms(termId: string, limit = 6): string[] {
  if (!cache) cache = build();
  return (cache.get(termId) ?? []).slice(0, limit);
}

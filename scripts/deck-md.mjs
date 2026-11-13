// Writes DECK.md: every card by basket, plus the curation notes (added, dropped, corrected).
// Run with `npm run deck:md` after editing src/data/deck.json or src/data/curation.json.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const deck = read('../src/data/deck.json');
const ledger = read('../src/data/curation.json');
const cell = (s) => s.replace(/\|/g, '\\|');

const cards = deck.baskets.flatMap((b) => b.cards);
const added = cards.filter((c) => c.added);
const lines = [
  '# Unit 4 deck',
  '',
  `Generated from \`src/data/deck.json\` by \`npm run deck:md\`. ${cards.length} cards in ${deck.baskets.length} baskets: ${cards.length - added.length} from the original term list and ${added.length} added (marked †). Yawp references are chapter.section in *The American Yawp*.`,
  '',
  '## Contents',
  '',
];
for (const g of deck.groups) {
  lines.push(`- **${g.title}** (${g.years})`);
  for (const b of deck.baskets.filter((x) => x.group === g.id)) {
    const anchor = b.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-');
    lines.push(`  - [${b.title}](#${anchor}) · ${b.cards.length} cards`);
  }
}
for (const g of deck.groups) {
  lines.push('', `## ${g.title}, ${g.years}`);
  for (const b of deck.baskets.filter((x) => x.group === g.id)) {
    lines.push('', `### ${b.title}`, '', `*${b.years}.* ${b.blurb}`, '', '| Term | Definition | Yawp |', '| --- | --- | --- |');
    for (const c of b.cards) lines.push(`| ${cell(c.term)}${c.added ? ' †' : ''} | ${cell(c.def)} | ${c.yawp ?? ''} |`);
  }
}
lines.push('', '## Curation', '', '### Added cards (†)', '', 'Standard Unit 4 terms that were not on the original list, added so each basket covers its topic:', '');
lines.push(added.map((c) => c.term).join(' · '));
lines.push('', '### Entries from the original list that are not cards', '', '| Original entry | Why |', '| --- | --- |');
for (const d of ledger.dropped) lines.push(`| ${cell(d.source)} | ${cell(d.reason)} |`);
lines.push('', '### Corrections to the original list', '', '| Original entry | What changed |', '| --- | --- |');
for (const c of ledger.corrections) lines.push(`| ${cell(c.source)} | ${cell(c.issue)} |`);
lines.push('');
writeFileSync(new URL('../DECK.md', import.meta.url), lines.join('\n'));
console.log(`DECK.md: ${cards.length} cards`);

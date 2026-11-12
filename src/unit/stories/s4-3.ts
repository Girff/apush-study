import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'pride',
      marker: '1815',
      heading: 'Postwar pride',
      text: `The War of 1812 left a surge of [[American nationalism]]. Albert Gallatin said the war had revived "national feelings." Young nationalists in Congress set out to bind the regions together.`,
      motif: 'broadside',
    },
    {
      id: 'system',
      marker: '1816',
      heading: 'The American System',
      text: `[[Henry Clay]] of Kentucky and [[John C. Calhoun]] of South Carolina pushed the [[American System]]: a national bank, a [[Protective tariff|protective tariff]] to shield U.S. manufacturers, and federally backed [[Internal improvements|internal improvements]] such as roads and canals. Congress chartered the [[Bank of the United States]] again in 1816 as a source of national capital.`,
      motif: 'bank',
    },
    {
      id: 'ties',
      marker: '1810–1830',
      heading: 'A nation knitting together',
      text: `Between 1810 and 1830, 6,000 [[New post offices|new post offices]] tied the country together, and [[New western states|new western states]] such as Tennessee, Ohio, Mississippi and Illinois marked westward settlement. Under President Monroe, observers predicted an [["Era of good feelings"|"era of good feelings"]], an end to party division that never really came.`,
      motif: 'compass',
    },
    {
      id: 'panic',
      marker: '1819',
      heading: 'Boom to bust',
      text: `Then the [[Panic of 1819]] struck. Many blamed the Bank for the depression, which was still hurting South Carolina in 1828. Economic pain sharpened regional suspicion.`,
    },
    {
      id: 'missouri',
      marker: '1819',
      heading: 'Missouri knocks',
      text: `That same year Missouri asked to enter the Union as a slave state, setting off the [[Missouri Crisis (1819–1820)|Missouri Crisis]]. A growing North was already wary of the [[Virginia dynasty]]: four of the first five presidents were Virginians. New York's [[James Tallmadge / Tallmadge Amendment|James Tallmadge]] proposed an amendment that would bar new enslavement in Missouri and free enslaved people's children at age 25.`,
    },
    {
      id: 'vote',
      marker: '1819',
      heading: 'A vote split by region',
      text: `The amendment exposed [[Sectional voting|sectional voting]]: the House passed it along sectional lines, and the Senate killed it. Keeping a [[Balance of free and slave states|balance of free and slave states]] in the Senate had become a political goal.`,
    },
    {
      id: 'compromise',
      marker: '1820',
      heading: 'The compromise',
      text: `Illinois senator [[Jesse Thomas]] proposed the deal. Under the [[Missouri Compromise (1820)|Missouri Compromise]], Missouri entered as a slave state and Maine as a free state, and the [[36°30′ line]] banned slavery north of that latitude in the rest of the Louisiana Purchase.`,
      motif: 'scales',
    },
    {
      id: 'firebell',
      marker: '1820',
      heading: 'A fire bell in the night',
      text: `The retired Jefferson heard the crisis like a [["Fire bell"|fire bell]] in the night, a warning of disunion. The compromise held for a generation, but Missouri had shown that slavery could split the Union along sectional lines.`,
    },
  ],
  predictions: [
    {
      after: 'ties',
      question: 'A national bank, easy credit and booming land sales: what risk was building?',
      options: ['A financial panic', 'A shortage of post offices', 'A war with France'],
      answer: 0,
      reveal: 'The Panic of 1819 hit, and many blamed the Bank.',
    },
    {
      after: 'missouri',
      question: "Tallmadge's amendment would bar new enslavement in Missouri. How do you predict Congress voted?",
      options: ['Along sectional lines, North against South', 'Unanimously in favor', 'Along party lines, Federalists against Republicans'],
      answer: 0,
      reveal: 'The House passed it along sectional lines; the Senate, where the South had equal votes, killed it.',
    },
    {
      after: 'vote',
      question: "How could Congress admit Missouri without upsetting the Senate's balance?",
      options: ['Admit a free state alongside it', 'Admit Missouri without senators', 'Ban slavery everywhere at once'],
      answer: 0,
      reveal: 'Maine entered as a free state, and the 36°30′ line divided the rest of the Louisiana Purchase.',
    },
  ],
  remember: [
    'After 1815, Clay and Calhoun’s American System (bank, tariff, internal improvements) aimed to tie the regions together.',
    'The Panic of 1819 and the Missouri Crisis showed how fragile that unity was.',
    'The Missouri Compromise admitted Missouri (slave) and Maine (free) and banned slavery north of 36°30′ in the Louisiana Purchase.',
  ],
};

import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'jackson',
      marker: '1829',
      heading: 'A president from Tennessee',
      text: `[[Andrew Jackson (1767–1845)|Andrew Jackson]], the seventh president, came to office as a war hero and as an enslaver who held 150 people at the Hermitage, his Tennessee plantation. He used the presidency more aggressively than anyone before him.`,
      motif: 'ballot',
    },
    {
      id: 'tariff',
      marker: '1828',
      heading: 'The "Tariff of Abominations"',
      text: `The [[Tariff of 1828 ("Tariff of Abominations")|Tariff of 1828]], a high protective tariff, angered the South, which blamed it for its losses. In the secret [[South Carolina Exposition and Protest]], John C. Calhoun argued that states could nullify federal law.`,
    },
    {
      id: 'theory',
      marker: '1798–1828',
      heading: 'The theory of nullification',
      text: `Calhoun built on the [[Virginia and Kentucky Resolutions]] of 1798–1799 and on [[Compact theory|compact theory]], the idea that the Union is a compact among the states. [[Nullification]] meant that a state could void a federal law it judged unconstitutional.`,
      motif: 'scales',
    },
    {
      id: 'eaton',
      marker: '1829–1831',
      heading: 'The Petticoat Affair',
      text: `A social scandal split Jackson's cabinet. In the [[Eaton Affair ("Petticoat Affair")|Eaton Affair]], cabinet wives led by Floride Calhoun shunned Margaret Eaton, the wife of Jackson's secretary of war. The [[Cabinet resignations|cabinet resignations]] that followed helped Martin Van Buren rise and Calhoun fall.`,
    },
    {
      id: 'stakes',
      marker: '1822–1832',
      heading: 'What was really at stake',
      text: `South Carolina's white leaders had a deeper fear. The [[Denmark Vesey conspiracy]] had made them hostile to federal power. Calhoun called slavery the [[Calhoun's "peculiar domestick institution"|"peculiar domestick institution,"]] the real stake in nullification. At a dinner honoring Jefferson, Jackson and Calhoun [[1832 Jefferson dinner toasts|clashed in public with rival toasts]], Union against liberty.`,
    },
    {
      id: 'showdown',
      marker: '1832–1833',
      heading: 'Showdown',
      text: `After the [[Tariff of 1832 / Ordinance of Nullification|Tariff of 1832]], South Carolina declared the tariffs "null, void, and no law." Jackson answered with the [[Force Bill]], which authorized military force to collect them. Clay and Calhoun's [[Compromise tariff|compromise tariff]] lowered rates and ended the crisis, but the linked ideas of [[States' rights / secession|states' rights and secession]] had grown out of it.`,
    },
    {
      id: 'bank',
      marker: '1832',
      heading: 'The Bank War',
      text: `The [[Second Bank of the United States]], a Philadelphia-based national bank chartered in 1816, was directed by [[Nicholas Biddle]], who pushed for early recharter in 1832. Jackson declared a "war to the death" on it, the [[Bank War]]. His [[Bank veto (July 1832)|bank veto]] that July called the bank unconstitutional and dangerous, and Jacksonians attacked the [["Monied aristocracy"|"monied aristocracy"]] it served.`,
      motif: 'bank',
    },
    {
      id: 'panic',
      marker: '1833–1843',
      heading: 'Boom and bust',
      text: `Jackson moved the federal deposits into state [[Pet banks (1833)|pet banks]]. Opponents called him [["King Andrew the First"|"King Andrew the First,"]] charging executive tyranny. Easy credit fed a [[Speculative boom (1834–1836)|speculative boom]] in paper money and land until the [[Specie Circular (July 1836)|Specie Circular]] required gold or silver for federal land, and the bubble burst. In the [[Panic of 1837]], runs on New York banks began a crisis that closed about 200 banks, and the depression lasted to 1843. Eight states and a territory went into [[State defaults|default]] on British loans.`,
    },
    {
      id: 'removal',
      marker: '1829–1830',
      heading: 'Removal',
      text: `Jackson also pushed the removal of Native nations from the Southeast. The [[Cherokee Nation]] had adopted a written language and a constitution, and missionaries worked among them. Critics fought back: [[Jeremiah Evarts ("William Penn")|Jeremiah Evarts]], writing as "William Penn," published essays against removal, and [[Catharine Beecher's "Circular" (1829)|Catharine Beecher's "Circular"]] launched the first major women's petition campaign, against removal. Congress passed the [[Indian Removal Act (1830)|Indian Removal Act]] anyway, forcing relocation west of the Mississippi and auctioning Native land.`,
      motif: 'petition',
    },
    {
      id: 'trail',
      marker: '1832–1838',
      heading: 'The Trail of Tears',
      text: `The Supreme Court took up Georgia's laws over the Cherokee in [[Worcester v. Georgia (1832)|Worcester v. Georgia]], but the case did not stop removal. In 1838 the U.S. Army forced the Cherokee west on the [[Trail of Tears (1838)|Trail of Tears]]. Thousands died on the way.`,
      motif: 'compass',
    },
  ],
  predictions: [
    {
      after: 'stakes',
      question: 'South Carolina claimed it could void a federal tariff. How do you predict Jackson, a defender of the Union, responded?',
      options: ['He won authority to use military force to collect it', 'He agreed and repealed all tariffs', 'He ignored South Carolina entirely'],
      answer: 0,
      reveal: 'The Force Bill authorized military force; a compromise tariff then ended the crisis.',
    },
    {
      after: 'bank',
      question: 'Jackson moved federal money out of the national bank and into state banks. What do you predict happened to lending?',
      options: ['Easy credit fed a speculative boom', 'Lending stopped completely', 'Nothing changed'],
      answer: 0,
      reveal: 'State "pet banks" lent freely, and land speculation boomed until the Specie Circular burst the bubble.',
    },
  ],
  remember: [
    'Jackson faced down South Carolina’s nullification of the tariff with the Force Bill, and a compromise tariff ended the crisis.',
    'His veto destroyed the Second Bank; pet banks, speculation and the Specie Circular helped bring the Panic of 1837.',
    'The Indian Removal Act (1830) led to the Cherokee’s forced removal on the Trail of Tears (1838).',
  ],
};

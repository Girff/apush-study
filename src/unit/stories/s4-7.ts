import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'fear',
      marker: '1787',
      heading: 'Founders who feared democracy',
      text: `At the 1787 Convention, Alexander Hamilton warned of the [["Vices of democracy"|"vices of democracy,"]] and [[Elbridge Gerry]] said, "The evils we experience flow from an excess of democracy." [[Benjamin Rush]] warned that tyranny can come through popular rule too. Ordinary people did not wait for permission: through [[Petitions and public criticism|petitions and public criticism]], they petitioned Congress and openly criticized presidents.`,
      motif: 'broadside',
    },
    {
      id: 'open',
      marker: '1821',
      heading: 'Opening the polls to white men',
      text: `State by state, [[Lowered property requirements|lowered property requirements]] opened the vote to poorer white men. New York's [[New York constitution of 1821|constitution of 1821]] enfranchised nearly all white male taxpayers while restricting Black voters.`,
      motif: 'ballot',
    },
    {
      id: 'closed',
      marker: '1838',
      heading: 'Closing the polls to others',
      text: `Democracy for white men advanced alongside [[Black disfranchisement]]. At the Revolution, two states limited Black voting; by 1839, almost all did. Pennsylvania's [[Pennsylvania constitution of 1838|constitution of 1838]] banned Black voting completely. In Philadelphia, [[James Forten]], a Black Revolutionary veteran and sailmaker, was denied full citizenship. [[Women's exclusion and influence|Women could not vote]] either, though they used social networks to wield political power.`,
    },
    {
      id: '1824',
      marker: '1824',
      heading: 'The "corrupt bargain"',
      text: `The [[Election of 1824]] had four candidates: Andrew Jackson, John Quincy Adams, Georgia's [[William H. Crawford]] and Henry Clay. No one won an Electoral College majority, so the [[House of Representatives decides|House of Representatives decided]]. It chose Adams, though Jackson had won the most popular votes. When Adams made Clay secretary of state, Jackson's supporters charged a [["Corrupt bargain"|"corrupt bargain."]]`,
    },
    {
      id: '1828',
      marker: '1828',
      heading: 'Old Hickory wins',
      text: `Jackson's supporters built the [[Democratic Party]], the first modern national party. In the dirty campaign of the [[Election of 1828]], they sold Jackson as [["Old Hickory" / frontier image|"Old Hickory,"]] a tough backwoods man of the people, and he won easily.`,
    },
    {
      id: 'opposition',
      marker: '1826–1830s',
      heading: 'The opposition takes shape',
      text: `Jackson's opponents organized too. The [[National Republicans]], a Northeastern anti-Jackson alliance, fed a new [[Whig Party]], named after Revolutionary patriots and grown from the Adams-Clay coalition. The 1826 disappearance of [[William Morgan]] sparked the [[Anti-Masonic Party]], which held a national convention in 1830 and later joined the Whigs.`,
    },
    {
      id: '1840',
      marker: '1836–1840',
      heading: 'Log cabins and hard cider',
      text: `[[Martin Van Buren]], the "Little Magician," won the presidency in 1836. The Whigs held their first national convention at Harrisburg ([[Harrisburg convention (1839)|Harrisburg convention]]), and in the [[Election of 1840]] they sold William Henry Harrison as a common man of [["Log cabin and hard cider"|"log cabin and hard cider"]] under the slogan [["Tippecanoe and Tyler Too"|"Tippecanoe and Tyler Too."]] They won.`,
      motif: 'ballot',
    },
    {
      id: 'tyler',
      marker: '1841',
      heading: '"His Accidency"',
      text: `Harrison died after 31 days in office. [[John Tyler / "His Accidency"|John Tyler]], mocked as "His Accidency," vetoed a new national bank and was expelled by the Whigs. Mass parties had turned elections into spectacles, but the electorate was still limited to white men.`,
    },
  ],
  predictions: [
    {
      after: 'closed',
      question: 'In 1824 no candidate won an Electoral College majority. What happens next under the Constitution?',
      options: ['The House of Representatives picks the president', 'The popular-vote leader wins automatically', 'The Senate calls a new election'],
      answer: 0,
      reveal: 'The House chose John Quincy Adams, though Jackson had won the most popular votes.',
    },
    {
      after: '1828',
      question: "Jackson's opponents needed a name. Whom do you predict they borrowed it from?",
      options: ['Revolutionary patriots who opposed a king', 'Ancient Roman senators', 'The Federalists'],
      answer: 0,
      reveal: 'The Whigs named themselves after Revolutionary patriots, casting Jackson as "King Andrew" (4.8).',
    },
  ],
  remember: [
    'Property requirements fell, and by 1840 nearly all white men could vote.',
    'In the same years, states took the vote away from free Black men, and women stayed excluded.',
    'The “corrupt bargain” of 1824 fueled Jackson’s Democrats; the Whigs answered with their own mass campaign in 1840.',
  ],
};

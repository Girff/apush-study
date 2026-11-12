import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'roads',
      marker: 'c. 1800',
      heading: 'Hard roads west',
      text: `Early in the century, travelers such as [[Margaret Dwight / Frances Trollope|Margaret Dwight and Frances Trollope]] described how hard it was to move overland. The [[National Road]], the first federally funded interstate road, pushed a route west.`,
      motif: 'compass',
    },
    {
      id: 'steam',
      marker: '1807–1812',
      heading: 'Steam on the rivers',
      text: `[[Steam power]] changed everything it touched: mills, boats and, later, railroads. [[Robert Fulton (1807)|Robert Fulton]] launched the first commercial steamboat service on the Hudson in 1807, and the [[Steamboat New Orleans (1811–1812)|steamboat New Orleans]] ran from Pittsburgh down to New Orleans.`,
      motif: 'ship',
    },
    {
      id: 'erie',
      marker: '1825',
      heading: 'The Erie Canal',
      text: `The [[Erie Canal (1825)|Erie Canal]], finished in 1825, ran 350 miles and linked the Great Lakes and the Hudson River to the Atlantic. Shipping got cheaper, and [[New York City]] became the largest, most important U.S. city. By 1840, [[Ohio canals]] added two all-water links from Lake Erie to the Ohio River.`,
    },
    {
      id: 'rails',
      marker: '1827–1844',
      heading: 'Rails and wires',
      text: `The [[Baltimore & Ohio Railroad (1827)|Baltimore & Ohio Railroad]] became the first long-distance U.S. rail line. In 1843–1844, [[Samuel Morse / telegraph (1843–1844)|Samuel Morse's telegraph]] line between Washington and Baltimore began a communications revolution. Western hubs such as [[St. Louis and Chicago]] rose on trade and rails.`,
    },
    {
      id: 'farms',
      marker: 'The prairie',
      heading: 'Farming for the market',
      text: `On the prairie, [[John Deere]]'s steel plow broke the sod and [[Cyrus McCormick]]'s mechanical reaper harvested wheat. More Americans worked for wages and bought what they needed: a [[Wage labor / cash economy|cash economy]] was replacing bound labor and household production.`,
    },
    {
      id: 'corporations',
      marker: '1816–1819',
      heading: 'The corporation',
      text: `New businesses organized as corporations. A charter gave a [[Business corporation / limited liability|business corporation limited liability]], protecting investors from the company's debts. In 1816 Jefferson attacked concentrated power in his warning about [[Jefferson on "monied corporations"|"monied corporations,"]] but in [[Dartmouth College v. Woodward (1819)|Dartmouth College v. Woodward]] the Supreme Court protected private corporate charters from the states. Paper money spread too, and with it [[Counterfeit bills / "confidence man"|counterfeit bills and the "confidence man"]], risks of the new urban economy.`,
      motif: 'bank',
    },
    {
      id: 'gin',
      marker: '1794–1832',
      heading: 'Cotton feeds the mills',
      text: `[[Eli Whitney / cotton gin (1794)|Eli Whitney's cotton gin]] made short-staple cotton profitable, and enslaved people were forced to grow it across the South. That cotton fed Northern mills: in 1832, [[Textile corporations|textile corporations]] were 88 of the 106 largest U.S. corporations.`,
      motif: 'cotton',
    },
    {
      id: 'factory',
      marker: '1789–1821',
      heading: 'From the home to the factory',
      text: `Under the [[Putting-out system|putting-out system]], piecework went out to workers' homes. Factories replaced it. [[Samuel Slater (1789)|Samuel Slater]] copied British yarn machines for a mill in Pawtucket, Rhode Island, and in 1813 [[Francis Cabot Lowell / Paul Moody|Francis Cabot Lowell and Paul Moody]] re-created the British power loom. The [[Waltham-Lowell System|Waltham-Lowell System]] put all of textile production under one roof, and [[Lowell, Massachusetts (1821)|Lowell, Massachusetts]], was planned as a mill town powered by the Merrimack River.`,
      motif: 'loom',
    },
  ],
  predictions: [
    {
      after: 'erie',
      question: 'Now the Erie Canal links the Great Lakes to the Atlantic. Which city do you predict gains most?',
      options: ['New York City', 'Philadelphia', 'Charleston'],
      answer: 0,
      reveal: 'New York City became the largest and most important U.S. city after the canal.',
    },
    {
      after: 'gin',
      question: 'Northern mills needed ever more raw cotton. What do you predict that meant for slavery in the South?',
      options: ['It grew more profitable and expanded', 'It faded as mills switched to wool', 'It ended quickly in the cotton states'],
      answer: 0,
      reveal: 'Northern industry and Southern slavery were bound together: the mills ran on cotton grown by enslaved people (see 4.13).',
    },
  ],
  remember: [
    'Steamboats, canals (Erie, 1825), railroads and the telegraph tied regions into national markets.',
    'Corporations with limited liability, protected by Dartmouth College v. Woodward, financed the new economy.',
    'Production moved from homes (putting-out) to factories (Waltham-Lowell), and Northern mills ran on cotton grown by enslaved people.',
  ],
};

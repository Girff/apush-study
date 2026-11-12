import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'remade',
      marker: '1800–1848',
      heading: 'A nation remade in two generations',
      text: `Between Jefferson's election in 1800 and 1848, the United States changed faster than at any time since independence. Historians call these decades part of the [[Antebellum period]], the era before the Civil War. *The American Yawp* names the economic engine of the change the [[Market revolution]]: Americans shifted from making goods at home to buying and selling them for cash.`,
    },
    {
      id: 'roads',
      marker: 'Roads & canals',
      heading: 'Moving goods, moving people',
      text: `The [[Transportation Revolution]] of roads, canals and railroads tied farms to distant markets. People moved as fast as goods. [[Westward expansion]] opened new land but pitted settlers against Native nations, and [[Urbanization]] swelled cities in both North and South, sharpening class lines.`,
      motif: 'canal',
    },
    {
      id: 'factories',
      marker: 'Mills & ships',
      heading: 'Factories and newcomers',
      text: `[[Industrialization]] pulled work out of households and into mills, driving new social tensions and class divides. Over five million people arrived from Europe between 1820 and 1860 ([[European migration]]), and some native-born Americans answered with [[Nativism]], a hostility that split "true" Americans from immigrants.`,
      motif: 'loom',
    },
    {
      id: 'cotton',
      marker: 'Cotton',
      heading: 'Cotton and its defenders, free labor and its defenders',
      text: `In the South, the [[Cotton Revolution]] made cotton the engine of slavery and of American capitalism alike. Northerners answered with a [[Free labor ideology]] that defined wage work as freedom, in contrast to slavery.`,
      motif: 'cotton',
    },
    {
      id: 'booms',
      marker: '1819 · 1837',
      heading: 'Booms, busts and ballots',
      text: `Market booms brought recurring [["Panics"|panics]], depressions that struck in 1819 and 1837. Politics changed as fast as the economy. [[Democratization]] opened the vote to nearly all white men, while [[Sectionalism]] set North, South and West competing over federal policy.`,
      motif: 'ballot',
    },
    {
      id: 'faith',
      marker: 'Revival',
      heading: 'Faith and reform',
      text: `Beneath it all ran the [[Second Great Awakening]], a revival that reignited Protestant faith and fueled reform. Every room of this exhibit connects back to these forces: markets, cotton, democracy and faith.`,
      motif: 'tent',
    },
  ],
  predictions: [
    {
      after: 'roads',
      question: 'Canals and roads cut the cost of shipping goods. What do you predict happened to many farm families?',
      options: ['They grew more crops to sell for cash', 'They stopped farming and moved back to Europe', 'They made more of their own cloth at home'],
      answer: 0,
      reveal: 'Cheaper transport pulled farms into distant markets. Topic 4.6 shows women shifting from making cloth to buying it.',
    },
    {
      after: 'cotton',
      question: 'Cotton profits grew in the South while wage work spread in the North. What kind of conflict does that set up?',
      options: ['Sectional conflict over federal policy and slavery', 'A war with Britain over cotton prices', 'The end of political parties'],
      answer: 0,
      reveal: 'Sectionalism: North, South and West competed over federal policy, and slavery became the sharpest dividing line (see 4.3).',
    },
  ],
  remember: [
    'The market revolution (roads, canals, factories and cash wages) remade how Americans worked and lived.',
    'Cotton made slavery the engine of Southern wealth and tied the national economy to it.',
    'Democratization, revival and reform grew alongside the sectional conflict that would dominate politics by 1848.',
  ],
};

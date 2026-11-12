import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'parties',
      marker: '1800',
      heading: 'Two parties, one bitter contest',
      text: `The [[Federalists]] were an elite party, wary of direct popular control. They faced the [[Democratic-Republicans]], who grew by promising wider voting and direct ties to voters. In the [[Election of 1800]], [[Thomas Jefferson]] defeated John Adams, and Democratic-Republicans beat the Federalists.`,
    },
    {
      id: 'revolution',
      marker: '1800',
      heading: 'A revolution at the ballot box',
      text: `Jefferson called his win the [["Revolution of 1800"|"revolution of 1800"]] and credited it to the people's votes. [[Thomas Paine]] had called America an "asylum" for liberty. Federalist [[Fisher Ames]] saw it differently: he said Jefferson's win dragged the nation "into the mire of a democracy."`,
      motif: 'broadside',
    },
    {
      id: 'cuts',
      marker: '1801–1824',
      heading: 'Shrinking the government, widening the vote',
      text: `Jefferson stood for limited government and the yeoman farmer. In office he made deep [[Jefferson's cuts|cuts]]: lower taxes, a smaller debt, no internal taxes and an army capped at 3,000. He, Madison and Monroe widened voting by making [[Easier land purchases|land easier to buy]], and by 1824 only three states still had [[Property qualifications|property qualifications]] for voting.`,
      motif: 'ballot',
    },
    {
      id: 'women',
      marker: 'The home front',
      heading: 'Women and the new politics',
      text: `Women could not vote, but [[Republican Motherhood]] gave them a civic role: raising virtuous, liberty-loving sons. Writers such as [[Mercy Otis Warren]] joined the ratification debate, and toasts and appeals from the period show [[Women in partisan politics|women drawn into party fights]].`,
    },
    {
      id: 'hemings',
      marker: 'A contradiction',
      heading: 'The champion of liberty was an enslaver',
      text: `The journalist [[James Callender / Sally Hemings|James Callender]] exposed Jefferson's relationship with Sally Hemings, a woman Jefferson held in slavery. DNA evidence later supported the claim. The episode shows the gap between the era's language of liberty and the reality of slavery.`,
    },
    {
      id: 'fade',
      marker: '1809–1816',
      heading: 'The Federalists fade',
      text: `[[James Madison]], the fourth president, led the nation into the War of 1812. New England Federalists opposed that war, and their [[4.4:Hartford Convention (1814)|Hartford Convention]] looked disloyal. When [[Rufus King]], the last Federalist presidential candidate, lost to Monroe in 1816, the [[Death of the Federalist Party]] was all but complete.`,
    },
  ],
  predictions: [
    {
      after: 'revolution',
      question: 'Federalists warned that Jefferson would drag the nation "into the mire of a democracy." What do you predict Jefferson did in office?',
      options: ['Shrank the federal government and cut taxes', 'Built up the army to keep order', 'Raised taxes to pay off the debt faster'],
      answer: 0,
      reveal: 'He lowered taxes and the debt, ended internal taxes and capped the army at 3,000.',
    },
    {
      after: 'cuts',
      question: 'Land got easier to buy and states dropped property rules. Who do you predict gained the vote?',
      options: ['Poorer white men', 'Women', 'Free Black men in every state'],
      answer: 0,
      reveal: 'Property rules fell for white men. Women stayed excluded, and as 4.7 shows, states took the vote away from free Black men in the same years.',
    },
  ],
  remember: [
    'The Election of 1800 moved power peacefully from the Federalists to Jefferson’s Democratic-Republicans.',
    'Jefferson shrank the government and made land easier to buy, which widened voting for white men.',
    'Republican Motherhood gave women a civic role, and the Federalist Party died after the Hartford Convention.',
  ],
};

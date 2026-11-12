import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'gradual',
      marker: '1777–1830',
      heading: 'Freedom, slowly',
      text: `After the Revolution, Northern states adopted [[Gradual emancipation|gradual emancipation]]: Vermont in 1777, Pennsylvania in 1780 and, last, New Jersey in 1804. Freedom came with conditions. Under the [[Indenture of freed children|indenture of freed children]], freed children were bound to labor to compensate enslavers; James Mars was bound until age 25. Northern slavery ended slowly: about 3,500 people were still enslaved in the North in 1830 ([[Slavery's slow end in the North|slavery's slow end]]).`,
    },
    {
      id: 'community',
      marker: '1790–1810',
      heading: 'Free communities',
      text: `The [[Free Black population growth|free Black population]] grew from under 60,000 in 1790 to over 186,000 in 1810. Free Black Northerners built their own institutions: [[Black mutual aid, churches and print|mutual aid societies, churches and print]]. In Boston, [[Prince Hall]] founded Black Freemasonry.`,
      motif: 'church',
    },
    {
      id: 'science',
      marker: '1791–1813',
      heading: 'Answering racist science',
      text: `White thinkers ranked humanity. [[Enlightenment racial classification|Enlightenment classification]] by Linnaeus and Blumenbach sorted human "types," and some argued for [[Polygenesis|polygenesis]], the theory that races had separate origins. The case of [[Henry Moss]], an enslaved Virginian whose skin lightened, fed these debates. In [[Jefferson's Notes on the State of Virginia|Notes on the State of Virginia]], Jefferson claimed Black inferiority and proposed emancipation tied to colonization. Black writers answered. In 1791 the surveyor [[Benjamin Banneker (1791)|Benjamin Banneker]] challenged Jefferson's views, and in 1813 the Philadelphia sailmaker [[James Forten / Letters from a Man of Colour (1813)|James Forten]] published *Letters from a Man of Colour*; his writing later changed William Lloyd Garrison's views.`,
      motif: 'press',
    },
    {
      id: 'haiti',
      marker: '1791–1804',
      heading: 'Haiti’s example',
      text: `[[Haiti's inspiration|News of the Haitian Revolution]] spread hope among Black Americans despite efforts to suppress it.`,
      motif: 'ship',
    },
    {
      id: 'gabriel',
      marker: '1800',
      heading: 'Gabriel’s plan',
      text: `In 1800, enslaved people planned an uprising against Richmond, Virginia. [[Gabriel's Rebellion (1800)|Gabriel's Rebellion]] was foiled, and Gabriel and others were executed. Virginia then imposed new [[Restrictions on free people of color|restrictions on free people of color]].`,
    },
    {
      id: 'entrenched',
      marker: '1808–1822',
      heading: 'Slavery entrenched',
      text: `The [[End of the international slave trade (1808)|end of the international slave trade]] in 1808 stopped legal importation, but the domestic trade grew. In 1816 U.S. troops destroyed the [["Negro Fort" (1816)|"Negro Fort"]] in Florida, a refuge for people who had escaped slavery. In 1822, Charleston authorities claimed to uncover a conspiracy led by [[Denmark Vesey]].`,
    },
    {
      id: 'voices',
      marker: '1826–1829',
      heading: 'Black voices in print',
      text: `In 1826 [[John Russwurm (1826)|John Russwurm]], one of the earliest Black college graduates, praised Haiti at Bowdoin. Black newspapers such as the [[Colored American]] gave free Black communities a public voice, and in 1829 Boston's [[David Walker / Appeal (1829)|David Walker]] published his *Appeal*, a call to resist slavery.`,
      motif: 'press',
    },
    {
      id: 'anticolonization',
      marker: '1830s',
      heading: 'Against colonization',
      text: `White reformers' colonization plans met resistance: [[Anticolonization|free Black Northerners rejected colonization]] and claimed their place in the United States.`,
    },
    {
      id: 'leaders',
      marker: '1840s',
      heading: 'Leaders of the movement',
      text: `Black abolitionists were among the movement's most powerful voices. The orator [[Frederick Douglass]] published his *Narrative* in 1845 and won British support on a trip that year. [[Sojourner Truth]] spoke for abolition and women's rights, and [[Black activists' transatlantic ties|Black activists' transatlantic ties]] made them powerful voices in antislavery societies at home and abroad.`,
      motif: 'broadside',
    },
    {
      id: 'south',
      marker: 'The South',
      heading: 'Free people of color in the South',
      text: `In the South, [[Free people of color (South)|free people of color]] held a middling status in cities such as Charleston and New Orleans.`,
    },
  ],
  predictions: [
    {
      after: 'haiti',
      question: "News of Haiti's revolution spread hope among enslaved Americans. How do you predict Virginia's enslavers responded to signs of revolt?",
      options: ['With harsh crackdowns', 'By freeing enslaved people', 'By ignoring them'],
      answer: 0,
      reveal: 'After Gabriel’s planned uprising in 1800, Virginia executed its leaders and restricted free people of color.',
    },
    {
      after: 'voices',
      question: 'White reformers promoted sending free Black Americans to Africa. How do you predict most free Black Northerners responded?',
      options: ['They rejected colonization', 'They welcomed it', 'They stayed out of the debate'],
      answer: 0,
      reveal: 'Anticolonization: free Black Northerners rejected the plan and fought for rights at home.',
    },
  ],
  remember: [
    'The North ended slavery slowly through gradual emancipation; about 3,500 people were still enslaved there in 1830.',
    'Free Black communities built churches, mutual aid societies and newspapers, and answered racist science in print.',
    'Black activists such as Walker, Forten, Douglass and Truth led the fight against slavery and colonization.',
  ],
};

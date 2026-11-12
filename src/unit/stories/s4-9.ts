import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'club',
      marker: '1836',
      heading: 'New England’s new thinkers',
      text: `Drawing on [[British Romanticism / German idealism|British Romanticism and German idealism]], a circle of ministers and writers from [[Unitarianism|Unitarianism]], a liberal faith that rejected Christ's divinity and was centered at Harvard, formed the [[Transcendental Club (1836)|Transcendental Club]] in 1836.`,
    },
    {
      id: 'emerson',
      marker: '1837–1841',
      heading: 'Truth through intuition',
      text: `[[Transcendentalism]] had no creed: truth came through intuition, and God could be found in nature. [[Ralph Waldo Emerson]] taught that God is revealed in nature. His address [["The American Scholar" (1837)|"The American Scholar"]] called for intellectual independence from Europe, and his essay [["Self-Reliance" (1841)|"Self-Reliance"]] urged readers to trust the individual soul.`,
    },
    {
      id: 'circle',
      marker: '1840s',
      heading: 'Conscience and community',
      text: `[[Henry David Thoreau]] wrote "Resistance to Civil Government" (1849) on individual conscience. [[Margaret Fuller]] was the club's protofeminist critic, and [[Elizabeth Peabody / Bronson Alcott|Elizabeth Peabody and Bronson Alcott]] were educational reformers. [[George Ripley / Brook Farm|George Ripley's Brook Farm]], a utopian community, adopted [[Fourierism]], a plan for a society built on cooperation.`,
      motif: 'church',
    },
    {
      id: 'print',
      marker: '1830s',
      heading: 'Cheap print, wide audiences',
      text: `New [[Printing technology (1830s)|printing technology]] lowered costs and widened audiences for reform literature. The [[Lyceum|lyceum]] lecture circuit carried antislavery speakers from town to town, and [[Slave narratives|slave narratives]] moved white Northern readers. [[Uncle Tom's Cabin (1852)|Uncle Tom's Cabin]] (1852) would later set Tom's sale in the New Orleans market. Even [[Children's magazines|children's magazines]] such as *Juvenile Miscellany* and *Parley's Magazine* taught upward mobility.`,
    },
    {
      id: 'racism',
      marker: '1810s–1830s',
      heading: 'Print that mocked',
      text: `Popular print and performance spread racism too. In the 1810s, [["Bobalition" broadsides|"Bobalition" broadsides]] in Boston mocked Black abolitionists. On stage, [[Thomas Dartmouth Rice / "Jim Crow"|Thomas Dartmouth Rice]], a white actor in blackface, performed as "Jim Crow," and blackface minstrelsy spread racist caricature. Meanwhile the middle class marked its identity through [["Respectable" middle-class culture|"respectable" behavior]].`,
      motif: 'broadside',
    },
  ],
  predictions: [
    {
      after: 'emerson',
      question: 'Emerson called for intellectual independence from Europe. What kind of writing do you predict followed?',
      options: ['Distinctly American writing about American life and ideals', 'Copies of British novels', 'Only religious sermons'],
      answer: 0,
      reveal: 'Thoreau, Fuller and others built a homegrown American literature, and cheap print carried it far.',
    },
    {
      after: 'print',
      question: 'Cheap printing widened audiences. Who else do you predict used cheap print and popular stages?',
      options: ['People spreading racist caricature', 'Only abolitionists', 'Only the federal government'],
      answer: 0,
      reveal: 'The same tools spread reform and sentiment and, in broadsides and blackface minstrelsy, racism.',
    },
  ],
  remember: [
    'Transcendentalists (Emerson, Thoreau, Fuller) sought truth through intuition and nature and declared intellectual independence from Europe.',
    'Cheaper printing in the 1830s spread reform literature, lyceum lectures and slave narratives.',
    'Popular culture also spread racism, from “Bobalition” broadsides to blackface minstrelsy.',
  ],
};

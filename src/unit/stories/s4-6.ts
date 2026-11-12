import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'middle',
      marker: 'Work leaves home',
      heading: 'A new middle class',
      text: `As work moved out of the household, a [[New middle class|new middle class]] of managers and clerks ran Northern industry. Middle-class families embraced [[Separate spheres|separate spheres]]: men in the public world, women in the private home.`,
    },
    {
      id: 'ideal',
      marker: 'The home',
      heading: 'The ideal woman, and the law',
      text: `The [[Cult of Domesticity / True Womanhood|cult of domesticity]] held up an ideal that confined middle-class women to the home. The law agreed: under [[Coverture|coverture]], a married woman's legal identity and property belonged to her husband. Yet marriage itself was changing, as [[Companionate marriage|companionate marriage]] rested more on affection and compatibility.`,
    },
    {
      id: 'buying',
      marker: 'The home',
      heading: 'Buying, raising, teaching',
      text: `Where the diarist Martha Ballard had recorded making cloth, middle-class [[Women as consumers|women increasingly bought it]]. Families embraced [[Romantic Childhood|a sheltered, schooled childhood]], and [[Female academies / women teachers|female academies]] such as Bristol Academy trained women to teach. The French visitor [[Alexis de Tocqueville]] praised young American women's independence. Poor children got different treatment: New York's [[House of Refuge (NYC)|House of Refuge]] placed them in apprenticeships.`,
      motif: 'press',
    },
    {
      id: 'wages',
      marker: '1820s–1830s',
      heading: 'Wages, and the end of apprenticeship',
      text: `Ready-made goods brought the [[Decline of apprenticeship|decline of apprenticeship]], ending the master-apprentice bond. The Rev. [[Free labor (Rev. Alonzo Potter)|Alonzo Potter]] praised wage work as freedom; the labor activist [[Seth Luther]] attacked how capitalists exploited workers. In Lowell, [["Mill girls"|"mill girls"]], young women from farm families, tended the machines.`,
    },
    {
      id: 'unions',
      marker: '1825–1842',
      heading: 'Workers organize',
      text: `Workers organized. Philadelphia shoemakers formed the [[Federal Society of Journeymen Cordwainers]], and the [[Boston Carpenters' Union (1825)|Boston Carpenters' Union]] protested low wages in 1825. Unions pressed for a [[Closed shop|closed shop]], in which employers hire only union members. In [[Commonwealth v. Hunt (1842)|Commonwealth v. Hunt]] (1842), a Massachusetts court ruled unions legal.`,
    },
    {
      id: 'turnouts',
      marker: '1834–1840s',
      heading: 'Women walk out',
      text: `When Lowell cut wages, women operatives walked out in the [[Lowell "turnouts" (1834, 1836)|Lowell "turnouts"]] of 1834 and 1836. In the 1840s the [[Ten-Hour Movement]] campaigned for a shorter workday. [[Sarah Bagley / Lowell Female Labor Reform Association|Sarah Bagley and the Lowell Female Labor Reform Association]] led petition drives, and Bagley's labor newspaper, the [[Voice of Industry]], spread the cause.`,
      motif: 'petition',
    },
    {
      id: 'laws',
      marker: '1840–1842',
      heading: 'Reform by law',
      text: `Government responded in part. [[Van Buren's ten-hour order|President Van Buren ordered]] a ten-hour day on federal public works, and the [[Massachusetts child labor law (1842)|Massachusetts child labor law]] of 1842 limited children under 12 to ten hours a day.`,
    },
    {
      id: 'immigrants',
      marker: '1820–1860',
      heading: 'Newcomers',
      text: `[[Immigration (1820–1860)|Immigration]] brought over 5 million people between 1820 and 1860, mostly Irish, German and Jewish. The [[Irish Famine]] drove about 1.7 million people from Ireland between 1840 and 1860, and [[Chain migration|chain migration]] followed as wages sent home brought relatives over. [[German immigrants / "German Triangle"|German immigrants]], many of them skilled families, settled in St. Louis, Cincinnati and Milwaukee, and the failed [[Revolutions of 1848|revolutions of 1848]] pushed more Germans to emigrate.`,
      motif: 'ship',
    },
    {
      id: 'nativism',
      marker: '1834–1850s',
      heading: 'Nativist backlash',
      text: `Many native-born Protestants answered with [[Nativism|nativism]], hostility to Catholics and immigrants. In the [[Convent attack near Boston (1834)|1834 convent attack]], a Protestant mob burned a Catholic convent near Boston. [[Samuel F. B. Morse on Catholics|Samuel F. B. Morse]], inventor of the telegraph, warned of a Catholic plot against free institutions, and the minister [[Lyman Beecher on immigrants|Lyman Beecher]] warned of "floods of pauper emigrants." In the 1850s the [[Know-Nothings (American Party)|Know-Nothings]] would turn nativism into a political party.`,
      motif: 'broadside',
    },
  ],
  predictions: [
    {
      after: 'buying',
      question: 'Middle-class ideals told women to stay home. Which women do you predict could NOT live that ideal?',
      options: ['Working-class women, such as mill operatives', 'Wealthy women in Boston', 'None: every woman could'],
      answer: 0,
      reveal: 'Separate spheres was a middle-class ideal. Young farm women went to work in Lowell’s mills, and enslaved women were forced to labor.',
    },
    {
      after: 'unions',
      question: "Lowell's owners cut wages in 1834. How do you predict the women operatives responded?",
      options: ['They walked out in protest', 'They accepted the cuts quietly', 'They bought out the mill owners'],
      answer: 0,
      reveal: 'They walked out in the Lowell turnouts of 1834 and 1836.',
    },
    {
      after: 'immigrants',
      question: 'Millions of Irish Catholic and German immigrants arrived. How do you predict many native-born Protestants reacted?',
      options: ['With nativist hostility', 'By converting to Catholicism', 'By leaving the cities for good'],
      answer: 0,
      reveal: 'Nativism: hostility to Catholics and immigrants, from mob violence to the Know-Nothing party of the 1850s.',
    },
  ],
  remember: [
    'The market revolution created a middle class with “separate spheres” ideals and a wage-earning working class.',
    'Workers, including Lowell’s women operatives, organized unions, turnouts and the Ten-Hour Movement; Commonwealth v. Hunt (1842) made unions legal.',
    'Over 5 million immigrants, mostly Irish and German, arrived from 1820 to 1860 and met nativist hostility.',
  ],
};

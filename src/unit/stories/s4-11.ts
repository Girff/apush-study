import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'empire',
      marker: '1815',
      heading: 'The benevolent empire',
      text: `Revival optimism poured into [[Voluntary associations|voluntary associations]], which took over from almshouses in tackling social problems. Together they formed a [[Benevolent empire (1815–1861)|benevolent empire]] of evangelical reform societies, and [[Middle-class women reformers|middle-class women]] took leading roles in moral reform.`,
    },
    {
      id: 'temperance',
      marker: '1826',
      heading: 'Temperance',
      text: `The [[Temperance movement|temperance movement]] was the largest antebellum reform movement. The [[American Temperance Society (1826)|American Temperance Society]] spread the temperance pledge nationwide, and the [[Cold Water Army]] canvassed towns. Many working-class immigrants felt targeted: [[Irish Catholic resentment|Irish Catholics resented]] temperance meddling.`,
      motif: 'petition',
    },
    {
      id: 'souls',
      marker: 'Moral reform',
      heading: 'Sundays, streets and souls',
      text: `[[Sabbatarians]] fought work and leisure on Sundays, and [[Moral reform societies|moral reform societies]] sought to end prostitution. The [[American Bible Society / American Tract Society|American Bible Society and American Tract Society]] used steam presses to distribute Bibles and tracts, the [[American Home Missionary Society]] supported frontier congregations, and the [[ABCFM (1810)|ABCFM]], a foreign mission board, opposed Indian removal.`,
      motif: 'press',
    },
    {
      id: 'institutions',
      marker: 'Institutions',
      heading: 'Asylums and penitentiaries',
      text: `Reformers built [[Asylums, orphanages, dispensaries|asylums, orphanages and dispensaries]]. Pennsylvania's [[Eastern State Penitentiary / panopticon|Eastern State Penitentiary]] was designed to reform inmates through surveillance. Some went further and remade family life itself: [[John Humphrey Noyes / Oneida|John Humphrey Noyes's Oneida]] community practiced "complex marriage."`,
      motif: 'church',
    },
    {
      id: 'schools',
      marker: 'Schooling',
      heading: 'Education for women',
      text: `Reformers opened classrooms to women. [[Emma Willard / Troy Female Seminary|Emma Willard]], founder of the Troy Female Seminary, pioneered women's higher education. [[Catharine Beecher / Hartford Female Seminary|Catharine Beecher]] founded the Hartford Female Seminary and also led the petitions against Indian removal, and [[Mary Lyon / Mount Holyoke|Mary Lyon]] founded Mount Holyoke.`,
    },
    {
      id: 'gradual',
      marker: 'Before 1830',
      heading: 'Slow roads to freedom',
      text: `Opposition to slavery was old. [[Quakers]] had questioned it since the late 1600s, and in [[Transatlantic reform|transatlantic reform]] networks, British abolitionists such as Thomas Clarkson worked with Americans. But early plans were cautious: [[Gradual vs. conditional emancipation|gradual or conditional emancipation]], or the [[Colonization movement|colonization movement]]'s plan to send free Black Americans to Africa.`,
    },
    {
      id: 'immediate',
      marker: '1831–1833',
      heading: 'Immediatism',
      text: `In the 1830s abolitionists demanded [[Immediatism|immediatism]], an end to slavery right away, and practiced [[Moral suasion|moral suasion]], persuading enslavers through Christian conscience. [[William Lloyd Garrison / The Liberator (1831)|William Lloyd Garrison]] launched *The Liberator* in 1831. The wealthy evangelicals [[Arthur and Lewis Tappan]], the evangelical [[Theodore Dwight Weld]] and the Quaker poet [[John Greenleaf Whittier]] joined the cause, and in 1833 abolitionists formed the national [[American Anti-Slavery Society (1833)|American Anti-Slavery Society]]. [[Wendell Phillips]] exposed Northern complicity in slavery.`,
      motif: 'press',
    },
    {
      id: 'petitions',
      marker: '1835–1836',
      heading: 'Mail and petitions',
      text: `The [[Postal campaign (1835)|postal campaign]] of 1835 mailed antislavery literature to Southern enslavers, and the [[Great Petition Campaign (1836)|Great Petition Campaign]] flooded Congress with petitions. The House responded with the [[Gag rule (1836)|gag rule]]: it refused to discuss antislavery petitions at all.`,
      motif: 'petition',
    },
    {
      id: 'mobs',
      marker: '1837–1838',
      heading: 'Mob violence in the North',
      text: `Abolitionists faced violence in the North. In 1837 a mob killed the abolitionist editor [[Elijah Lovejoy]]. In Philadelphia, [[Anti-abolition riot in Philadelphia|white rioters torched an antislavery meeting house]], and in 1838 a mob burned [[Pennsylvania Hall (1838)|Pennsylvania Hall]] during the Anti-Slavery Convention of American Women.`,
    },
    {
      id: 'split',
      marker: '1839–1840',
      heading: 'Politics, and a split',
      text: `Some abolitionists turned to elections, forming the [[Liberty Party (1839) / James G. Birney|Liberty Party]], the first antislavery political party, with James G. Birney as its candidate. In the [[1840 split / Abby Kelly|1840 split]], a fight over women's roles centered on Abby Kelly divided the American Anti-Slavery Society, and the Tappans formed the American and Foreign Anti-Slavery Society.`,
      motif: 'ballot',
    },
    {
      id: 'women',
      marker: '1830s',
      heading: 'Women abolitionists',
      text: `Women built the movement's base. Members of the [[Female Anti-Slavery Society / free-produce boycotts|Female Anti-Slavery Society]] boycotted sugar and other goods made with slave labor. [[Angelina and Sarah Grimké|Angelina and Sarah Grimké]], sisters born in Charleston, spoke against slavery to mixed ("promiscuous") audiences of men and women, which many considered scandalous.`,
    },
    {
      id: 'london',
      marker: '1840',
      heading: 'Shut out in London',
      text: `When the [[World Anti-Slavery Convention (London, 1840)|World Anti-Slavery Convention]] in London refused to seat women delegates, the insult sparked the women's rights movement.`,
    },
    {
      id: 'seneca',
      marker: '1848',
      heading: 'Seneca Falls',
      text: `[[Elizabeth Cady Stanton / Lucretia Mott|Elizabeth Cady Stanton and Lucretia Mott]] organized the [[Seneca Falls Convention (1848)|Seneca Falls Convention]], the first women's rights convention. Its [[Declaration of Sentiments|Declaration of Sentiments]], modeled on the Declaration of Independence, was signed by 68 women and 32 men. [[Susan B. Anthony]], who came out of antislavery work, became a leader of the movement. Legal change came slowly: few states reformed [[Married women's property laws|married women's property laws]] before the Civil War.`,
      motif: 'broadside',
    },
  ],
  predictions: [
    {
      after: 'gradual',
      question: 'Revivalists believed sin must end now, not someday. How do you predict that changed antislavery demands?',
      options: ['Abolitionists demanded an immediate end to slavery', 'They backed slower, gradual plans', 'They dropped the issue'],
      answer: 0,
      reveal: 'Immediatism: Garrison and others demanded an end to slavery right away.',
    },
    {
      after: 'immediate',
      question: 'Abolitionists flooded Congress with petitions. How do you predict the House responded?',
      options: ['It refused to discuss them', 'It abolished slavery in 1836', 'It read every petition aloud'],
      answer: 0,
      reveal: 'The 1836 gag rule refused to discuss antislavery petitions.',
    },
    {
      after: 'women',
      question: 'In 1840, women abolitionists were refused seats at a London convention. What do you predict some of them did?',
      options: ['Organized for women’s own rights', 'Quit reform work', 'Moved to London'],
      answer: 0,
      reveal: 'The insult sparked the women’s rights movement, which led to Seneca Falls in 1848.',
    },
  ],
  remember: [
    'Revival-driven reformers, many of them middle-class women, built a “benevolent empire” of temperance, moral reform and institutions.',
    'Abolitionists moved from gradual plans and colonization to immediatism, and met gag rules and mob violence.',
    'Women’s exclusion from antislavery work led to Seneca Falls (1848) and the Declaration of Sentiments.',
  ],
};

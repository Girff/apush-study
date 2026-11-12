import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'roots',
      marker: '1700s',
      heading: 'An older awakening',
      text: `A generation before independence, the [[First Great Awakening / George Whitefield|First Great Awakening]], led by preachers such as George Whitefield, built transatlantic networks of revival. The [[Second Great Awakening]], a series of revivals in the early 1800s, was in part a [[Reaction to the Enlightenment|reaction to the Enlightenment]] that pushed back against 18th-century rationalism.`,
    },
    {
      id: 'caneridge',
      marker: 'Aug. 1801',
      heading: 'Cane Ridge',
      text: `Revivals broke out at outdoor [[Camp meetings|camp meetings]], full of emotional and physical enthusiasm. The [[Cane Ridge Revival (Aug. 1801)|Cane Ridge Revival]] in Kentucky, in August 1801, was one of the earliest and largest.`,
    },
    {
      id: 'market',
      marker: '1784–1850',
      heading: 'A spiritual marketplace',
      text: `Once state support ended, churches had to compete for members in a [[Spiritual marketplace|spiritual marketplace]]. The [[Congregationalists / Episcopalians|Congregationalists and Episcopalians]], established churches with formal worship, lost ground. [[Methodists, Baptists, Presbyterians|Methodists, Baptists and Presbyterians]] led the revivals and came to dominate Southern religion. The [[Methodist Episcopal Church (1784)|Methodist Episcopal Church]], which broke from the Church of England in 1784, became the largest denomination by 1850, carried to the frontier by [[Circuit riders|circuit riders]].`,
      motif: 'church',
    },
    {
      id: 'theology',
      marker: 'A new theology',
      heading: 'Salvation in your own hands',
      text: `Revivalists rejected [[Orthodox Calvinism / predestination|orthodox Calvinism]] and its doctrine of predestination as too pessimistic. Even the Congregationalist [[Lyman Beecher]] softened Calvinism. Revival preaching stressed [[Spiritual egalitarianism|spiritual egalitarianism]], that all souls are equal in salvation, which opened the pulpit to women and Black preachers who claimed authority from a [["Call to preach"|"call to preach"]] rather than formal training.`,
    },
    {
      id: 'finney',
      marker: '1820s–1830s',
      heading: 'The Burned-Over District',
      text: `[[Charles Grandison Finney]], the leading revivalist, coined the name [[Burned-Over District]] for western and central New York, swept by revival after revival. Finney preached [[Perfectionism|perfectionism]]: the redeemed should live free of sin.`,
    },
    {
      id: 'action',
      marker: 'Faith into action',
      heading: 'Perfecting the world',
      text: `Two more ideas turned faith into action. [[Disinterested benevolence|Disinterested benevolence]] meant giving up self-love to serve others. [[Postmillennialism|Postmillennialism]] taught that Christ would return after a thousand years of peace, so believers must perfect the world. That optimism drove the reform movements of 4.11.`,
      motif: 'petition',
    },
    {
      id: 'new-faiths',
      marker: 'New faiths',
      heading: 'New churches and communities',
      text: `The revivals also produced new faiths. The restorationists [[Alexander Campbell / Barton Stone|Alexander Campbell and Barton Stone]] sought a return to New Testament Christianity. The [[Seventh-Day Adventist Church]] was born from the revivals, and the celibate [[Shakers]] built communities in New England and the Midwest.`,
      motif: 'church',
    },
    {
      id: 'mormons',
      marker: '1830–1852',
      heading: 'The Latter-day Saints',
      text: `In 1830 [[Joseph Smith / Book of Mormon (1830)|Joseph Smith]] published the Book of Mormon and founded the Church of Jesus Christ of Latter-day Saints. His followers built [[Nauvoo, Illinois|Nauvoo]], a city on the Mississippi. After [[Smith's murder (1844)|a mob killed Smith in 1844]], the Mormons moved to the Great Salt Lake. The church publicly acknowledged [[Polygamy (plural marriage)|polygamy]] in 1852.`,
    },
  ],
  predictions: [
    {
      after: 'market',
      question: 'Without state support, churches had to compete. Which style of preaching do you predict drew the most converts?',
      options: ['Emotional, popular revival preaching', 'Formal, scholarly sermons', 'Sermons read in Latin'],
      answer: 0,
      reveal: 'Methodists, Baptists and Presbyterians, with revivals and circuit riders, grew fastest; the formal established churches lost ground.',
    },
    {
      after: 'finney',
      question: 'Finney taught that the redeemed should live free of sin. What do you predict his followers did with that belief?',
      options: ['Set out to reform society', 'Withdrew from public life', 'Rejected all churches'],
      answer: 0,
      reveal: 'They turned faith into action: disinterested benevolence and postmillennial hope drove the reform movements of 4.11.',
    },
  ],
  remember: [
    'The Second Great Awakening rejected Calvinist predestination and put salvation in each person’s hands.',
    'Without state churches, a competitive “spiritual marketplace” favored Methodists, Baptists and new faiths like the Latter-day Saints.',
    'Perfectionism and postmillennial optimism drove Americans to reform society.',
  ],
};

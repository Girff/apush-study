/**
 * Content for Who Am I?, Fill-the-Chain and Sort It. Clues and sentences
 * restate the unit definitions; every term reference is checked by the
 * content tests.
 */

export interface Person {
  id: string;
  answer: string;
  /** Normalized accepted answers (lowercase, no punctuation). */
  aliases: string[];
  /** Hardest first. */
  clues: string[];
  terms: string[];
}

export const PEOPLE: Person[] = [
  {
    id: 'jackson',
    answer: 'Andrew Jackson',
    aliases: ['andrew jackson', 'jackson', 'old hickory'],
    clues: [
      'I held about 150 people in slavery at the Hermitage, my Tennessee plantation.',
      'In 1818 I invaded Spanish Florida and seized Pensacola.',
      'I won the most popular votes in 1824, but the House chose someone else, and my supporters cried "corrupt bargain."',
      'As the seventh president I vetoed the Second Bank, and critics called me "King Andrew the First."',
    ],
    terms: ['4.8:Andrew Jackson (1767–1845)', '4.4:First Seminole War (1818)', '4.7:"Corrupt bargain"', '4.8:Bank veto (July 1832)'],
  },
  {
    id: 'tecumseh',
    answer: 'Tecumseh',
    aliases: ['tecumseh'],
    clues: [
      'Creek warriors known as Red Sticks allied with me.',
      'My brother led a religious revitalization from a town in Indiana.',
      'In 1811 Indiana’s governor attacked our movement at Tippecanoe.',
      'I am the Shawnee leader who called for pan-Native unity and resistance.',
    ],
    terms: ['4.4:Tecumseh', '4.4:Tenskwatawa ("the Prophet")', '4.4:Battle of Tippecanoe (1811)', '4.4:Red Sticks / Creek civil war'],
  },
  {
    id: 'garrison',
    answer: 'William Lloyd Garrison',
    aliases: ['william lloyd garrison', 'garrison', 'william garrison'],
    clues: [
      'A Philadelphia sailmaker’s writing changed my views.',
      'I was a radical immediatist: end slavery right away.',
      'In 1831 I launched The Liberator.',
    ],
    terms: ['4.11:William Lloyd Garrison / The Liberator (1831)', '4.11:Immediatism', '4.12:James Forten / Letters from a Man of Colour (1813)'],
  },
  {
    id: 'finney',
    answer: 'Charles Grandison Finney',
    aliases: ['charles grandison finney', 'charles finney', 'finney'],
    clues: [
      'I preached perfectionism: the redeemed should live free of sin.',
      'I was the leading revivalist of the Second Great Awakening.',
      'I coined the name "Burned-Over District" for western and central New York.',
    ],
    terms: ['4.10:Charles Grandison Finney', '4.10:Perfectionism', '4.10:Burned-Over District'],
  },
  {
    id: 'stanton',
    answer: 'Elizabeth Cady Stanton (with Lucretia Mott)',
    aliases: ['elizabeth cady stanton', 'elizabeth stanton', 'stanton', 'lucretia mott', 'mott'],
    clues: [
      'When a London convention refused to seat women delegates in 1840, it helped spark my cause.',
      'Our Declaration of Sentiments was modeled on the Declaration of Independence.',
      'With Lucretia Mott, I organized the Seneca Falls Convention of 1848.',
    ],
    terms: ['4.11:Elizabeth Cady Stanton / Lucretia Mott', '4.11:Seneca Falls Convention (1848)', '4.11:Declaration of Sentiments'],
  },
  {
    id: 'jefferson',
    answer: 'Thomas Jefferson',
    aliases: ['thomas jefferson', 'jefferson'],
    clues: [
      'In 1816 I attacked "monied corporations."',
      'I heard the Missouri Crisis like a "fire bell" in the night.',
      'I called my own election "the revolution of 1800."',
      'As the third president I bought Louisiana and tried peaceable coercion.',
    ],
    terms: ['4.2:Thomas Jefferson', '4.5:Jefferson on "monied corporations"', '4.3:"Fire bell"', '4.2:"Revolution of 1800"'],
  },
  {
    id: 'calhoun',
    answer: 'John C. Calhoun',
    aliases: ['john c calhoun', 'john calhoun', 'calhoun'],
    clues: [
      'My wife, Floride, led the cabinet wives who shunned Margaret Eaton.',
      'I called slavery the "peculiar domestick institution."',
      'My secret South Carolina Exposition and Protest argued that states could nullify federal law.',
      'A South Carolina War Hawk, I called for federal roads and canals in 1817.',
    ],
    terms: ['4.3:John C. Calhoun', '4.8:South Carolina Exposition and Protest', '4.8:Eaton Affair ("Petticoat Affair")'],
  },
  {
    id: 'clay',
    answer: 'Henry Clay',
    aliases: ['henry clay', 'clay'],
    clues: [
      'Like Jackson, Burr and Benton, I fought a duel.',
      'With Calhoun, I brokered the compromise tariff that ended the nullification crisis.',
      'Adams made me secretary of state, and Jackson’s backers cried "corrupt bargain."',
      'A Kentucky War Hawk, I promoted the American System and was called the "Great Compromiser."',
    ],
    terms: ['4.3:Henry Clay', '4.3:American System', '4.8:Compromise tariff', '4.13:Dueling'],
  },
  {
    id: 'douglass',
    answer: 'Frederick Douglass',
    aliases: ['frederick douglass', 'frederick douglas', 'douglass', 'douglas'],
    clues: ['I won British support on a trip in 1845.', 'I was one of the most powerful orators of the antislavery movement.', 'I published my Narrative in 1845.'],
    terms: ['4.12:Frederick Douglass', "4.12:Black activists' transatlantic ties"],
  },
  {
    id: 'bagley',
    answer: 'Sarah Bagley',
    aliases: ['sarah bagley', 'bagley'],
    clues: ['My labor newspaper was called the Voice of Industry.', 'I led the Lowell Female Labor Reform Association.', 'I organized petition drives for a ten-hour workday.'],
    terms: ['4.6:Sarah Bagley / Lowell Female Labor Reform Association', '4.6:Voice of Industry', '4.6:Ten-Hour Movement'],
  },
  {
    id: 'smith',
    answer: 'Joseph Smith',
    aliases: ['joseph smith', 'smith'],
    clues: [
      'The church I founded publicly acknowledged plural marriage in 1852.',
      'My followers built a city called Nauvoo on the Mississippi.',
      'In 1830 I published the Book of Mormon and founded the Church of Jesus Christ of Latter-day Saints.',
    ],
    terms: ['4.10:Joseph Smith / Book of Mormon (1830)', '4.10:Nauvoo, Illinois', '4.10:Polygamy (plural marriage)'],
  },
  {
    id: 'emerson',
    answer: 'Ralph Waldo Emerson',
    aliases: ['ralph waldo emerson', 'waldo emerson', 'emerson'],
    clues: [
      'In 1841 I urged readers to trust the individual soul.',
      'I taught that God is revealed in nature.',
      'My 1837 address "The American Scholar" called for intellectual independence from Europe.',
    ],
    terms: ['4.9:Ralph Waldo Emerson', '4.9:"The American Scholar" (1837)', '4.9:"Self-Reliance" (1841)'],
  },
  {
    id: 'biddle',
    answer: 'Nicholas Biddle',
    aliases: ['nicholas biddle', 'biddle'],
    clues: [
      'I directed a Philadelphia-based national bank chartered in 1816.',
      'I pushed for early recharter in 1832, and the president vetoed it.',
      'I was Andrew Jackson’s opponent in the Bank War.',
    ],
    terms: ['4.8:Nicholas Biddle', '4.8:Second Bank of the United States', '4.8:Bank War'],
  },
  {
    id: 'jqa',
    answer: 'John Quincy Adams',
    aliases: ['john quincy adams', 'quincy adams', 'jqa', 'adams'],
    clues: [
      'As Monroe’s secretary of state, I negotiated the treaty in which Spain ceded Florida.',
      'In 1824 the House chose me, though Jackson had won the most popular votes.',
      'When I made Henry Clay my secretary of state, critics cried "corrupt bargain."',
    ],
    terms: ['4.4:John Quincy Adams', '4.4:Adams-Onís Treaty (1819)', '4.7:House of Representatives decides'],
  },
  {
    id: 'morse',
    answer: 'Samuel F. B. Morse',
    aliases: ['samuel f b morse', 'samuel morse', 'morse'],
    clues: [
      'I warned of a Catholic plot against free institutions.',
      'My line between Washington and Baltimore began a communications revolution.',
      'I built the telegraph in 1843–1844.',
    ],
    terms: ['4.5:Samuel Morse / telegraph (1843–1844)', '4.6:Samuel F. B. Morse on Catholics'],
  },
  {
    id: 'lyman-beecher',
    answer: 'Lyman Beecher',
    aliases: ['lyman beecher', 'beecher'],
    clues: ['I warned of "floods of pauper emigrants."', 'I was a temperance leader.', 'A Congregationalist minister, I softened Calvinism during the Second Great Awakening.'],
    terms: ['4.10:Lyman Beecher', '4.6:Lyman Beecher on immigrants'],
  },
  {
    id: 'harrison',
    answer: 'William Henry Harrison',
    aliases: ['william henry harrison', 'william harrison', 'harrison'],
    clues: [
      'As Indiana’s governor, I pushed for military action.',
      'My 1811 attack at Tippecanoe broke Tecumseh’s confederacy.',
      'In 1840 the Whigs sold me as a common man of log cabins and hard cider.',
      'I died after 31 days as president.',
    ],
    terms: ['4.4:William Henry Harrison', '4.7:Election of 1840', '4.7:"Log cabin and hard cider"'],
  },
  {
    id: 'vanburen',
    answer: 'Martin Van Buren',
    aliases: ['martin van buren', 'van buren', 'vanburen'],
    clues: [
      'I ordered a ten-hour day on federal public works.',
      'The Eaton Affair helped me rise while Calhoun fell.',
      'They called me the "Little Magician," and I won the presidency in 1836.',
    ],
    terms: ['4.7:Martin Van Buren', "4.6:Van Buren's ten-hour order", '4.8:Cabinet resignations'],
  },
];

export interface ClozeChain {
  id: string;
  title: string;
  /** Each step has exactly one {{ref}} blank. */
  steps: string[];
  decoys: string[];
}

export const CLOZE_CHAINS: ClozeChain[] = [
  {
    id: 'haiti',
    title: 'From Haiti to Louisiana',
    steps: [
      "Enslaved people's victory in the {{4.4:Haitian Revolution (1791–1804)}} defeated France.",
      'Having lost Haiti, {{4.4:Napoleon Bonaparte / Talleyrand}} offered to sell all of Louisiana.',
      'U.S. minister {{4.4:Robert R. Livingston}} negotiated the deal.',
      'The {{4.4:Louisiana Purchase (1803)}} doubled the nation for $15 million.',
    ],
    decoys: ['4.4:Monroe Doctrine (1823)', '4.4:Adams-Onís Treaty (1819)'],
  },
  {
    id: '1812',
    title: 'The road to 1812, and after',
    steps: [
      'Britain forced about 6,000 Americans into its navy through {{4.4:Impressment}}.',
      'Jefferson answered with the {{4.4:Embargo Act of 1807}}, which closed U.S. ports.',
      'Young {{4.4:War Hawks}} such as Clay and Calhoun pushed for war.',
      'New England Federalists who opposed the war met at the {{4.4:Hartford Convention (1814)}}.',
      "Monroe's win in 1816 completed the {{4.2:Death of the Federalist Party}}.",
    ],
    decoys: ['4.4:Treaty of Ghent (Dec. 24, 1814)', '4.4:Battle of New Orleans (Jan. 1815)'],
  },
  {
    id: 'missouri',
    title: 'Missouri and the Union',
    steps: [
      "Missouri's bid to enter as a slave state set off the {{4.3:Missouri Crisis (1819–1820)}}.",
      'The {{4.3:James Tallmadge / Tallmadge Amendment}} would have barred new enslavement there.',
      'Illinois senator {{4.3:Jesse Thomas}} proposed a deal.',
      'The {{4.3:Missouri Compromise (1820)}} admitted Missouri as a slave state and Maine as a free state.',
      'The {{4.3:36°30′ line}} banned slavery north of it in the rest of the Louisiana Purchase.',
    ],
    decoys: ['4.3:American System', '4.3:Panic of 1819'],
  },
  {
    id: 'nullification',
    title: 'The Nullification Crisis',
    steps: [
      'The South blamed its losses on the {{4.8:Tariff of 1828 ("Tariff of Abominations")}}.',
      "Calhoun's secret {{4.8:South Carolina Exposition and Protest}} argued that states could void federal law.",
      'With the {{4.8:Tariff of 1832 / Ordinance of Nullification}}, South Carolina declared the tariffs "null, void, and no law."',
      "Jackson's {{4.8:Force Bill}} authorized military force to collect them.",
      "Clay and Calhoun's {{4.8:Compromise tariff}} lowered rates and ended the crisis.",
    ],
    decoys: ['4.8:Specie Circular (July 1836)', '4.8:Pet banks (1833)'],
  },
  {
    id: 'bank',
    title: 'The Bank War',
    steps: [
      '{{4.8:Nicholas Biddle}} pushed for early recharter of the national bank in 1832.',
      "Jackson's {{4.8:Bank veto (July 1832)}} called the bank unconstitutional and dangerous.",
      'Federal deposits moved to state {{4.8:Pet banks (1833)}}.',
      'The {{4.8:Specie Circular (July 1836)}} required gold or silver for federal land, and the bubble burst.',
      'In the {{4.8:Panic of 1837}}, about 200 banks closed.',
    ],
    decoys: ['4.8:Force Bill', '4.3:Panic of 1819'],
  },
  {
    id: 'mills',
    title: 'Mills and workers',
    steps: [
      '{{4.5:Samuel Slater (1789)}} copied British yarn machines for a Pawtucket mill.',
      'The {{4.5:Waltham-Lowell System}} put textile production under one roof.',
      'Young farm women, the {{4.6:"Mill girls"}}, tended the machines in Lowell.',
      'When wages were cut, they walked out in the {{4.6:Lowell "turnouts" (1834, 1836)}}.',
      'In {{4.6:Commonwealth v. Hunt (1842)}}, a Massachusetts court ruled unions legal.',
    ],
    decoys: ['4.5:Putting-out system', '4.6:Closed shop'],
  },
  {
    id: 'revival',
    title: 'From revival to reform',
    steps: [
      'The {{4.10:Cane Ridge Revival (Aug. 1801)}} in Kentucky was one of the earliest and largest revivals.',
      '{{4.10:Charles Grandison Finney}} named western New York the Burned-Over District.',
      'Believers in {{4.10:Postmillennialism}} thought they must perfect the world before Christ returned.',
      'Reformers built a {{4.11:Benevolent empire (1815–1861)}} of evangelical societies.',
      'Its largest branch was the {{4.11:Temperance movement}}.',
    ],
    decoys: ['4.10:Orthodox Calvinism / predestination', '4.11:Gag rule (1836)'],
  },
  {
    id: 'rights',
    title: "From abolition to women's rights",
    steps: [
      '{{4.11:William Lloyd Garrison / The Liberator (1831)}} demanded immediate emancipation.',
      'The {{4.11:Great Petition Campaign (1836)}} flooded Congress with petitions.',
      'The House answered with the {{4.11:Gag rule (1836)}}.',
      'The {{4.11:World Anti-Slavery Convention (London, 1840)}} refused to seat women delegates.',
      'The {{4.11:Seneca Falls Convention (1848)}} answered with a Declaration of Sentiments.',
    ],
    decoys: ['4.11:Colonization movement', '4.11:Liberty Party (1839) / James G. Birney'],
  },
  {
    id: 'cotton',
    title: 'Cotton and removal',
    steps: [
      'The {{4.5:Eli Whitney / cotton gin (1794)}} made short-staple cotton profitable.',
      'By 1835, the {{4.13:Five main cotton states (1835)}} ran from South Carolina to Louisiana.',
      'Planters wanted Native land, and the {{4.8:Indian Removal Act (1830)}} forced relocation west of the Mississippi.',
      'In 1838 the U.S. Army forced the Cherokee west on the {{4.8:Trail of Tears (1838)}}.',
    ],
    decoys: ['4.5:Waltham-Lowell System', '4.8:Worcester v. Georgia (1832)'],
  },
];

export interface SortSet {
  id: string;
  title: string;
  prompt: string;
  buckets: Array<{ id: string; label: string }>;
  items: Array<{ ref: string; bucket: string }>;
}

export const SORT_SETS: SortSet[] = [
  {
    id: 'parties',
    title: 'Federalist or Democratic-Republican?',
    prompt: 'Sort each term by the party it belongs with.',
    buckets: [
      { id: 'fed', label: 'Federalist' },
      { id: 'dr', label: 'Democratic-Republican' },
    ],
    items: [
      { ref: '4.2:Fisher Ames', bucket: 'fed' },
      { ref: '4.2:Rufus King', bucket: 'fed' },
      { ref: '4.4:Hartford Convention (1814)', bucket: 'fed' },
      { ref: '4.2:Thomas Jefferson', bucket: 'dr' },
      { ref: '4.2:James Madison', bucket: 'dr' },
      { ref: "4.2:Jefferson's cuts", bucket: 'dr' },
      { ref: '4.2:Easier land purchases', bucket: 'dr' },
      { ref: '4.4:War Hawks', bucket: 'dr' },
      { ref: '4.4:Embargo Act of 1807', bucket: 'dr' },
    ],
  },
  {
    id: 'jackson-whig',
    title: 'Jacksonian Democrat or Whig?',
    prompt: 'Who would you hear it from: Jackson and his Democrats, or the Whigs who opposed them?',
    buckets: [
      { id: 'dem', label: 'Jacksonian Democrat' },
      { id: 'whig', label: 'Whig' },
    ],
    items: [
      { ref: '4.8:Bank veto (July 1832)', bucket: 'dem' },
      { ref: '4.8:Pet banks (1833)', bucket: 'dem' },
      { ref: '4.8:Specie Circular (July 1836)', bucket: 'dem' },
      { ref: '4.8:"Monied aristocracy"', bucket: 'dem' },
      { ref: '4.7:"Old Hickory" / frontier image', bucket: 'dem' },
      { ref: '4.7:Martin Van Buren', bucket: 'dem' },
      { ref: '4.8:"King Andrew the First"', bucket: 'whig' },
      { ref: '4.7:Harrisburg convention (1839)', bucket: 'whig' },
      { ref: '4.7:"Log cabin and hard cider"', bucket: 'whig' },
      { ref: '4.7:"Tippecanoe and Tyler Too"', bucket: 'whig' },
      { ref: '4.7:National Republicans', bucket: 'whig' },
      { ref: '4.3:American System', bucket: 'whig' },
    ],
  },
  {
    id: 'north-south',
    title: 'Northern or Southern economy?',
    prompt: 'Which regional economy does each term describe?',
    buckets: [
      { id: 'north', label: 'Northern economy' },
      { id: 'south', label: 'Southern economy' },
    ],
    items: [
      { ref: '4.5:Waltham-Lowell System', bucket: 'north' },
      { ref: '4.6:"Mill girls"', bucket: 'north' },
      { ref: '4.5:Erie Canal (1825)', bucket: 'north' },
      { ref: '4.6:Commonwealth v. Hunt (1842)', bucket: 'north' },
      { ref: '4.1:Free labor ideology', bucket: 'north' },
      { ref: '4.5:Textile corporations', bucket: 'north' },
      { ref: '4.13:Petit Gulf cotton (1833)', bucket: 'south' },
      { ref: '4.13:Cotton Belt / Black Belt', bucket: 'south' },
      { ref: '4.13:Enslaved people as collateral', bucket: 'south' },
      { ref: "4.13:De Bow's Review / American Cotton Planter", bucket: 'south' },
      { ref: '4.13:Five main cotton states (1835)', bucket: 'south' },
      { ref: '4.13:Long-staple vs. short-staple cotton', bucket: 'south' },
    ],
  },
  {
    id: 'reform',
    title: 'Evangelical reform or labor & legal reform?',
    prompt: 'Was it driven by evangelical societies, or by workers and lawmakers?',
    buckets: [
      { id: 'evangelical', label: 'Evangelical reform' },
      { id: 'legal', label: 'Labor & legal reform' },
    ],
    items: [
      { ref: '4.11:American Bible Society / American Tract Society', bucket: 'evangelical' },
      { ref: '4.11:American Home Missionary Society', bucket: 'evangelical' },
      { ref: '4.11:ABCFM (1810)', bucket: 'evangelical' },
      { ref: '4.11:Sabbatarians', bucket: 'evangelical' },
      { ref: '4.11:Moral reform societies', bucket: 'evangelical' },
      { ref: '4.11:American Temperance Society (1826)', bucket: 'evangelical' },
      { ref: '4.6:Ten-Hour Movement', bucket: 'legal' },
      { ref: '4.6:Commonwealth v. Hunt (1842)', bucket: 'legal' },
      { ref: '4.6:Massachusetts child labor law (1842)', bucket: 'legal' },
      { ref: "4.6:Van Buren's ten-hour order", bucket: 'legal' },
      { ref: "4.11:Married women's property laws", bucket: 'legal' },
      { ref: '4.7:Lowered property requirements', bucket: 'legal' },
    ],
  },
  {
    id: 'market',
    title: 'What kind of market-revolution change?',
    prompt: 'Transportation, farming, manufacturing or communication?',
    buckets: [
      { id: 'transport', label: 'Transportation' },
      { id: 'farming', label: 'Farming' },
      { id: 'making', label: 'Manufacturing' },
      { id: 'comms', label: 'Communication' },
    ],
    items: [
      { ref: '4.5:National Road', bucket: 'transport' },
      { ref: '4.5:Erie Canal (1825)', bucket: 'transport' },
      { ref: '4.5:Robert Fulton (1807)', bucket: 'transport' },
      { ref: '4.5:Baltimore & Ohio Railroad (1827)', bucket: 'transport' },
      { ref: '4.5:Cyrus McCormick', bucket: 'farming' },
      { ref: '4.5:John Deere', bucket: 'farming' },
      { ref: '4.5:Samuel Slater (1789)', bucket: 'making' },
      { ref: '4.5:Francis Cabot Lowell / Paul Moody', bucket: 'making' },
      { ref: '4.5:Putting-out system', bucket: 'making' },
      { ref: '4.5:Samuel Morse / telegraph (1843–1844)', bucket: 'comms' },
      { ref: '4.3:New post offices', bucket: 'comms' },
    ],
  },
  {
    id: 'abolition',
    title: 'Gradual plans or immediate abolition?',
    prompt: 'Did it call for slow, conditional change, or for ending slavery now?',
    buckets: [
      { id: 'gradual', label: 'Gradual or conditional' },
      { id: 'immediate', label: 'Immediate' },
    ],
    items: [
      { ref: '4.11:Colonization movement', bucket: 'gradual' },
      { ref: '4.11:Gradual vs. conditional emancipation', bucket: 'gradual' },
      { ref: "4.12:Jefferson's Notes on the State of Virginia", bucket: 'gradual' },
      { ref: '4.12:Gradual emancipation', bucket: 'gradual' },
      { ref: '4.11:Immediatism', bucket: 'immediate' },
      { ref: '4.11:William Lloyd Garrison / The Liberator (1831)', bucket: 'immediate' },
      { ref: '4.11:American Anti-Slavery Society (1833)', bucket: 'immediate' },
      { ref: '4.12:David Walker / Appeal (1829)', bucket: 'immediate' },
    ],
  },
];

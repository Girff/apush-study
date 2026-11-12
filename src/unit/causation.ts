/**
 * Causation web: nodes (each grouping a few related terms), cause → effect
 * links with a one-line explanation, and expert chains for Build-a-Chain.
 * Every explanation restates the unit JSON or well-established history; see
 * CONTENT_NOTES.md for the sourcing of each link.
 */
export interface CauseNode {
  id: string;
  label: string;
  /** Short date label for display. */
  when: string;
  /** Approximate year, for ordering. */
  year: number;
  theme: 'politics' | 'economy' | 'culture';
  /** Term references ("4.4:Exact name"). */
  terms: string[];
}

export interface CauseLink {
  from: string;
  to: string;
  why: string;
}

export interface ExpertChain {
  id: string;
  title: string;
  prompt: string;
  nodes: string[];
  decoys: string[];
}

export const CAUSE_NODES: CauseNode[] = [
  { id: 'haiti', label: 'Haitian Revolution', when: '1791–1804', year: 1791, theme: 'politics', terms: ['4.4:Haitian Revolution (1791–1804)', "4.12:Haiti's inspiration"] },
  { id: 'louisiana', label: 'Louisiana Purchase', when: '1803', year: 1803, theme: 'politics', terms: ['4.4:Louisiana Purchase (1803)', '4.4:Napoleon Bonaparte / Talleyrand'] },
  { id: 'cottonGin', label: 'Cotton gin', when: '1794', year: 1794, theme: 'economy', terms: ['4.5:Eli Whitney / cotton gin (1794)', '4.13:Long-staple vs. short-staple cotton'] },
  { id: 'cottonBoom', label: 'Cotton Kingdom spreads', when: '1815–1835', year: 1815, theme: 'economy', terms: ['4.1:Cotton Revolution', '4.13:Cotton Belt / Black Belt', '4.13:Cotton exports', '4.13:Five main cotton states (1835)'] },
  { id: 'slaveTrade', label: 'Interregional slave trade', when: '1790–1860', year: 1808, theme: 'economy', terms: ['4.13:Interregional slave trade', '4.13:Upper South vs. Lower South', '4.12:End of the international slave trade (1808)'] },
  { id: 'removal', label: 'Indian Removal Act', when: '1830', year: 1830, theme: 'politics', terms: ['4.8:Indian Removal Act (1830)', '4.13:Indian removal and cotton land'] },
  { id: 'trail', label: 'Trail of Tears', when: '1838', year: 1838, theme: 'politics', terms: ['4.8:Trail of Tears (1838)'] },
  { id: 'missouri', label: 'Missouri Crisis & Compromise', when: '1819–1820', year: 1819, theme: 'politics', terms: ['4.3:Missouri Crisis (1819–1820)', '4.3:Missouri Compromise (1820)', '4.3:36°30′ line'] },
  { id: 'sectionalism', label: 'Sectionalism', when: '1820s–1840s', year: 1821, theme: 'politics', terms: ['4.1:Sectionalism', '4.3:Balance of free and slave states', '4.3:"Fire bell"'] },
  { id: 'impressment', label: 'Impressment & the Chesapeake', when: '1803–1807', year: 1806, theme: 'politics', terms: ['4.4:Impressment', '4.4:USS Chesapeake (1807)'] },
  { id: 'embargo', label: 'Embargo Act', when: '1807', year: 1807, theme: 'politics', terms: ['4.4:Embargo Act of 1807', '4.4:Peaceable coercion'] },
  { id: 'tecumseh', label: "Tecumseh's confederacy", when: '1811', year: 1811, theme: 'politics', terms: ['4.4:Tecumseh', '4.4:Tenskwatawa ("the Prophet")', '4.4:Battle of Tippecanoe (1811)'] },
  { id: 'war1812', label: 'War of 1812', when: '1812–1815', year: 1812, theme: 'politics', terms: ['4.4:War of 1812', '4.4:War Hawks'] },
  { id: 'hartford', label: 'Hartford Convention', when: '1814', year: 1814, theme: 'politics', terms: ['4.4:Hartford Convention (1814)'] },
  { id: 'fedDeath', label: 'Federalists collapse', when: '1816', year: 1816, theme: 'politics', terms: ['4.2:Death of the Federalist Party', '4.2:Rufus King'] },
  { id: 'creekCession', label: 'Creek War & land cession', when: '1814', year: 1814, theme: 'politics', terms: ['4.4:Red Sticks / Creek civil war', '4.4:Battle of Horseshoe Bend (1814)', '4.4:Treaty of Fort Jackson'] },
  { id: 'nationalism', label: 'Nationalism & American System', when: '1815–1817', year: 1816, theme: 'politics', terms: ['4.3:American nationalism', '4.3:American System', '4.3:Internal improvements'] },
  { id: 'transport', label: 'Transportation revolution', when: '1811–1840', year: 1825, theme: 'economy', terms: ['4.1:Transportation Revolution', '4.5:Erie Canal (1825)', '4.5:National Road'] },
  { id: 'marketRev', label: 'Market revolution', when: '1810s–1840s', year: 1820, theme: 'economy', terms: ['4.1:Market revolution', '4.5:Wage labor / cash economy'] },
  { id: 'lowell', label: 'Factory system (Waltham-Lowell)', when: '1813–1830s', year: 1821, theme: 'economy', terms: ['4.5:Waltham-Lowell System', '4.5:Lowell, Massachusetts (1821)', '4.6:"Mill girls"'] },
  { id: 'labor', label: 'Workers organize', when: '1834–1842', year: 1834, theme: 'economy', terms: ['4.6:Lowell "turnouts" (1834, 1836)', '4.6:Ten-Hour Movement', '4.6:Commonwealth v. Hunt (1842)'] },
  { id: 'spheres', label: 'Middle class & separate spheres', when: '1820s–1840s', year: 1825, theme: 'economy', terms: ['4.6:New middle class', '4.6:Separate spheres', '4.6:Cult of Domesticity / True Womanhood'] },
  { id: 'panic1819', label: 'Panic of 1819', when: '1819', year: 1819, theme: 'economy', terms: ['4.3:Panic of 1819'] },
  { id: 'bankWar', label: 'Bank War', when: '1832–1833', year: 1832, theme: 'politics', terms: ['4.8:Bank War', '4.8:Bank veto (July 1832)', '4.8:Pet banks (1833)'] },
  { id: 'panic1837', label: 'Specie Circular & Panic of 1837', when: '1836–1837', year: 1837, theme: 'economy', terms: ['4.8:Speculative boom (1834–1836)', '4.8:Specie Circular (July 1836)', '4.8:Panic of 1837'] },
  { id: 'whigs', label: 'Whigs win in 1840', when: '1834–1840', year: 1840, theme: 'politics', terms: ['4.7:Whig Party', '4.7:Election of 1840', '4.8:"King Andrew the First"'] },
  { id: 'democratization', label: 'Democratization', when: '1810s–1830s', year: 1821, theme: 'politics', terms: ['4.1:Democratization', '4.7:Lowered property requirements', '4.2:Property qualifications'] },
  { id: 'bargain', label: '"Corrupt bargain" of 1824', when: '1824', year: 1824, theme: 'politics', terms: ['4.7:Election of 1824', '4.7:"Corrupt bargain"'] },
  { id: 'jackson', label: 'Jackson & the Democrats win', when: '1828', year: 1828, theme: 'politics', terms: ['4.7:Election of 1828', '4.7:Democratic Party', '4.7:"Old Hickory" / frontier image'] },
  { id: 'tariff1828', label: 'Tariff of Abominations', when: '1828', year: 1828, theme: 'politics', terms: ['4.8:Tariff of 1828 ("Tariff of Abominations")', '4.8:South Carolina Exposition and Protest'] },
  { id: 'vesey', label: 'Fear of slave rebellion', when: '1822', year: 1822, theme: 'politics', terms: ['4.8:Denmark Vesey conspiracy', '4.12:Denmark Vesey'] },
  { id: 'nullification', label: 'Nullification Crisis', when: '1832–1833', year: 1832, theme: 'politics', terms: ['4.8:Nullification', '4.8:Tariff of 1832 / Ordinance of Nullification', '4.8:Force Bill', '4.8:Compromise tariff'] },
  { id: 'sga', label: 'Second Great Awakening', when: '1801–1840s', year: 1801, theme: 'culture', terms: ['4.10:Second Great Awakening', '4.10:Perfectionism', '4.10:Postmillennialism'] },
  { id: 'reform', label: 'Benevolent empire', when: '1815–1861', year: 1826, theme: 'culture', terms: ['4.11:Benevolent empire (1815–1861)', '4.11:Temperance movement', '4.11:Voluntary associations'] },
  { id: 'forten', label: 'Black abolitionist writing', when: '1813–1829', year: 1813, theme: 'culture', terms: ['4.12:James Forten / Letters from a Man of Colour (1813)', '4.12:David Walker / Appeal (1829)'] },
  { id: 'printing', label: 'Cheap print & lyceums', when: '1830s', year: 1830, theme: 'culture', terms: ['4.9:Printing technology (1830s)', '4.9:Lyceum', '4.9:Slave narratives'] },
  { id: 'abolition', label: 'Immediate abolition', when: '1831–1833', year: 1831, theme: 'culture', terms: ['4.11:Immediatism', '4.11:William Lloyd Garrison / The Liberator (1831)', '4.11:American Anti-Slavery Society (1833)'] },
  { id: 'gag', label: 'Gag rule', when: '1836', year: 1836, theme: 'politics', terms: ['4.11:Great Petition Campaign (1836)', '4.11:Gag rule (1836)'] },
  { id: 'womens', label: "Women's rights & Seneca Falls", when: '1840–1848', year: 1848, theme: 'culture', terms: ['4.11:World Anti-Slavery Convention (London, 1840)', '4.11:Seneca Falls Convention (1848)', '4.11:Declaration of Sentiments'] },
  { id: 'immigration', label: 'Mass immigration', when: '1820–1860', year: 1845, theme: 'economy', terms: ['4.6:Immigration (1820–1860)', '4.6:Irish Famine', '4.1:European migration'] },
  { id: 'nativism', label: 'Nativism', when: '1834–1850s', year: 1834, theme: 'culture', terms: ['4.6:Nativism', '4.6:Convent attack near Boston (1834)', '4.6:Know-Nothings (American Party)'] },
];

export const CAUSE_LINKS: CauseLink[] = [
  { from: 'haiti', to: 'louisiana', why: 'Having lost Haiti to revolt and yellow fever, Napoleon sold Louisiana.' },
  { from: 'louisiana', to: 'missouri', why: 'Missouri came from the Louisiana Purchase, so its statehood forced the question of slavery in that territory.' },
  { from: 'cottonGin', to: 'cottonBoom', why: 'The gin made short-staple cotton profitable, so cotton planting spread inland.' },
  { from: 'cottonBoom', to: 'slaveTrade', why: 'Cotton in the Lower South drove demand for enslaved labor; the Upper South sold enslaved people south.' },
  { from: 'cottonBoom', to: 'removal', why: 'Planters wanted Native land; removal opened cheap Delta land for auction.' },
  { from: 'removal', to: 'trail', why: 'The 1830 act set up the forced removal of the Cherokee in 1838.' },
  { from: 'cottonBoom', to: 'missouri', why: "Slavery's westward spread raised the question of whether new states would be slave or free." },
  { from: 'missouri', to: 'sectionalism', why: 'Sectional voting on the Tallmadge Amendment showed that slavery could split the Union; Jefferson heard a "fire bell."' },
  { from: 'cottonBoom', to: 'lowell', why: 'Northern mills ran on cotton grown by enslaved people.' },
  { from: 'impressment', to: 'embargo', why: 'Jefferson answered impressment and the Chesapeake attack with peaceable coercion instead of war.' },
  { from: 'embargo', to: 'war1812', why: 'Economic pressure failed to stop British abuses, and trade disputes helped lead to war.' },
  { from: 'impressment', to: 'war1812', why: 'Impressment was a central grievance: "Free Trade and Sailors\' Rights!"' },
  { from: 'tecumseh', to: 'war1812', why: 'Conflict in the Old Northwest was one of the causes Congress went to war over.' },
  { from: 'war1812', to: 'hartford', why: 'New England Federalists who opposed the war met at Hartford.' },
  { from: 'hartford', to: 'fedDeath', why: 'The convention looked disloyal; with Monroe’s win, it finished the Federalist Party.' },
  { from: 'war1812', to: 'nationalism', why: 'Gallatin said the war revived "national feelings."' },
  { from: 'war1812', to: 'creekCession', why: "The war merged with a Creek civil war; Jackson's victory at Horseshoe Bend forced a huge land cession." },
  { from: 'creekCession', to: 'cottonBoom', why: "The Treaty of Fort Jackson opened Creek land for slavery's expansion." },
  { from: 'war1812', to: 'jackson', why: 'The Battle of New Orleans made Jackson the "Hero of New Orleans."' },
  { from: 'nationalism', to: 'transport', why: 'The American System promised federally backed roads and canals.' },
  { from: 'transport', to: 'marketRev', why: 'Roads, canals and railroads opened the West to commerce and tied regions into national markets.' },
  { from: 'marketRev', to: 'lowell', why: 'Production moved from the household to the factory.' },
  { from: 'lowell', to: 'labor', why: 'Wage cuts sparked the Lowell turnouts, and workers campaigned for a ten-hour day.' },
  { from: 'marketRev', to: 'spheres', why: 'As paid work left the home, a new middle class embraced separate spheres.' },
  { from: 'spheres', to: 'reform', why: 'Middle-class women took leading roles in moral reform.' },
  { from: 'marketRev', to: 'panic1819', why: 'Market-driven booms produced recurring panics.' },
  { from: 'panic1819', to: 'bankWar', why: "The 1819 depression was blamed on the Bank, feeding the distrust behind Jackson's war on it." },
  { from: 'bankWar', to: 'panic1837', why: 'Deposits moved to pet banks, easy credit fed a speculative boom, and the Specie Circular burst it.' },
  { from: 'bankWar', to: 'whigs', why: 'Opponents of "King Andrew the First" united as the Whigs.' },
  { from: 'panic1837', to: 'whigs', why: 'A depression that lasted to 1843 hurt Van Buren and helped the Whigs win in 1840.' },
  { from: 'democratization', to: 'jackson', why: 'With property requirements falling, newly enfranchised white men voted in mass campaigns.' },
  { from: 'bargain', to: 'jackson', why: "Jackson's backers used the \"corrupt bargain\" charge and built the Democratic Party to win in 1828." },
  { from: 'jackson', to: 'bankWar', why: 'As president, Jackson declared a "war to the death" on the Bank.' },
  { from: 'jackson', to: 'removal', why: 'Jackson pushed Native removal.' },
  { from: 'tariff1828', to: 'nullification', why: "South Carolina's Exposition and Protest argued that states could nullify the tariff." },
  { from: 'vesey', to: 'nullification', why: "Fear of rebellion made South Carolina's white leaders hostile to federal power." },
  { from: 'nullification', to: 'sectionalism', why: "The linked ideas of states' rights and secession grew out of the crisis." },
  { from: 'sga', to: 'reform', why: 'Revival optimism (perfectionism, postmillennialism) drove reform.' },
  { from: 'sga', to: 'abolition', why: 'Evangelical conscience fed immediatism and moral suasion.' },
  { from: 'forten', to: 'abolition', why: "Forten's writing changed Garrison's views; Walker's Appeal called for resistance." },
  { from: 'printing', to: 'abolition', why: 'Cheaper print widened audiences for reform literature, and lyceums carried antislavery speakers.' },
  { from: 'abolition', to: 'gag', why: 'Abolitionists flooded Congress with petitions; the House refused to discuss them.' },
  { from: 'abolition', to: 'womens', why: 'Women abolitionists refused seats in London in 1840 launched the women’s rights movement.' },
  { from: 'immigration', to: 'nativism', why: 'Hostility toward Catholic and immigrant newcomers grew into nativism.' },
];

/** Nodes about removal, slavery and violence: chains that use them never trigger celebratory effects. */
export const SOLEMN_NODES = new Set(['removal', 'trail', 'slaveTrade', 'creekCession', 'vesey']);

export const EXPERT_CHAINS: ExpertChain[] = [
  {
    id: 'cotton-removal',
    title: 'Cotton and removal',
    prompt: 'Show how the cotton gin led, step by step, to the Trail of Tears.',
    nodes: ['cottonGin', 'cottonBoom', 'removal', 'trail'],
    decoys: ['lowell', 'embargo', 'missouri'],
  },
  {
    id: 'cotton-union',
    title: 'Cotton and the Union',
    prompt: 'Connect the cotton gin to the sectional crisis that Jefferson called a "fire bell in the night."',
    nodes: ['cottonGin', 'cottonBoom', 'missouri', 'sectionalism'],
    decoys: ['transport', 'tariff1828', 'abolition'],
  },
  {
    id: 'haiti-missouri',
    title: 'From Haiti to Missouri',
    prompt: 'Trace how a revolution in Haiti ended up shaping the Missouri Compromise and sectional politics.',
    nodes: ['haiti', 'louisiana', 'missouri', 'sectionalism'],
    decoys: ['embargo', 'war1812', 'vesey'],
  },
  {
    id: 'road-1812',
    title: 'The road to 1812',
    prompt: 'Explain how British impressment ended up destroying the Federalist Party.',
    nodes: ['impressment', 'embargo', 'war1812', 'hartford', 'fedDeath'],
    decoys: ['louisiana', 'nationalism', 'bankWar'],
  },
  {
    id: 'war-market',
    title: 'War builds a market',
    prompt: 'Show how the War of 1812 helped build the factory system.',
    nodes: ['war1812', 'nationalism', 'transport', 'marketRev', 'lowell'],
    decoys: ['embargo', 'cottonGin', 'whigs'],
  },
  {
    id: 'bank',
    title: "Jackson's Bank War",
    prompt: 'Connect the Panic of 1819 to the Whig victory of 1840.',
    nodes: ['panic1819', 'bankWar', 'panic1837', 'whigs'],
    decoys: ['tariff1828', 'nullification', 'transport'],
  },
  {
    id: 'nullify',
    title: 'The Nullification Crisis',
    prompt: 'Trace how a tariff became a constitutional crisis that deepened sectionalism.',
    nodes: ['tariff1828', 'nullification', 'sectionalism'],
    decoys: ['bankWar', 'panic1819', 'labor'],
  },
  {
    id: 'revival-rights',
    title: "From revival to women's rights",
    prompt: 'Connect the Second Great Awakening to the Seneca Falls Convention.',
    nodes: ['sga', 'abolition', 'womens'],
    decoys: ['nativism', 'labor', 'gag'],
  },
];

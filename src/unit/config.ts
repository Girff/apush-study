/**
 * Unit configuration. Everything specific to "Period 4" that is NOT a term,
 * definition or citation lives here or in the other files in `src/unit/`.
 * To reuse the site for another unit, swap the JSON and edit these files
 * (see README → "Swapping in a new unit").
 */
import rawUnit from '../data/apush-unit4-terms.json';
import type { MotifId, Theme, ThemeId } from '../lib/types';

export const UNIT = {
  id: 'apush-unit4',
  /** localStorage key. Change it for a new unit so progress never collides. */
  storageKey: 'period4.progress.v1',
  title: 'Period 4',
  subtitle: '1800–1848',
  course: 'AP U.S. History · Unit 4',
  source: 'The American Yawp, chapters 7–11',
  sourceUrl: 'https://www.americanyawp.com/',
  startYear: 1800,
  endYear: 1848,
  expectedTermCount: 361,
  expectedTopicCount: 13,
  raw: rawUnit as unknown,
} as const;

export const THEMES: Theme[] = [
  {
    id: 'prologue',
    label: 'Prologue',
    short: 'Prologue',
    blurb: 'The big forces of the period, all in one room.',
    colorVar: '--ink-soft',
  },
  {
    id: 'politics',
    label: 'Politics & Power',
    short: 'Politics',
    blurb: 'Parties, presidents, wars, compromises and the fight over who gets to vote.',
    colorVar: '--oxblood',
  },
  {
    id: 'economy',
    label: 'Economy & Society',
    short: 'Economy',
    blurb: 'Canals, mills and cotton, and the people whose labor powered them.',
    colorVar: '--teal',
  },
  {
    id: 'culture',
    label: 'Religion, Reform & Culture',
    short: 'Culture',
    blurb: 'Revivals, reformers and a new American voice in print.',
    colorVar: '--brass',
  },
];

export const TOPIC_THEME: Record<string, ThemeId> = {
  '4.1': 'prologue',
  '4.2': 'politics',
  '4.3': 'politics',
  '4.4': 'politics',
  '4.5': 'economy',
  '4.6': 'economy',
  '4.7': 'politics',
  '4.8': 'politics',
  '4.9': 'culture',
  '4.10': 'culture',
  '4.11': 'culture',
  '4.12': 'economy',
  '4.13': 'economy',
};

export const TOPIC_MOTIF: Record<string, MotifId> = {
  '4.1': 'compass',
  '4.2': 'broadside',
  '4.3': 'scales',
  '4.4': 'ship',
  '4.5': 'canal',
  '4.6': 'loom',
  '4.7': 'ballot',
  '4.8': 'bank',
  '4.9': 'press',
  '4.10': 'tent',
  '4.11': 'petition',
  '4.12': 'church',
  '4.13': 'cotton',
};

/** Short labels for compact UI (chips, heatmap tiles). */
export const TOPIC_SHORT: Record<string, string> = {
  '4.1': 'Context',
  '4.2': 'Jefferson',
  '4.3': 'Regions',
  '4.4': 'World Stage',
  '4.5': 'Industry',
  '4.6': 'Society',
  '4.7': 'Democracy',
  '4.8': 'Jackson',
  '4.9': 'Culture',
  '4.10': 'Awakening',
  '4.11': 'Reform',
  '4.12': 'Black America',
  '4.13': 'The South',
};

/**
 * Terms about slavery, removal and violence. The app never pairs these with
 * celebratory feedback: correct answers get a plain "Correct." with no XP
 * flourish. Listed as [topicId, exact term string] and checked by the tests.
 */
export const SOLEMN_TERMS: Array<[string, string]> = [
  ['4.2', 'James Callender / Sally Hemings'],
  ['4.4', 'Impressment'],
  ['4.4', 'Battle of Fallen Timbers (1794) / Treaty of Greenville (1795)'],
  ['4.4', 'Battle of Tippecanoe (1811)'],
  ['4.4', 'Burning of Washington (Aug. 24, 1814)'],
  ['4.4', 'Red Sticks / Creek civil war'],
  ['4.4', 'Battle of Horseshoe Bend (1814)'],
  ['4.4', 'Treaty of Fort Jackson'],
  ['4.4', "Tecumseh's death (1813)"],
  ['4.4', '"Negro Fort" (1816)'],
  ['4.4', 'First Seminole War (1818)'],
  ['4.6', 'Irish Famine'],
  ['4.6', 'Convent attack near Boston (1834)'],
  ['4.7', 'Pennsylvania constitution of 1838'],
  ['4.7', 'Black disfranchisement'],
  ['4.8', 'Andrew Jackson (1767–1845)'],
  ['4.8', 'Denmark Vesey conspiracy'],
  ['4.8', 'Calhoun\'s "peculiar domestick institution"'],
  ['4.8', 'Indian Removal Act (1830)'],
  ['4.8', 'Trail of Tears (1838)'],
  ['4.9', '"Bobalition" broadsides'],
  ['4.9', 'Thomas Dartmouth Rice / "Jim Crow"'],
  ['4.10', "Smith's murder (1844)"],
  ['4.11', 'Elijah Lovejoy'],
  ['4.11', 'Pennsylvania Hall (1838)'],
  ['4.11', 'Anti-abolition riot in Philadelphia'],
  ['4.12', "Gabriel's Rebellion (1800)"],
  ['4.12', 'Restrictions on free people of color'],
  ['4.12', 'Henry Moss'],
  ['4.12', 'Enlightenment racial classification'],
  ['4.12', "Jefferson's Notes on the State of Virginia"],
  ['4.12', 'Polygenesis'],
  ['4.12', 'Indenture of freed children'],
  ['4.12', "Slavery's slow end in the North"],
  ['4.12', '"Negro Fort" (1816)'],
  ['4.12', 'Denmark Vesey'],
  ['4.13', 'Indian removal and cotton land'],
  ['4.13', 'Enslaved people as collateral'],
  ['4.13', 'Interregional slave trade'],
  ['4.13', 'Upper South vs. Lower South'],
  ['4.13', 'New Orleans slave market (St. Louis Exchange)'],
  ['4.13', '"Prime field hands"'],
  ['4.13', 'Proslavery ideology'],
  ['4.13', 'Enslaved population (1860)'],
  ['4.13', '"Downriver"'],
  ['4.13', 'Harriet Jacobs / Incidents in the Life of a Slave Girl'],
  ['4.13', 'Celia (1855)'],
  ['4.13', 'Southern womanhood / female purity'],
  ['4.13', 'Curse of Ham'],
  ['4.13', 'Anti-literacy laws'],
  ['4.13', "Nat Turner's Rebellion (Aug. 1831)"],
  ['4.13', 'Repression after Turner'],
  ['4.13', 'Dueling'],
  ['4.13', 'Rough-and-tumble fighting'],
];

/**
 * Pairs whose definitions are close enough that one would be an unfair
 * distractor for the other in a multiple-choice question.
 */
export const CONFUSABLE_PAIRS: Array<[string, string, string]> = [
  ['4.4', '"Free Trade and Sailors\' Rights!"', '"Don\'t give up the ship!"'],
  ['4.4', 'Lake Champlain / Plattsburgh (1814)', 'USS Constitution ("Old Ironsides")'],
  ['4.6', 'Separate spheres', 'Cult of Domesticity / True Womanhood'],
  ['4.6', "Boston Carpenters' Union (1825)", 'Federal Society of Journeymen Cordwainers'],
  ['4.7', '"Log cabin and hard cider"', '"Tippecanoe and Tyler Too"'],
  ['4.8', 'Tariff of 1832 / Ordinance of Nullification', 'Nullification'],
  ['4.8', "States' rights / secession", 'Compact theory'],
  ['4.9', 'Ralph Waldo Emerson', 'Transcendentalism'],
  ['4.10', 'Seventh-Day Adventist Church', 'Joseph Smith / Book of Mormon (1830)'],
  ['4.10', 'Seventh-Day Adventist Church', 'Alexander Campbell / Barton Stone'],
  ['4.11', 'American Temperance Society (1826)', 'Cold Water Army'],
  ['4.11', 'Pennsylvania Hall (1838)', 'Anti-abolition riot in Philadelphia'],
  ['4.11', 'Emma Willard / Troy Female Seminary', 'Mary Lyon / Mount Holyoke'],
  ['4.11', 'Mary Lyon / Mount Holyoke', 'Catharine Beecher / Hartford Female Seminary'],
  ['4.11', 'Emma Willard / Troy Female Seminary', 'Catharine Beecher / Hartford Female Seminary'],
  ['4.11', 'Arthur and Lewis Tappan', 'Theodore Dwight Weld'],
  ['4.12', 'Frederick Douglass', 'Sojourner Truth'],
];

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  /** Solemn badges are awarded quietly: no stamp animation, no fanfare. */
  solemn?: boolean;
  topicId?: string;
}

export const TOPIC_BADGES: BadgeDef[] = [
  { id: 'topic-4.1', topicId: '4.1', name: 'Surveyor of the Period', description: 'Reach 70% mastery in 4.1.' },
  { id: 'topic-4.2', topicId: '4.2', name: 'Party Pamphleteer', description: 'Reach 70% mastery in 4.2.' },
  { id: 'topic-4.3', topicId: '4.3', name: 'Senate Clerk', description: 'Reach 70% mastery in 4.3.' },
  { id: 'topic-4.4', topicId: '4.4', name: 'Envoy Extraordinary', description: 'Reach 70% mastery in 4.4.' },
  { id: 'topic-4.5', topicId: '4.5', name: 'Canal Engineer', description: 'Reach 70% mastery in 4.5.' },
  { id: 'topic-4.6', topicId: '4.6', name: 'Ten-Hour Petitioner', description: 'Reach 70% mastery in 4.6.' },
  { id: 'topic-4.7', topicId: '4.7', name: 'Stump Speaker', description: 'Reach 70% mastery in 4.7.' },
  { id: 'topic-4.8', topicId: '4.8', name: 'Constitutional Scholar', description: 'Reach 70% mastery in 4.8.', solemn: true },
  { id: 'topic-4.9', topicId: '4.9', name: 'Lyceum Lecturer', description: 'Reach 70% mastery in 4.9.' },
  { id: 'topic-4.10', topicId: '4.10', name: 'Circuit Rider', description: 'Reach 70% mastery in 4.10.' },
  { id: 'topic-4.11', topicId: '4.11', name: 'Reform Society Secretary', description: 'Reach 70% mastery in 4.11.' },
  { id: 'topic-4.12', topicId: '4.12', name: 'Keeper of the Record', description: 'Reach 70% mastery in 4.12.', solemn: true },
  { id: 'topic-4.13', topicId: '4.13', name: 'Bearer of Witness', description: 'Reach 70% mastery in 4.13.', solemn: true },
];

export const GENERAL_BADGES: BadgeDef[] = [
  { id: 'xp-50', name: 'Apprentice Printer', description: 'Earn your first 50 XP.' },
  { id: 'xp-500', name: 'Journeyman', description: 'Earn 500 XP.' },
  { id: 'xp-2000', name: 'Master Printer', description: 'Earn 2,000 XP.' },
  { id: 'streak-3', name: 'Almanac Keeper', description: 'Study three days in a row.' },
  { id: 'streak-7', name: 'Post Rider', description: 'Study seven days in a row.' },
  { id: 'story-all', name: 'Exhibit Docent', description: 'Finish all 13 Story Mode chapters.' },
  { id: 'quiz-perfect', name: 'Valedictorian', description: 'Score 100% on a quiz of 10 or more questions.' },
  { id: 'chain-builder', name: 'Chain of Causes', description: 'Score 80% or better on a Build-a-Chain challenge.' },
  { id: 'saq-first', name: 'Essayist', description: 'Self-grade your first SAQ.' },
  { id: 'reviews-100', name: 'Copyist', description: 'Complete 100 flashcard reviews.' },
];

export const ALL_BADGES: BadgeDef[] = [...TOPIC_BADGES, ...GENERAL_BADGES];

/** Mastery needed for a topic badge. */
export const TOPIC_BADGE_THRESHOLD = 0.7;

/**
 * Map Room content. Base state outlines come from us-atlas (U.S. Census
 * cartographic boundaries). Historical overlays below are hand-plotted in
 * longitude/latitude and are APPROXIMATE; CONTENT_NOTES.md lists each one.
 */
export type LayerId = 'borders' | 'louisiana' | 'adamsonis' | 'missouri' | 'removal' | 'canals' | 'roads' | 'cotton' | 'events';

export interface MapLayer {
  id: LayerId;
  label: string;
  color: string;
  swatch: 'fill' | 'line' | 'dash' | 'dots' | 'hatch' | 'point';
}

export const MAP_LAYERS: MapLayer[] = [
  { id: 'borders', label: 'U.S. territory & statehood', color: 'var(--ink-soft)', swatch: 'fill' },
  { id: 'louisiana', label: 'Louisiana Purchase (1803)', color: 'var(--viz-economy)', swatch: 'fill' },
  { id: 'adamsonis', label: 'Adams-Onís Treaty (1819)', color: 'var(--viz-politics)', swatch: 'fill' },
  { id: 'missouri', label: 'Missouri Compromise & 36°30′ (1820)', color: 'var(--viz-politics)', swatch: 'line' },
  { id: 'removal', label: 'Indian removal & Trail of Tears', color: 'var(--ink)', swatch: 'dash' },
  { id: 'canals', label: 'Erie Canal & Ohio canals', color: 'var(--viz-economy)', swatch: 'line' },
  { id: 'roads', label: 'National Road', color: 'var(--viz-culture)', swatch: 'line' },
  { id: 'cotton', label: 'Cotton Belt', color: 'var(--viz-culture)', swatch: 'dots' },
  { id: 'events', label: 'Events', color: 'var(--ink)', swatch: 'point' },
];

/** Year each (modern-outline) state entered the Union. WV and ME are shaded with VA and MA before they split. */
export const STATEHOOD: Record<string, number> = {
  '10': 1787, '42': 1787, '34': 1787, '13': 1788, '09': 1788, '25': 1788, '24': 1788, '45': 1788, '33': 1788,
  '51': 1788, '36': 1788, '37': 1789, '44': 1790, '50': 1791, '21': 1792, '47': 1796, '39': 1803, '22': 1812,
  '18': 1816, '28': 1817, '17': 1818, '01': 1819, '23': 1788, '29': 1821, '05': 1836, '26': 1837, '12': 1845,
  '19': 1846, '55': 1848, '54': 1788, '11': 1790,
};

/** Modern states that lay (roughly) inside U.S. territory in 1800, east of the Mississippi. */
export const US_1800: string[] = ['09', '10', '11', '13', '17', '18', '21', '23', '24', '25', '26', '28', '01', '33', '34', '36', '37', '39', '42', '44', '45', '47', '50', '51', '54', '55'];

type LngLat = [number, number];

export interface MapFeature {
  id: string;
  layer: LayerId;
  title: string;
  when: string;
  from: number;
  until?: number;
  desc: string;
  terms: string[];
  polygon?: LngLat[];
  line?: LngLat[];
  dashed?: boolean;
  states?: string[];
  point?: LngLat;
  /** Where to print the label, if different from the shape's centre. */
  labelAt?: LngLat;
  /** Sensitive features never animate in. */
  solemn?: boolean;
}

const MISSISSIPPI: LngLat[] = [
  [-89.25, 29.15], [-90.07, 29.95], [-91.19, 30.45], [-91.4, 31.56], [-90.88, 32.35], [-91.06, 33.41], [-90.59, 34.53],
  [-90.05, 35.15], [-89.53, 36.59], [-89.18, 37.0], [-89.52, 37.31], [-90.19, 38.63], [-91.36, 39.71], [-91.11, 40.81],
  [-90.58, 41.52], [-90.66, 42.5], [-91.25, 43.8], [-92.53, 44.56], [-93.26, 44.98], [-94.16, 45.56], [-94.2, 46.36], [-95.21, 47.24],
];

// Sabine River → Red River → 100th meridian → Arkansas River → its source (the 1819 line).
const SOUTHWEST: LngLat[] = [
  [-93.84, 29.69], [-93.7, 30.5], [-93.55, 31.2], [-94.04, 32.0], [-94.04, 33.55], [-94.5, 33.65], [-95.5, 33.88],
  [-96.5, 33.82], [-97.5, 33.9], [-98.5, 34.12], [-99.5, 34.38], [-100.0, 34.56], [-100.0, 37.75], [-101.0, 37.95],
  [-102.0, 38.05], [-103.0, 38.05], [-104.0, 38.2], [-104.6, 38.27], [-105.24, 38.44], [-106.0, 38.85], [-106.3, 39.25],
];

// Continental Divide, roughly, from the Arkansas headwaters to the 49th parallel.
const DIVIDE: LngLat[] = [
  [-106.05, 39.36], [-105.7, 40.3], [-106.6, 40.6], [-107.3, 41.8], [-108.9, 42.35], [-109.6, 43.1], [-110.5, 44.4],
  [-112.4, 44.6], [-112.5, 45.9], [-112.4, 47.1], [-113.3, 48.3], [-114.06, 49.0],
];

const GULF: LngLat[] = [[-93.0, 29.72], [-92.0, 29.55], [-91.2, 29.2], [-90.4, 29.08]];

export const LOUISIANA_RING: LngLat[] = [
  ...MISSISSIPPI,
  [-95.15, 49.0],
  ...DIVIDE.slice().reverse(),
  ...SOUTHWEST.slice().reverse(),
  ...GULF,
  MISSISSIPPI[0],
];

const INDIAN_TERRITORY: LngLat[] = [
  [-94.62, 37.0], [-100.0, 37.0], [-100.0, 34.56], [-99.5, 34.38], [-98.5, 34.12], [-97.5, 33.9], [-96.5, 33.82],
  [-95.5, 33.88], [-94.48, 33.64], [-94.43, 35.39], [-94.62, 36.5], [-94.62, 37.0],
];

export const MAP_FEATURES: MapFeature[] = [
  {
    id: 'louisiana',
    layer: 'louisiana',
    title: 'Louisiana Purchase',
    when: '1803',
    from: 1803,
    desc: 'Bought from France for $15 million, doubling the nation’s size. Western farmers needed the port of New Orleans; Napoleon sold all of Louisiana after losing Haiti. Edges are approximate, with the southwest border as fixed in 1819.',
    terms: ['4.4:Louisiana Purchase (1803)', '4.4:Napoleon Bonaparte / Talleyrand', '4.4:Robert R. Livingston', '4.4:Constitutionality of the Purchase'],
    polygon: LOUISIANA_RING,
    labelAt: [-99.5, 43.2],
  },
  {
    id: 'florida',
    layer: 'adamsonis',
    title: 'Florida ceded by Spain',
    when: '1819',
    from: 1819,
    desc: 'After Jackson invaded Spanish Florida in the First Seminole War (1818), Spain ceded Florida in the Adams-Onís Treaty. The modern state outline stands in for the ceded land.',
    terms: ['4.4:Adams-Onís Treaty (1819)', '4.4:John Quincy Adams', '4.4:First Seminole War (1818)'],
    states: ['12'],
    labelAt: [-81.6, 28.4],
  },
  {
    id: 'adamsonis-line',
    layer: 'adamsonis',
    title: 'Adams-Onís boundary',
    when: '1819',
    from: 1819,
    desc: 'The same treaty fixed the border with Spain’s empire: up the Sabine and Red rivers, along the 100th meridian and the Arkansas River, then west along the 42nd parallel to the Pacific.',
    terms: ['4.4:Adams-Onís Treaty (1819)', '4.4:John Quincy Adams'],
    line: [...SOUTHWEST, [-106.3, 42.0], [-124.2, 42.0]],
    dashed: true,
    labelAt: [-116, 42.6],
  },
  {
    id: 'missouri-state',
    layer: 'missouri',
    title: 'Missouri: a slave state',
    when: '1820–1821',
    from: 1820,
    desc: 'Missouri’s bid to enter as a slave state set off the Missouri Crisis. Under the compromise it entered as a slave state (statehood 1821).',
    terms: ['4.3:Missouri Crisis (1819–1820)', '4.3:Missouri Compromise (1820)', '4.3:James Tallmadge / Tallmadge Amendment', '4.3:Jesse Thomas'],
    states: ['29'],
    labelAt: [-93.1, 38.95],
  },
  {
    id: 'maine',
    layer: 'missouri',
    title: 'Maine: a free state',
    when: '1820',
    from: 1820,
    desc: 'Maine, formerly part of Massachusetts, entered as a free state, keeping the balance of free and slave states in the Senate.',
    terms: ['4.3:Missouri Compromise (1820)', '4.3:Balance of free and slave states'],
    states: ['23'],
    labelAt: [-69.2, 45.4],
  },
  {
    id: 'line-3630',
    layer: 'missouri',
    title: '36°30′ line',
    when: '1820',
    from: 1820,
    desc: 'Slavery was banned north of this latitude in the rest of the Louisiana Purchase (Missouri excepted).',
    terms: ['4.3:36°30′ line', '4.3:"Fire bell"', '4.3:Sectional voting'],
    line: [[-94.62, 36.5], [-100.0, 36.5]],
    labelAt: [-97.4, 36.95],
  },
  {
    id: 'cherokee',
    layer: 'removal',
    title: 'Cherokee Nation',
    when: 'Until 1838',
    from: 1800,
    until: 1838,
    desc: 'The Cherokee Nation adopted a written language and a constitution. Georgia’s claims over its land reached the Supreme Court in Worcester v. Georgia (1832).',
    terms: ['4.8:Cherokee Nation', '4.8:Worcester v. Georgia (1832)', '4.8:Jeremiah Evarts ("William Penn")'],
    point: [-84.7, 34.7],
    solemn: true,
  },
  {
    id: 'indian-territory',
    layer: 'removal',
    title: 'Land set aside for removed nations',
    when: '1830',
    from: 1830,
    desc: 'The Indian Removal Act (1830) forced relocation west of the Mississippi and auctioned Native land in the Southeast. Boundaries shown are approximate.',
    terms: ['4.8:Indian Removal Act (1830)', '4.13:Indian removal and cotton land', '4.1:Westward expansion'],
    polygon: INDIAN_TERRITORY,
    labelAt: [-97.5, 35.1],
    solemn: true,
  },
  {
    id: 'trail-land',
    layer: 'removal',
    title: 'Trail of Tears: overland route',
    when: '1838',
    from: 1838,
    desc: 'In 1838 the U.S. Army forced the Cherokee west. Thousands died on the way. This line traces the northern overland route, approximately.',
    terms: ['4.8:Trail of Tears (1838)', '4.8:Indian Removal Act (1830)'],
    line: [
      [-84.76, 35.29], [-85.77, 35.68], [-86.78, 36.16], [-87.49, 36.87], [-88.49, 37.37], [-89.27, 37.45], [-89.52, 37.31],
      [-91.77, 37.95], [-93.29, 37.21], [-94.16, 36.06], [-94.97, 35.91],
    ],
    dashed: true,
    labelAt: [-85.9, 37.55],
    solemn: true,
  },
  {
    id: 'trail-water',
    layer: 'removal',
    title: 'Trail of Tears: river route',
    when: '1838',
    from: 1838,
    desc: 'Other groups were forced west by boat along the Tennessee, Ohio, Mississippi and Arkansas rivers. Approximate route.',
    terms: ['4.8:Trail of Tears (1838)'],
    line: [
      [-85.31, 35.05], [-86.98, 34.6], [-87.7, 34.73], [-88.2, 35.5], [-88.3, 36.4], [-88.6, 37.08], [-89.18, 37.0],
      [-89.6, 35.9], [-90.4, 34.8], [-91.07, 33.78], [-92.29, 34.75], [-94.4, 35.39], [-95.25, 35.8],
    ],
    dashed: true,
    solemn: true,
  },
  {
    id: 'erie',
    layer: 'canals',
    title: 'Erie Canal',
    when: '1825',
    from: 1825,
    desc: 'Opened in 1825: 350 miles linking the Great Lakes and the Hudson River to the Atlantic. New York City became the nation’s largest, most important city.',
    terms: ['4.5:Erie Canal (1825)', '4.5:New York City', '4.1:Transportation Revolution'],
    line: [
      [-78.88, 42.89], [-78.69, 43.17], [-77.61, 43.16], [-77.0, 43.06], [-76.7, 43.01], [-76.15, 43.05], [-75.46, 43.21],
      [-75.23, 43.1], [-74.86, 43.04], [-73.94, 42.81], [-73.75, 42.65], [-73.95, 41.7], [-74.0, 40.72],
    ],
    labelAt: [-76.4, 43.75],
  },
  {
    id: 'ohio-canals',
    layer: 'canals',
    title: 'Ohio canals',
    when: 'By 1840',
    from: 1840,
    desc: 'By 1840, two all-water links ran from Lake Erie to the Ohio River.',
    terms: ['4.5:Ohio canals', '4.3:Internal improvements'],
    line: [[-81.69, 41.5], [-81.52, 41.08], [-81.86, 40.27], [-82.4, 40.06], [-82.98, 39.33], [-82.99, 38.73]],
  },
  {
    id: 'miami-canal',
    layer: 'canals',
    title: 'Ohio canals (western link)',
    when: 'By 1840',
    from: 1840,
    desc: 'The second Lake Erie–Ohio River link, through western Ohio.',
    terms: ['4.5:Ohio canals'],
    line: [[-83.54, 41.65], [-84.36, 41.28], [-84.24, 40.14], [-84.19, 39.76], [-84.51, 39.1]],
  },
  {
    id: 'national-road',
    layer: 'roads',
    title: 'National Road',
    when: 'Begun 1811',
    from: 1811,
    desc: 'The first federally funded interstate road, begun at Cumberland, Maryland. The dashed line shows its later westward extension, approximately.',
    terms: ['4.5:National Road', '4.3:Internal improvements', '4.5:Margaret Dwight / Frances Trollope'],
    line: [[-78.76, 39.65], [-79.72, 39.9], [-80.25, 40.17], [-80.72, 40.06]],
    labelAt: [-79.9, 39.35],
  },
  {
    id: 'national-road-west',
    layer: 'roads',
    title: 'National Road (westward extension)',
    when: 'Later decades',
    from: 1825,
    desc: 'Extended west through Ohio and Indiana toward Illinois. Route approximate.',
    terms: ['4.5:National Road'],
    line: [[-80.72, 40.06], [-82.01, 39.94], [-83.0, 39.96], [-83.81, 39.92], [-84.89, 39.83], [-86.16, 39.77], [-87.41, 39.47], [-89.09, 38.96]],
    dashed: true,
  },
  {
    id: 'cotton-sc-ga',
    layer: 'cotton',
    title: 'Cotton Belt: South Carolina & Georgia',
    when: 'By 1800',
    from: 1800,
    desc: 'Sea Island (long-staple) cotton grew along the coast; after the cotton gin, short-staple cotton spread inland.',
    terms: ['4.13:Long-staple vs. short-staple cotton', '4.5:Eli Whitney / cotton gin (1794)', '4.13:Cotton Belt / Black Belt'],
    states: ['45', '13'],
  },
  {
    id: 'cotton-west',
    layer: 'cotton',
    title: 'Cotton Belt spreads west',
    when: '1812–1835',
    from: 1812,
    desc: 'Shown as each state entered the Union (Louisiana 1812, Mississippi 1817, Alabama 1819). By 1835 the five main cotton states were SC, GA, AL, MS and LA, and cotton exports grew from 150,000 bales (1815) to 4.5 million (1859).',
    terms: ['4.13:Five main cotton states (1835)', '4.13:Cotton exports', '4.1:Cotton Revolution', '4.13:Interregional slave trade'],
    states: ['22', '28', '01'],
  },
  { id: 'ev-fallen', layer: 'events', title: 'Fallen Timbers', when: '1794', from: 1800, desc: 'Defeat of the Western Confederacy, followed by the Treaty of Greenville land cession (1795).', terms: ['4.4:Battle of Fallen Timbers (1794) / Treaty of Greenville (1795)', '4.4:Western Confederacy (1791–1795)'], point: [-83.7, 41.55], solemn: true },
  { id: 'ev-pawtucket', layer: 'events', title: 'Pawtucket mill', when: '1789', from: 1800, desc: 'Samuel Slater copied British yarn machines for a mill in Pawtucket, Rhode Island.', terms: ['4.5:Samuel Slater (1789)'], point: [-71.38, 41.88] },
  { id: 'ev-neworleans', layer: 'events', title: 'New Orleans', when: '1800–1848', from: 1800, desc: 'The port western farmers needed; site of Jackson’s January 1815 victory; later home to the nation’s largest slave market.', terms: ['4.4:New Orleans', '4.4:Battle of New Orleans (Jan. 1815)', '4.13:New Orleans slave market (St. Louis Exchange)'], point: [-90.07, 29.95] },
  { id: 'ev-gabriel', layer: 'events', title: 'Richmond: Gabriel’s plan', when: '1800', from: 1800, desc: 'A planned uprising of enslaved people against Richmond, foiled and punished.', terms: ["4.12:Gabriel's Rebellion (1800)", '4.12:Restrictions on free people of color'], point: [-77.43, 37.54], solemn: true },
  { id: 'ev-caneridge', layer: 'events', title: 'Cane Ridge', when: 'Aug. 1801', from: 1801, desc: 'One of the earliest and largest revivals of the Second Great Awakening, in Kentucky.', terms: ['4.10:Cane Ridge Revival (Aug. 1801)', '4.10:Camp meetings'], point: [-84.11, 38.21] },
  { id: 'ev-tippecanoe', layer: 'events', title: 'Prophetstown & Tippecanoe', when: '1811', from: 1811, desc: 'Harrison’s attack at Tippecanoe broke Tecumseh’s confederacy.', terms: ['4.4:Prophetstown', '4.4:Battle of Tippecanoe (1811)', '4.4:Tenskwatawa ("the Prophet")'], point: [-86.84, 40.51], solemn: true },
  { id: 'ev-moraviantown', layer: 'events', title: 'Moraviantown', when: '1813', from: 1813, desc: 'Tecumseh fell here, in Ontario, in 1813.', terms: ["4.4:Tecumseh's death (1813)", '4.4:Tecumseh'], point: [-81.87, 42.57], solemn: true },
  { id: 'ev-chesapeake', layer: 'events', title: 'Washington & Fort McHenry', when: '1814', from: 1814, desc: 'British troops burned Washington on Aug. 24, 1814; their bombardment of Fort McHenry at Baltimore inspired "The Star-Spangled Banner."', terms: ['4.4:Burning of Washington (Aug. 24, 1814)', '4.4:Fort McHenry / Francis Scott Key'], point: [-76.9, 39.1] },
  { id: 'ev-plattsburgh', layer: 'events', title: 'Plattsburgh', when: '1814', from: 1814, desc: 'A U.S. naval victory on Lake Champlain.', terms: ['4.4:Lake Champlain / Plattsburgh (1814)'], point: [-73.45, 44.7] },
  { id: 'ev-hartford', layer: 'events', title: 'Hartford', when: '1814', from: 1814, desc: 'New England Federalists met here to oppose the war.', terms: ['4.4:Hartford Convention (1814)'], point: [-72.68, 41.76] },
  { id: 'ev-horseshoe', layer: 'events', title: 'Horseshoe Bend', when: '1814', from: 1814, desc: 'Jackson defeated the Red Sticks; the Treaty of Fort Jackson forced the Creeks to cede about 14 million acres.', terms: ['4.4:Battle of Horseshoe Bend (1814)', '4.4:Treaty of Fort Jackson', '4.4:Red Sticks / Creek civil war'], point: [-85.74, 32.97], solemn: true },
  { id: 'ev-negrofort', layer: 'events', title: '"Negro Fort"', when: '1816', from: 1816, desc: 'U.S. and Creek troops destroyed a fort of freedom seekers in Florida; 270 people were killed.', terms: ['4.4:"Negro Fort" (1816)'], point: [-84.99, 29.94], solemn: true },
  { id: 'ev-pensacola', layer: 'events', title: 'Pensacola', when: '1818', from: 1818, desc: 'Jackson invaded Spanish Florida and seized Pensacola in the First Seminole War.', terms: ['4.4:First Seminole War (1818)'], point: [-87.22, 30.42], solemn: true },
  { id: 'ev-lowell', layer: 'events', title: 'Lowell, Massachusetts', when: '1821', from: 1821, desc: 'A planned mill town on the Merrimack River, worked by "mill girls" who walked out in 1834 and 1836.', terms: ['4.5:Lowell, Massachusetts (1821)', '4.6:"Mill girls"', '4.6:Lowell "turnouts" (1834, 1836)'], point: [-71.32, 42.64] },
  { id: 'ev-charleston', layer: 'events', title: 'Charleston', when: '1822', from: 1822, desc: 'Site of the alleged Denmark Vesey conspiracy.', terms: ['4.12:Denmark Vesey', '4.8:Denmark Vesey conspiracy'], point: [-79.93, 32.78], solemn: true },
  { id: 'ev-southampton', layer: 'events', title: 'Southampton County', when: 'Aug. 1831', from: 1831, desc: 'Nat Turner’s Rebellion; harsher slave laws followed across the South.', terms: ["4.13:Nat Turner's Rebellion (Aug. 1831)", '4.13:Repression after Turner'], point: [-77.1, 36.68], solemn: true },
  { id: 'ev-nauvoo', layer: 'events', title: 'Nauvoo', when: '1839–1846', from: 1839, until: 1846, desc: 'The Mormon city on the Mississippi. After a mob killed Joseph Smith in 1844, the Mormons moved to the Great Salt Lake.', terms: ['4.10:Nauvoo, Illinois', "4.10:Smith's murder (1844)"], point: [-91.38, 40.55] },
  { id: 'ev-seneca', layer: 'events', title: 'Seneca Falls', when: '1848', from: 1848, desc: 'The first women’s rights convention and its Declaration of Sentiments.', terms: ['4.11:Seneca Falls Convention (1848)', '4.11:Declaration of Sentiments'], point: [-76.8, 42.91] },
];

export const YEAR_PRESETS = [1800, 1803, 1812, 1819, 1820, 1825, 1830, 1838, 1848];

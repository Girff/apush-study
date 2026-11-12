/**
 * AP-style short-answer questions (no-stimulus format). Each part is worth
 * one point. Model answers use only facts from the unit definitions; the
 * "evidence" lists are terms a strong answer could cite.
 */
export interface SaqPart {
  label: 'a' | 'b' | 'c';
  task: string;
  model: string;
  evidence: string[];
}

export interface SaqPrompt {
  id: string;
  title: string;
  topics: string[];
  parts: [SaqPart, SaqPart, SaqPart];
}

export const SAQ_RUBRIC = [
  'Answers the question asked (describe = what it was; explain = how or why).',
  'Uses specific, accurate evidence from 1800–1848.',
  'Goes beyond a restatement of the prompt.',
];

export const SAQS: SaqPrompt[] = [
  {
    id: 'market',
    title: 'The market revolution',
    topics: ['4.5', '4.6'],
    parts: [
      {
        label: 'a',
        task: 'Briefly describe ONE way that innovations in transportation changed the U.S. economy between 1800 and 1848.',
        model:
          'The Erie Canal (1825) linked the Great Lakes and the Hudson River to the Atlantic. Shipping got cheaper, western farms were tied to eastern markets, and New York City became the nation’s largest and most important city.',
        evidence: ['4.5:Erie Canal (1825)', '4.5:National Road', '4.5:Robert Fulton (1807)', '4.5:Baltimore & Ohio Railroad (1827)', '4.1:Transportation Revolution'],
      },
      {
        label: 'b',
        task: 'Briefly explain ONE way the market revolution changed the roles of women in the period.',
        model:
          'As paid work moved out of the household, middle-class women were expected to stay in a separate, private sphere (the cult of domesticity) and increasingly bought cloth instead of making it. At the same time, young farm women took wage jobs as Lowell “mill girls.”',
        evidence: ['4.6:Separate spheres', '4.6:Cult of Domesticity / True Womanhood', '4.6:Women as consumers', '4.6:"Mill girls"'],
      },
      {
        label: 'c',
        task: 'Briefly explain ONE way workers responded to industrialization in the period.',
        model:
          'Lowell’s women operatives walked out over wage cuts in 1834 and 1836, and in the 1840s Sarah Bagley’s Lowell Female Labor Reform Association petitioned for a ten-hour day. Commonwealth v. Hunt (1842) then ruled unions legal.',
        evidence: ['4.6:Lowell "turnouts" (1834, 1836)', '4.6:Ten-Hour Movement', '4.6:Sarah Bagley / Lowell Female Labor Reform Association', '4.6:Commonwealth v. Hunt (1842)'],
      },
    ],
  },
  {
    id: 'democracy',
    title: 'Expanding (and limiting) democracy',
    topics: ['4.7', '4.8'],
    parts: [
      {
        label: 'a',
        task: 'Briefly describe ONE way political participation expanded between 1800 and 1840.',
        model:
          'States lowered or dropped property requirements, opening the vote to poorer white men; New York’s 1821 constitution enfranchised nearly all white male taxpayers. Mass parties then turned elections into spectacles, like the Whigs’ 1840 “log cabin and hard cider” campaign.',
        evidence: ['4.7:Lowered property requirements', '4.7:New York constitution of 1821', '4.7:Democratic Party', '4.7:Election of 1840'],
      },
      {
        label: 'b',
        task: 'Briefly explain ONE way political participation was limited in the same period.',
        model:
          'As white men gained the vote, free Black men lost it: Pennsylvania’s 1838 constitution banned Black voting completely, and by 1839 almost all states limited Black voting. Women could not vote at all.',
        evidence: ['4.7:Black disfranchisement', '4.7:Pennsylvania constitution of 1838', "4.7:Women's exclusion and influence", '4.7:James Forten'],
      },
      {
        label: 'c',
        task: 'Briefly explain ONE way Andrew Jackson expanded the power of the presidency.',
        model:
          'Jackson vetoed the Second Bank of the United States in 1832, calling it unconstitutional, and moved federal deposits into pet banks. His opponents called him “King Andrew the First” for this use of executive power.',
        evidence: ['4.8:Bank veto (July 1832)', '4.8:Pet banks (1833)', '4.8:"King Andrew the First"', '4.8:Force Bill'],
      },
    ],
  },
  {
    id: 'sectionalism',
    title: 'Sectional conflict',
    topics: ['4.3', '4.8'],
    parts: [
      {
        label: 'a',
        task: 'Briefly describe ONE cause of the Missouri Crisis (1819–1820).',
        model:
          'Missouri asked to enter the Union as a slave state, which threatened the balance of free and slave states in the Senate. Northerners, already wary of the Virginia dynasty, backed the Tallmadge Amendment to bar new enslavement there.',
        evidence: ['4.3:Missouri Crisis (1819–1820)', '4.3:Balance of free and slave states', '4.3:James Tallmadge / Tallmadge Amendment', '4.3:Virginia dynasty'],
      },
      {
        label: 'b',
        task: 'Briefly explain ONE way the Missouri Compromise attempted to resolve the conflict.',
        model:
          'It admitted Missouri as a slave state and Maine as a free state, keeping the Senate balanced, and banned slavery north of the 36°30′ line in the rest of the Louisiana Purchase.',
        evidence: ['4.3:Missouri Compromise (1820)', '4.3:36°30′ line', '4.3:Jesse Thomas'],
      },
      {
        label: 'c',
        task: 'Briefly explain ONE way debates over tariffs increased sectional tension between 1828 and 1833.',
        model:
          'The South blamed the 1828 “Tariff of Abominations” for its losses. Calhoun’s South Carolina Exposition and Protest argued that states could nullify it, and South Carolina later declared the tariffs “null, void, and no law,” which led to Jackson’s Force Bill before a compromise tariff ended the crisis.',
        evidence: ['4.8:Tariff of 1828 ("Tariff of Abominations")', '4.8:South Carolina Exposition and Protest', '4.8:Nullification', '4.8:Compromise tariff'],
      },
    ],
  },
  {
    id: 'reform',
    title: 'Religion and reform',
    topics: ['4.10', '4.11'],
    parts: [
      {
        label: 'a',
        task: 'Briefly describe ONE belief associated with the Second Great Awakening.',
        model:
          'Revivalists rejected Calvinist predestination and taught that each person could choose salvation. Charles Grandison Finney preached perfectionism, the idea that the redeemed should live free of sin.',
        evidence: ['4.10:Orthodox Calvinism / predestination', '4.10:Perfectionism', '4.10:Charles Grandison Finney', '4.10:Spiritual egalitarianism'],
      },
      {
        label: 'b',
        task: 'Briefly explain how the Second Great Awakening influenced ONE reform movement.',
        model:
          'Postmillennialism taught that believers must perfect the world before Christ’s return. That optimism drove the temperance movement, the largest antebellum reform; the American Temperance Society (1826) spread the pledge nationwide.',
        evidence: ['4.10:Postmillennialism', '4.10:Disinterested benevolence', '4.11:Temperance movement', '4.11:Immediatism'],
      },
      {
        label: 'c',
        task: 'Briefly explain ONE way women participated in reform movements, or ONE limit they faced.',
        model:
          'Women boycotted goods made with slave labor, and the Grimké sisters spoke against slavery to mixed audiences. When the 1840 World Anti-Slavery Convention refused to seat women delegates, the insult helped spark the Seneca Falls Convention of 1848.',
        evidence: [
          '4.11:Female Anti-Slavery Society / free-produce boycotts',
          '4.11:Angelina and Sarah Grimké',
          '4.11:World Anti-Slavery Convention (London, 1840)',
          '4.11:Seneca Falls Convention (1848)',
        ],
      },
    ],
  },
  {
    id: 'world',
    title: 'America on the world stage',
    topics: ['4.4'],
    parts: [
      {
        label: 'a',
        task: 'Briefly describe ONE cause of the War of 1812.',
        model:
          'Britain’s impressment of about 6,000 American sailors and its restrictions on trade, along with conflict in the Old Northwest, pushed young War Hawks such as Clay and Calhoun to call for war in 1812.',
        evidence: ['4.4:Impressment', '4.4:USS Chesapeake (1807)', '4.4:War Hawks', '4.4:Tecumseh'],
      },
      {
        label: 'b',
        task: 'Briefly explain ONE effect of the War of 1812 on American Indians.',
        model:
          'After Jackson defeated the Red Sticks at Horseshoe Bend, the Treaty of Fort Jackson forced the Creeks to cede about 14 million acres, opening land for slavery’s expansion. In the North, Tecumseh died in 1813 and his movement for pan-Native unity collapsed.',
        evidence: ['4.4:Battle of Horseshoe Bend (1814)', '4.4:Treaty of Fort Jackson', "4.4:Tecumseh's death (1813)", '4.4:Red Sticks / Creek civil war'],
      },
      {
        label: 'c',
        task: 'Briefly explain ONE way the United States asserted its influence in the Western Hemisphere between 1815 and 1823.',
        model:
          'Jackson’s 1818 invasion of Spanish Florida pressured Spain into the Adams-Onís Treaty (1819), which ceded Florida. The Monroe Doctrine (1823) then declared the hemisphere closed to new European colonization.',
        evidence: ['4.4:First Seminole War (1818)', '4.4:Adams-Onís Treaty (1819)', '4.4:Monroe Doctrine (1823)', '4.4:John Quincy Adams'],
      },
    ],
  },
  {
    id: 'south',
    title: 'Slavery and Southern society',
    topics: ['4.12', '4.13'],
    parts: [
      {
        label: 'a',
        task: 'Briefly describe ONE way cotton connected the South to the national or global economy.',
        model:
          'Banks in New York, Philadelphia and London financed cotton expansion, and Southern ports shipped cotton to New York, Liverpool and Manchester; exports rose from 150,000 bales in 1815 to 4.5 million in 1859. Northern textile mills ran on that cotton.',
        evidence: ['4.13:Credit from Northern and British banks', '4.13:Global cotton trade', '4.13:Cotton exports', '4.5:Textile corporations'],
      },
      {
        label: 'b',
        task: 'Briefly explain ONE way enslaved people resisted slavery or sustained their communities.',
        model:
          'Kinship networks helped enslaved families and communities survive sale, and enslaved people built a Christianity that blended African traditions and drew on the story of Moses. Some resisted openly, as in Nat Turner’s Rebellion (1831).',
        evidence: ['4.13:Kinship networks', "4.13:Enslaved people's Christianity", "4.13:Nat Turner's Rebellion (Aug. 1831)", '4.13:Harriet Jacobs / Incidents in the Life of a Slave Girl'],
      },
      {
        label: 'c',
        task: 'Briefly explain ONE way white Southerners defended slavery in the period.',
        model:
          'Proslavery ideology defended slavery as order and duty, and defenders cited the biblical “curse of Ham.” After Nat Turner’s Rebellion, Southern states passed harsher slave laws, and anti-literacy laws barred enslaved people from reading.',
        evidence: ['4.13:Proslavery ideology', '4.13:Curse of Ham', '4.13:Repression after Turner', '4.13:Anti-literacy laws'],
      },
    ],
  },
];

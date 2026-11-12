import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'haiti',
      marker: '1791–1804',
      heading: 'A revolution in Haiti',
      text: `Enslaved people in the French colony of Saint-Domingue rose up in the [[Haitian Revolution (1791–1804)|Haitian Revolution]]. Their victory inspired Black Americans, terrified enslavers and defeated France, and it set up the largest land deal in U.S. history.`,
    },
    {
      id: 'purchase',
      marker: '1803',
      heading: 'Louisiana for sale',
      text: `Western farmers needed the port of [[New Orleans]]. The U.S. minister [[Robert R. Livingston]] negotiated with [[Napoleon Bonaparte / Talleyrand|Napoleon and his minister Talleyrand]], who, having lost Haiti to revolt and yellow fever, sold all of Louisiana. The [[Louisiana Purchase (1803)|Louisiana Purchase]] cost $15 million. Nothing in the Constitution mentioned buying land, but on the [[Constitutionality of the Purchase|constitutionality of the purchase]], Jefferson acted beyond strict limits for national gain.`,
      motif: 'compass',
    },
    {
      id: 'impressment',
      marker: '1803–1807',
      heading: 'Caught between empires',
      text: `At sea, Britain practiced [[Impressment|impressment]], forcing about 6,000 Americans into its navy between 1803 and 1812. When a British warship attacked the [[USS Chesapeake (1807)|USS Chesapeake]] in 1807, the nation was outraged.`,
    },
    {
      id: 'embargo',
      marker: '1807',
      heading: 'Peaceable coercion',
      text: `Instead of war, Jefferson chose [[Peaceable coercion|peaceable coercion]], economic pressure. The [[Embargo Act of 1807]] closed U.S. ports, and exports fell from $108 million to $22 million. American merchants and farmers suffered, and impressment went on.`,
    },
    {
      id: 'confederacy',
      marker: '1791–1795',
      heading: 'Native nations hold the line',
      text: `In the Old Northwest, Native nations had long used a [[Play-off System|play-off system]], balancing one empire against another; the Seneca orator [[Red Jacket]] was one skilled diplomat. In the 1790s a [[Western Confederacy (1791–1795)|Western Confederacy]] of Native nations destroyed two U.S. armies before its defeat at [[Battle of Fallen Timbers (1794) / Treaty of Greenville (1795)|Fallen Timbers]] and the land cession at Greenville that followed.`,
    },
    {
      id: 'tecumseh',
      marker: '1811',
      heading: 'Tecumseh and the Prophet',
      text: `A new movement rose. The Shawnee leader [[Tecumseh]] called for pan-Native unity and resistance, while his brother [[Tenskwatawa ("the Prophet")|Tenskwatawa, "the Prophet,"]] led a religious revitalization based at [[Prophetstown]] in Indiana. Indiana's governor, [[William Henry Harrison]], pushed for military action, and in 1811 his attack at the [[Battle of Tippecanoe (1811)|Battle of Tippecanoe]] broke Tecumseh's confederacy.`,
    },
    {
      id: 'warhawks',
      marker: 'June 1812',
      heading: 'The War Hawks get their war',
      text: `Young congressmen known as [[War Hawks]], among them Clay and Calhoun, wanted war. Congress declared the [[War of 1812]] in June 1812, fought over impressment, trade and the Old Northwest, under the slogan [["Free Trade and Sailors' Rights!"|"Free Trade and Sailors' Rights!"]]`,
      motif: 'broadside',
    },
    {
      id: 'fighting',
      marker: '1812–1813',
      heading: 'On the lakes and the seas',
      text: `The [[Invasion of Canada|invasion of Canada]], where Loyalists had settled Upper Canada, failed. At sea, the [[USS Constitution ("Old Ironsides")|USS Constitution]], "Old Ironsides," defeated HMS Guerriere, and Captain James Lawrence's dying words, [["Don't give up the ship!"|"Don't give up the ship!"]], became a rallying cry. Fighting alongside the British, [[Tecumseh's death (1813)|Tecumseh fell]] in 1813 at Moraviantown, Ontario.`,
    },
    {
      id: 'washington',
      marker: '1814',
      heading: 'Washington burns, Baltimore holds',
      text: `On August 24, 1814, British troops torched the capital in the [[Burning of Washington (Aug. 24, 1814)|burning of Washington]]. Weeks later their bombardment of [[Fort McHenry / Francis Scott Key|Fort McHenry]] failed, and Francis Scott Key's poem became "The Star-Spangled Banner." On [[Lake Champlain / Plattsburgh (1814)|Lake Champlain]], a U.S. naval victory at Plattsburgh turned back an invasion from Canada.`,
    },
    {
      id: 'creek',
      marker: '1813–1814',
      heading: 'The Creek War',
      text: `In the South the war merged with a [[Red Sticks / Creek civil war|Creek civil war]]: the Red Sticks, a faction allied with Tecumseh, fought Creeks who favored accommodation. Andrew Jackson defeated the Red Sticks at the [[Battle of Horseshoe Bend (1814)|Battle of Horseshoe Bend]], and the [[Treaty of Fort Jackson]] forced the Creeks to cede about 14 million acres, opening land for slavery's expansion.`,
    },
    {
      id: 'peace',
      marker: '1814–1815',
      heading: 'Peace, then a victory',
      text: `New England Federalists who opposed the war met at the [[Hartford Convention (1814)|Hartford Convention]] and proposed ending the three-fifths rule; many Americans saw them as disloyal. Diplomats signed the [[Treaty of Ghent (Dec. 24, 1814)|Treaty of Ghent]] on December 24, 1814, restoring prewar relations. Weeks later, before word of the peace arrived, Jackson won the [[Battle of New Orleans (Jan. 1815)|Battle of New Orleans]] and became the "Hero of New Orleans."`,
    },
    {
      id: 'florida',
      marker: '1816–1819',
      heading: 'Florida',
      text: `In 1816 U.S. and Creek troops destroyed the [["Negro Fort" (1816)|"Negro Fort"]] in Florida, a fort of people who had escaped slavery; 270 people were killed. In the [[First Seminole War (1818)|First Seminole War]], Jackson invaded Spanish Florida and seized Pensacola. With that pressure on Spain, Monroe's secretary of state, [[John Quincy Adams]], won the [[Adams-Onís Treaty (1819)|Adams-Onís Treaty]], in which Spain ceded Florida.`,
    },
    {
      id: 'doctrine',
      marker: '1823',
      heading: 'A hemisphere closed',
      text: `As Latin American colonies fought wars of independence, the [[Monroe Doctrine (1823)|Monroe Doctrine]] closed the Western Hemisphere to new European colonization.`,
      motif: 'compass',
    },
  ],
  predictions: [
    {
      after: 'purchase',
      question: 'Jefferson read the Constitution strictly, and it said nothing about buying land. What did he do?',
      options: ['Bought Louisiana anyway, for national gain', "Turned down Napoleon's offer", 'Waited years for a constitutional amendment'],
      answer: 0,
      reveal: 'He acted beyond strict limits of the Constitution for national gain.',
    },
    {
      after: 'embargo',
      question: 'The embargo did not stop impressment. What came next?',
      options: ['War with Britain in 1812', 'An alliance with Britain against France', 'A permanent end to overseas trade'],
      answer: 0,
      reveal: 'Along with conflict in the Old Northwest, the failure of economic pressure led Congress to declare war in June 1812.',
    },
    {
      after: 'creek',
      question: 'Who do you predict benefited from the 14 million acres the Creeks were forced to cede?',
      options: ['White settlers and enslavers expanding cotton plantations', 'The Creek Nation', 'Britain'],
      answer: 0,
      reveal: 'The cession opened land for slavery’s expansion: the cotton frontier you will meet in 4.13.',
    },
  ],
  remember: [
    'Haiti’s revolution led France to sell Louisiana, doubling U.S. territory in 1803.',
    'Impressment, failed economic pressure and conflict in the Old Northwest led to the War of 1812, a draw that sparked nationalism.',
    'Each step of expansion, from Fallen Timbers to Horseshoe Bend to Florida, came at the expense of Native nations.',
  ],
};

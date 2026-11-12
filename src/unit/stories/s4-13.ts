import type { StorySource } from '../types';

export const story: StorySource = {
  beats: [
    {
      id: 'kinds',
      marker: 'Cotton',
      heading: 'Two kinds of cotton',
      text: `Sea Island cotton, the [[Long-staple vs. short-staple cotton|long-staple]] kind, was prized but limited to the coast. The cotton gin made inland, short-staple cotton pay, and after 1833 [[Petit Gulf cotton (1833)|Petit Gulf cotton]], Rush Nutt's hybrid, spread across the Cotton Belt.`,
      motif: 'cotton',
    },
    {
      id: 'land',
      marker: '1830s',
      heading: 'Land fever',
      text: `Removal of Native nations opened cheap Delta land for auction ([[Indian removal and cotton land|Indian removal and cotton land]]). Observers called the rush a [[Cotton "mania" / "new El Dorado"|"mania" and a "new El Dorado"]]. [[Credit from Northern and British banks|Banks in New York, Philadelphia and London]] financed the expansion, and enslavers mortgaged the people they held: [[Enslaved people as collateral|enslaved people served as collateral]] for loans.`,
      motif: 'bank',
    },
    {
      id: 'belt',
      marker: '1815–1859',
      heading: 'The Cotton Belt',
      text: `By 1835, the [[Five main cotton states (1835)|five main cotton states]] were South Carolina, Georgia, Alabama, Mississippi and Louisiana. The [[Cotton Belt / Black Belt|Cotton Belt, or Black Belt]], was named for its soil and its enslaved population. [[Cotton exports]] rose from 150,000 bales in 1815 to 4.5 million in 1859, carried through the [[Global cotton trade|global cotton trade]] from Southern ports to New York, Liverpool, Manchester and Le Havre.`,
      motif: 'ship',
    },
    {
      id: 'trade',
      marker: '1790–1860',
      heading: 'The domestic slave trade',
      text: `The [[Interregional slave trade|interregional slave trade]] forcibly moved about one million people south between 1790 and 1860. [[Upper South vs. Lower South|The Upper South sold enslaved people, and the Lower South bought them]]. Enslaved families dreaded being sold [["Downriver"|"downriver,"]] a euphemism for sales down the Mississippi.`,
    },
    {
      id: 'market',
      marker: 'New Orleans',
      heading: 'The market',
      text: `The largest slave market in the nation operated in New Orleans, at the [[New Orleans slave market (St. Louis Exchange)|St. Louis Exchange]]. Traders sorted people into price categories such as [["Prime field hands"|"prime field hands,"]] reducing human beings to property.`,
    },
    {
      id: 'cities',
      marker: 'Cities',
      heading: 'A Southern urban world',
      text: `Cotton built cities: [[Southern urban growth|New Orleans, Charleston, Richmond and Mobile]] doubled or tripled in size. A [[Southern urban middle class|Southern urban middle class]] of craftsmen and merchants formed benevolent societies. Proslavery business journals such as [[De Bow's Review / American Cotton Planter|De Bow's Review and the American Cotton Planter]] spoke for the cotton economy.`,
      motif: 'press',
    },
    {
      id: 'ideology',
      marker: 'Ideology',
      heading: 'Defending slavery',
      text: `[[Proslavery ideology|Proslavery ideology]] defended slavery as order and duty. Defenders cited the [[Curse of Ham|"curse of Ham,"]] a biblical argument used to justify slavery. An ideal of [[Southern womanhood / female purity|Southern womanhood and female purity]] was used to justify racial control, and [[Plantation mistresses|plantation mistresses]], white women of planter families, were kept from manual labor.`,
    },
    {
      id: 'families',
      marker: '1860',
      heading: 'Families under slavery',
      text: `By 1860, the [[Enslaved population (1860)|enslaved population]] numbered about 4 million people. [[Kinship networks|Kinship networks]] helped families and communities survive sale, and about two-thirds of enslaved people lived in nuclear households.`,
      motif: 'church',
    },
    {
      id: 'law',
      marker: '1855',
      heading: 'No protection under law',
      text: `The law gave enslaved women no protection from sexual violence. In North Carolina, [[Harriet Jacobs / Incidents in the Life of a Slave Girl|Harriet Jacobs]] resisted an enslaver's sexual abuse, and her narrative, *Incidents in the Life of a Slave Girl*, told the story. In 1855 Missouri hanged [[Celia (1855)|Celia]], an enslaved woman who had killed the enslaver who assaulted her.`,
    },
    {
      id: 'faith',
      marker: 'Faith',
      heading: 'Faith and literacy',
      text: `[[Anti-literacy laws|Anti-literacy laws]] barred enslaved people from reading. Even so, [[Enslaved people's Christianity|enslaved people's Christianity]] blended African traditions and drew on stories like that of Moses. The formerly enslaved writer [[William Wells Brown]] exposed hypocritical Christian enslavers.`,
      motif: 'church',
    },
    {
      id: 'turner',
      marker: 'Aug. 1831',
      heading: 'Nat Turner',
      text: `In August 1831, in Southampton County, Virginia, Nat Turner led an uprising in which about 57 white people were killed ([[Nat Turner's Rebellion (Aug. 1831)|Nat Turner's Rebellion]]). White militias and mobs killed many Black people in retaliation. [[Repression after Turner|Repression]] followed across the South: harsher slave laws, and Black churches placed under white ministers.`,
    },
    {
      id: 'honor',
      marker: 'Honor',
      heading: 'A culture of honor',
      text: `Among white Southern men, [[Masculine honor|masculine honor]] was the core of manhood, enforced through violence. Gentlemen settled disputes by [[Dueling|dueling]]: Jackson, Burr, Clay and Benton all dueled. In the backcountry, [[Rough-and-tumble fighting|rough-and-tumble fighting]] aimed to maim an opponent.`,
    },
  ],
  predictions: [
    {
      after: 'land',
      question: 'Planters borrowed against land and enslaved people to buy more of both. What risk does that create?',
      options: ['Debt that a financial panic could bring crashing down', 'No risk, because cotton prices never fell', 'A shortage of banks'],
      answer: 0,
      reveal: 'Credit-fueled expansion tied Southern slavery to Northern and British banks, and to panics like 1837 (4.8).',
    },
    {
      after: 'ideology',
      question: 'Enslaved families lived under constant threat of sale. How do you predict they held communities together?',
      options: ['Through kinship networks that survived separation', 'They could not form families at all', 'By leaving the South openly'],
      answer: 0,
      reveal: 'Kinship networks let families and communities survive sale, and about two-thirds of enslaved people lived in nuclear households.',
    },
  ],
  remember: [
    'Cotton made the South rich, urban and globally connected, financed by Northern and British credit.',
    'The interregional slave trade forcibly moved about one million people south as slavery grew more profitable and expansive.',
    'Enslaved people built families, faith and resistance inside a system held together by law, violence and an honor culture.',
  ],
};

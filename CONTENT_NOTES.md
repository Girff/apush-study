# Content notes

Every term, definition and Yawp citation on the site is read from [`src/data/apush-unit4-terms.json`](src/data/apush-unit4-terms.json) and shown exactly as written. This file lists the teaching content added beyond that JSON, where each piece comes from, and a few entries in the JSON itself that are worth checking against *The American Yawp*.

**Source labels used below**

- **JSON** restates a definition from the unit file (often from another topic's term).
- **Standard** is a widely documented fact found in any survey text (e.g. statehood years, presidential terms). Not taken from the unit file; worth confirming against the Yawp.
- **Interpretive** is a causal or framing judgment of the kind APUSH courses teach, not a fact from the file. Flagged so a teacher can accept or reword it.

All authored references to terms are checked automatically: `npm run validate` fails the build if any reference doesn't exactly match a term, or if any of the 361 terms is missing from its Story Mode chapter.

---

## 1. JSON entries to double-check

These are in the unit file itself. The site displays them unchanged, but they may not match the Yawp or the standard record.

| Topic | Term | What the JSON says | Why check it |
| --- | --- | --- | --- |
| 4.3 | Bank of the United States | "chartered 1811 and again in 1816" | The First Bank was chartered in **1791**; its charter **expired** in 1811, and the Second Bank was chartered in 1816. Because of this, the timeline doesn't place this term. |
| 4.8 | 1832 Jefferson dinner toasts | "1832" in the term name | The famous Jackson–Calhoun toasts were at the Jefferson Day dinner of **April 1830**. The term is left off the timeline and out of the ordering game (`DATE_OVERRIDES` in `src/unit/timeline.ts`); Story Mode mentions the dinner without a year. |
| 4.4 | Treaty of Fort Jackson | "about 14 million acres" | Commonly cited as **about 21–23 million acres**. Used as written in Story Mode, the map and one SAQ model answer; worth confirming against Yawp 7.V. |
| 4.5 | Steamboat New Orleans (1811–1812) | "from Pittsburgh to New Orleans and back" | The *New Orleans* reached New Orleans in 1812 but is usually described as not returning upriver to Pittsburgh. Story Mode says only that it "ran from Pittsburgh down to New Orleans." |
| 4.5 | Erie Canal (1825) | "350 miles" | Usually given as 363 miles. Minor; displayed as written. |

## 2. Story Mode (`src/unit/stories/`)

Each chapter's prose restates the JSON definitions in cause → effect order. Pause & Predict questions and the "three things to remember" summarize the same facts. Framing facts added beyond the file:

| Chapter | Added fact | Source |
| --- | --- | --- |
| 4.2 | Jefferson enslaved Sally Hemings ("a woman Jefferson held in slavery") | JSON (4.2 Callender/Hemings) + standard |
| 4.2 | The Hartford Convention made New England Federalists look disloyal | JSON (4.4) |
| 4.3 | James Tallmadge was a New York congressman | Standard |
| 4.3 | The Senate, "where the South had equal votes," killed the amendment | Standard (11–11 free/slave balance in 1819) |
| 4.3 | The compromise "held for a generation" | Interpretive (it lasted until 1854) |
| 4.4 | Haiti was the French colony of Saint-Domingue | Standard |
| 4.4 | The Constitution did not mention buying land | Standard |
| 4.4 | The invasion of Canada failed; Plattsburgh turned back an invasion from Canada | Standard |
| 4.4 | Tecumseh fell "fighting alongside the British" | Standard |
| 4.4 | New Orleans was fought "before word of the peace arrived" | Standard (JSON: "after the peace") |
| 4.5 | The Erie Canal made shipping cheaper | Standard |
| 4.8 | The Hermitage was Jackson's Tennessee plantation; Eaton was Jackson's secretary of war; Calhoun was the Exposition's author | Standard / JSON |
| 4.8 | Worcester v. Georgia "did not stop removal"; the U.S. Army forced the Cherokee west in 1838; "thousands died" | Standard |
| 4.10 | The First Great Awakening came "a generation before independence" | Standard |
| 4.11 | James G. Birney was the Liberty Party's candidate; the 1840 split "centered on Abby Kelly"; the Grimkés' speaking was widely considered scandalous | Standard |
| 4.12 | Gabriel and others were executed after the 1800 plot | Standard (JSON: "foiled and punished") |
| 4.13 | Sea Island cotton was limited to the coast | Standard |
| 4.13 | White militias and mobs killed many Black people in retaliation after Nat Turner's Rebellion | Standard |

## 3. Living Timeline (`src/unit/timeline.ts`, `src/lib/dates.ts`)

- **Dates parsed from term names** (93 terms), e.g. "(1803)", "(Aug. 24, 1814)", "of 1840", "(1830s)". Ranges like "(1820–1860)" become spans.
- **Overrides:** Andrew Jackson's name carries a lifespan (1767–1845), so the timeline shows his presidency, **1829–1837** (standard). The War of 1812 runs **June 1812 – Jan. 1815** (JSON definitions). The 1832 dinner toasts are excluded (see §1).
- **Curated dates for terms with no year in the name.** Most come from the term's own definition:

| Term | Date | Source |
| --- | --- | --- |
| Rufus King | 1816 | JSON def |
| Death of the Federalist Party | 1814–1816 | JSON defs (Hartford 1814; Monroe's 1816 win) |
| Internal improvements | 1815 | JSON def |
| John C. Calhoun | 1817 | JSON def |
| New post offices | 1810–1830 | JSON def |
| Impressment | 1803–1812 | JSON def |
| Ohio canals | by 1840 | JSON def |
| Jefferson on "monied corporations" | 1816 | JSON def |
| Francis Cabot Lowell / Paul Moody | 1813 | JSON def |
| Textile corporations | 1832 | JSON def |
| Irish Famine | 1840–1860 | JSON def (emigration window) |
| Ten-Hour Movement | 1840s | JSON def |
| Know-Nothings (American Party) | 1850s | JSON def |
| "Vices of democracy" | 1787 | JSON def |
| William Morgan | 1826 | JSON def |
| Anti-Masonic Party | 1830 convention | JSON def |
| Martin Van Buren | elected 1836 | JSON def |
| Virginia and Kentucky Resolutions | 1798–1799 | JSON def |
| Second Bank of the United States | chartered 1816 | JSON def |
| Nicholas Biddle | 1832 | JSON def |
| Denmark Vesey / conspiracy | 1822 | JSON def (4.12) |
| Henry David Thoreau | 1849 | JSON def |
| "Bobalition" broadsides | 1810s | JSON def |
| Polygamy (plural marriage) | 1852 | JSON def |
| Elijah Lovejoy | 1837 | JSON def |
| Gradual emancipation | 1777–1804 | JSON def |
| Slavery's slow end in the North | 1830 | JSON def |
| Free Black population growth | 1790–1810 | JSON def |
| Frederick Douglass | 1845 | JSON def |
| Cotton exports | 1815–1859 | JSON def |
| Interregional slave trade | 1790–1860 | JSON def |
| Thomas Jefferson (presidency) | 1801–1809 | Standard |
| James Madison (presidency) | 1809–1817 | Standard |
| "Era of good feelings" (Monroe years) | 1817–1825 | Standard |
| National Road | begun 1811 | Standard |
| Van Buren's ten-hour order | 1840 | Standard |
| John Tyler | 1841 | Standard |
| Force Bill; Compromise tariff | 1833 | Standard |

- The landing-page ribbon's 14 highlights use dates from the term names.
- **Ordering game:** uses only point events or spans of three years or fewer, and hides years in names and definitions until the student checks.

## 4. Causation Web (`src/unit/causation.ts`)

41 nodes, each grouping two to four related terms. Link explanations restate JSON definitions except where marked:

- **JSON-based:** Haiti → Louisiana Purchase; cotton gin → Cotton Kingdom; Cotton Kingdom → slave trade, Indian removal, Northern mills; removal → Trail of Tears; Missouri → sectionalism; impressment → embargo → war; War of 1812 → Hartford Convention → Federalist collapse; war → nationalism, Creek cession, Jackson's fame; Creek cession → cotton expansion; American System → transportation → market revolution → factories → labor organizing; spheres → women reformers; market → panics; Bank War → Panic of 1837; Bank War → Whigs ("King Andrew"); "corrupt bargain" → Jackson; Jackson → Bank War, removal; tariff and Vesey → nullification; nullification → states' rights / sectionalism; revival → reform; Forten, Walker, cheap print → abolition; abolition → gag rule, women's rights; immigration → nativism.
- **Standard:** Louisiana Purchase → Missouri (Missouri was carved from the Purchase); embargo → war (the policy failed and trade disputes continued); market revolution → separate spheres.
- **Interpretive:** Cotton Kingdom → Missouri Crisis (slavery's westward spread raised the question); Panic of 1819 → Bank War (the depression was blamed on the Bank, per the JSON, "feeding the distrust"); Panic of 1837 → Whig win in 1840; democratization → Jackson's 1828 win; Second Great Awakening → immediate abolition.
- **Expert chains** (Build a Chain) use only these links; the content tests verify every step is a real link.

## 5. Map Room (`src/unit/map.ts`)

- **Base map:** modern state outlines from us-atlas (U.S. Census Bureau), shown faintly for reference.
- **Statehood years** (standard). Maine and West Virginia are shaded with their parent states (Massachusetts, Virginia) before they split.
- **U.S. territory in 1800:** approximated by the modern states east of the Mississippi, excluding Florida. West Florida's Gulf strip and the part of Minnesota east of the river are not separated out.
- **All historical overlays are hand-plotted approximations** in longitude/latitude, labeled as approximate on the page:
  - **Louisiana Purchase:** Mississippi River, 49th parallel, roughly the Continental Divide, and the 1819 southwestern line.
  - **Adams-Onís line:** Sabine River → Red River → 100th meridian → Arkansas River → 42nd parallel.
  - **36°30′:** from Missouri's western border to the 100th meridian.
  - **Indian Territory:** approximately modern Oklahoma without the panhandle.
  - **Trail of Tears:** northern overland route and river route, from National Park Service–style route maps.
  - **Canals and roads:** the Erie Canal, the two Ohio canals and the National Road follow their main towns.
- **Cotton Belt staging:** South Carolina and Georgia from 1800; Louisiana, Mississippi and Alabama appear at statehood (1812, 1817, 1819); the 1835 "five main cotton states" come from the JSON. Statehood stands in for the spread of cotton, so this is approximate.
- **Event markers:** locations are standard. Nauvoo is shown 1839–1846 (standard). Washington and Fort McHenry share one marker.
- **Not drawn:** Texas (1845), Oregon (1846) and the Mexican Cession (1848) belong to Period 5 and have no terms in this unit; the map says so.

## 6. Games

- **Who Am I?** (`src/unit/games.ts`, 18 people). Clues restate JSON definitions, plus a few standard facts:
  - Floride Calhoun was Calhoun's wife.
  - Clay was Adams's secretary of state.
  - Stanton attended the 1840 London convention (with Mott, who is also accepted as an answer).
  - Morse invented the telegraph and also wrote the anti-Catholic warning.
  - Harrison died 31 days into his term (JSON, 4.7 Tyler).
- **Fill the Chain** (9 chains). Each sentence restates a JSON definition; distractors were picked so no distractor also fits a blank.
- **Sort It** (6 sets). Bucket choices are teaching judgments:
  - The Force Bill is counted as Jacksonian, as Jackson's own measure.
  - The American System is counted as Whig, as Clay's program.
  - Jefferson's *Notes* is "gradual or conditional," since it proposed emancipation tied to colonization (JSON).
  - The Hartford Convention is Federalist.
  - The Embargo and War Hawks are Democratic-Republican.
- **SAQ Practice** (`src/unit/saq.ts`, 6 prompts). These are original no-stimulus prompts in AP style, not released exam questions. Model answers use JSON facts; one interpretive line ("his movement for pan-Native unity collapsed" after Tecumseh's death) is a standard textbook judgment.

## 7. Choices about sensitive history

- `SOLEMN_TERMS` in `src/unit/config.ts` lists terms about slavery, removal and violence. Correct answers on these get a plain "Correct." with no XP flourish, badges tied to those topics or chains are awarded quietly (no stamp animation), and **Speed Match leaves them out entirely**: a timed race is no way to treat them.
- No confetti or celebratory effect appears anywhere on the site.
- **Who Am I?** has no clues that turn a killing or a victim of violence into a puzzle. Nat Turner, Gabriel and Celia appear in Story Mode, the timeline and the map, not in the guessing game, and Joseph Smith's clues avoid his murder.
- `CONFUSABLE_PAIRS` lists 39 pairs whose definitions are too close to be fair distractors for each other (e.g. "Peaceable coercion" and "Embargo Act of 1807"). The quiz builder never pairs them.

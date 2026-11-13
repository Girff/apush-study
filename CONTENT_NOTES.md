# Content notes

How the flashcard deck was built from the original Unit 4 term list, and everything a teacher might want to double-check.

- **The deck:** [`src/data/deck.json`](src/data/deck.json) has 286 cards in 22 baskets. Every card is listed in [`DECK.md`](DECK.md).
- **The original list:** [`src/data/apush-unit4-terms.json`](src/data/apush-unit4-terms.json) has 361 entries in 13 topics, keyed to *The American Yawp*, chapters 7–11. The app doesn't load it; it's kept so the tests can check the deck against it.
- **The ledger:** [`src/data/curation.json`](src/data/curation.json) maps each card to the original entries it covers. It also lists every dropped entry with a reason, and every correction.

## How the deck was built

Each of the 361 original entries went one of three ways:

| Outcome | Entries | Example |
| --- | --- | --- |
| **Became its own card**, with the definition rewritten as a complete, standalone answer | most | "Embargo Act of 1807": *Jefferson’s ban on American ships sailing to foreign ports, meant to pressure Britain and France; exports collapsed from $108 million to $22 million…* |
| **Merged into another card** because it was a fragment, a duplicate or a detail of that card | 334 entries map to 257 cards | "Log cabin and hard cider", "Tippecanoe and Tyler Too" and "Harrisburg convention (1839)" are all part of **Election of 1840**. Topic 4.1 entries ("Democratization", "Cotton Revolution"…) merge into the cards that teach them. |
| **Dropped** because it isn't a term (a statistic, a trend, a passing mention) or belongs to another unit | 27 | "New post offices" (a statistic); "Uncle Tom’s Cabin (1852)" (Unit 5) |

The original list was organized by textbook section. The cards are re-sorted into the topic baskets students study by: Jefferson’s Presidency, Jacksonian Democracy, Indian Removal, Reform Movements and so on.

`src/lib/__tests__/deck.test.ts` checks that **every one of the 361 entries is accounted for exactly once**, either on a card or in the dropped list with a reason. `npm run build` runs this test first, so nothing can go missing silently.

## Rules every card follows

These are enforced by the test suite.

1. **One proper term per card.** The term is a person, event, law, court case, group, idea or phrase, named the way a textbook or exam would name it. Combined entries like "Napoleon Bonaparte / Talleyrand" became one clear term (Talleyrand is mentioned in Napoleon’s definition).
2. **The definition is a complete answer.** It says what the term is, when, and why it matters, in a sentence or two.
3. **The definition doesn’t give the answer away.** It never contains the term itself, so definition-first study and Type mode work. For example, the Chesapeake–Leopard Affair card says "a British warship fired on an American naval frigate" instead of naming the ships.
4. **Unique terms and IDs.** Each card has a stable ID (its progress key), and no two cards share a term or an accepted typed answer.
5. **Typography.** Curly quotes and apostrophes only. Definitions end in a period or a closing quote.
6. **Sources.** Cards from the original list cite the Yawp sections of every entry they cover. Added cards cite none.

## Added cards (29)

These are standard Unit 4 terms that weren’t on the original list. They were added so each basket covers its topic. They carry no Yawp citation, and each is written from facts found in any U.S. history survey. In Settings, "Show textbook references" marks them "Added for full Unit 4 coverage."

| Basket | Added |
| --- | --- |
| Jefferson’s Presidency | Lewis and Clark Expedition, Barbary War |
| The Marshall Court | John Marshall, Marbury v. Madison, McCulloch v. Maryland, Gibbons v. Ogden |
| Era of Good Feelings | James Monroe, Rush–Bagot Agreement, Convention of 1818 |
| Jacksonian Democracy | Spoils system, Kitchen Cabinet, Second Party System |
| The Nullification Crisis | Webster–Hayne debate, Daniel Webster |
| The Bank War & Panic of 1837 | Maysville Road veto, Independent Treasury |
| Indian Removal | Five Tribes, Sequoyah, John Ross, Cherokee Nation v. Georgia, Treaty of New Echota, Indian Territory, Black Hawk War, Second Seminole War |
| The Market Revolution | Interchangeable parts |
| Reform Movements | Horace Mann |
| Abolitionism | Amistad case |
| American Culture | Hudson River School |
| Free Black Communities | African Methodist Episcopal (AME) Church |

## Entries not turned into cards (27)

| Original entry | Why |
| --- | --- |
| 4.1 "Panics" | General label; the Panic of 1819 and the Panic of 1837 have their own cards. |
| 4.2 Thomas Paine | Revolutionary-era writer (Unit 3); the entry is a single quotation. |
| 4.2 Mercy Otis Warren | Ratification-era writer (Unit 3). |
| 4.2 Women in partisan politics | A trend illustrated by examples, not a term. |
| 4.3 New post offices | A statistic, not a term. |
| 4.5 Margaret Dwight / Frances Trollope | Travel writers quoted as examples, not core terms. |
| 4.5 Counterfeit bills / "confidence man" | A cultural theme, not a standard term. |
| 4.6 Women as consumers | A trend, not a term. |
| 4.6 Romantic Childhood | The textbook’s descriptive phrase, not a standard term. |
| 4.6 House of Refuge (NYC) | A single local institution. |
| 4.6 Boston Carpenters’ Union (1825) | A single local union; early unions are covered by the Workers & Labor cards. |
| 4.7 "Vices of democracy" | 1787 Constitutional Convention (Unit 3). |
| 4.7 Elbridge Gerry | 1787 Constitutional Convention (Unit 3). |
| 4.7 Benjamin Rush | Founding-era quotation (Unit 3). |
| 4.7 Petitions and public criticism | A practice, not a term. |
| 4.7 Women’s exclusion and influence | A theme, not a term. |
| 4.9 Elizabeth Peabody / Bronson Alcott | Minor members of the Transcendental Club, not core terms. |
| 4.9 Uncle Tom’s Cabin (1852) | Published in 1852 (Unit 5). |
| 4.9 Children’s magazines | Not a standard term. |
| 4.10 Congregationalists / Episcopalians | Mentioned in passing; the revival churches have their own card. |
| 4.10 Spiritual marketplace | The textbook’s descriptive phrase, not a standard term. |
| 4.10 First Great Awakening / George Whitefield | Colonial era (Unit 2). |
| 4.11 Transatlantic reform | A connection between movements, not a term. |
| 4.12 Henry Moss | A single anecdote; the idea is covered by the Scientific racism card. |
| 4.13 Southern urban growth | A trend, not a term. |
| 4.13 Southern urban middle class | Mentioned in passing. |
| 4.13 Enslaved population (1860) | A statistic (about 4 million people), not a term. |

## Corrections to the original list

| Original entry | What the list says | What the card says |
| --- | --- | --- |
| 4.3 Bank of the United States | "chartered 1811 and again in 1816" | The First Bank was chartered in 1791 and expired in 1811. The card is **Second Bank of the United States**, chartered in 1816. |
| 4.8 1832 Jefferson dinner toasts | 1832 | **Jefferson Day dinner toasts (1830)**: the Jackson–Calhoun toasts were in April 1830. |
| 4.4 Treaty of Fort Jackson | "about 14 million acres" | Usually given as about 21–23 million acres; the card describes the cession without a number. |
| 4.5 Erie Canal (1825) | 350 miles | About 360 miles (usually given as 363). |
| 4.5 Steamboat New Orleans | "to New Orleans and back" | It ran from Pittsburgh down to New Orleans; it is usually described as never returning upriver. |
| 4.5 Eli Whitney / cotton gin (1794) | 1794 | **Cotton gin (1793)**: 1794 is the patent year. |
| 4.11 1840 split / Abby Kelly | Kelly | **Abby Kelley**, the usual spelling. Type mode accepts either. |
| 4.4 First Seminole War (1818) | 1818 | 1817–1818 (Jackson’s invasion of Florida was in 1818). |

## Facts added to definitions

Definitions were rewritten from the original entries. Where a definition adds a name, number or date that isn’t in the original entry, that fact is standard and found in any survey text. These are the ones worth a glance:

| Card | Added fact |
| --- | --- |
| Election of 1800 | The Jefferson–Burr Electoral College tie; the House chose Jefferson. |
| Napoleon Bonaparte | Talleyrand made the offer to sell all of Louisiana. |
| Robert R. Livingston | Negotiated with James Monroe. |
| Chesapeake–Leopard Affair | Three sailors killed and four seized; it led to the Embargo Act. |
| Western Confederacy | Leaders Little Turtle and Blue Jacket; U.S. armies destroyed in 1790 and 1791. |
| Fallen Timbers & Treaty of Greenville | General Anthony Wayne; most of present-day Ohio ceded. |
| Prophetstown | Founded in 1808. |
| Battle of the Thames | Named battle (1813) for "Tecumseh’s death." |
| “Don’t give up the ship!” | Oliver Hazard Perry flew it at the Battle of Lake Erie. |
| Hartford Convention | It ended as news of peace arrived. |
| Internal improvements | Madison’s 1817 Bonus Bill veto. |
| Adams–Onís Treaty | The U.S. gave up its claim to Texas. |
| Virginia dynasty | Virginians held the presidency 32 of the first 36 years. |
| New York Constitution of 1821 | The $250 property requirement for Black voters. |
| Anti-Masonic Party | Pioneered the national nominating convention; later joined the Whigs. |
| Jefferson Day dinner toasts | The wording of both toasts. |
| Ordinance of Nullification | Passed in November 1832. |
| Compromise Tariff of 1833 | Rates lowered over ten years. |
| Trail of Tears | About 16,000 Cherokee removed; an estimated 4,000 died. |
| ABCFM | Missionary Samuel Worcester (Worcester v. Georgia). |
| Erie Canal | About 360 miles (see corrections). |
| Robert Fulton | The *Clermont*. |
| John Deere | The steel plow dates to 1837. |
| Samuel Slater | Pawtucket, Rhode Island. |
| Federal Society of Journeymen Cordwainers | Its leaders were convicted of conspiracy in 1806. |
| Irish Potato Famine | 1845–1852; about a million deaths. |
| Ursuline Convent burning | Charlestown, outside Boston. |
| Seventh-day Adventists | Grew out of William Miller’s movement (1843–1844). |
| Mormons | Brigham Young; the Great Salt Lake. |
| Penitentiary movement | Eastern State opened in 1829. |
| Asylum movement | Dorothea Dix. |
| American Colonization Society | Founded in 1816; founded Liberia. |
| Theodore Dwight Weld | *American Slavery As It Is* (1839). |
| Frederick Douglass | The *North Star*. |
| Elijah Lovejoy | Alton, Illinois. |
| Liberty Party | James G. Birney ran in 1840 and 1844. |
| Female seminaries | Troy (1821) and Mount Holyoke (1837). |
| Seneca Falls Convention | July 1848. |
| Married women’s property laws | New York’s 1848 law. |
| Henry David Thoreau | Walden Pond; the essay’s later title, "Civil Disobedience." |
| Margaret Fuller | *Woman in the Nineteenth Century* (1845). |
| Brook Farm | Founded in 1841. |
| Proslavery “positive good” argument | Calhoun’s 1837 speech. |
| Curse of Ham | The Genesis story of Noah and Canaan. |
| Gabriel’s Rebellion | The leaders were hanged. |
| Denmark Vesey | A free Black carpenter. |
| Harriet Jacobs | From North Carolina. |
| John Russwurm | Co-founded *Freedom’s Journal*, the first Black-owned newspaper. |
| The Colored American | Published 1837–1842. |
| Jefferson’s Notes on the State of Virginia | Published 1785. |

## Accepted answers in Type mode

Type mode accepts the term with or without its parenthetical. "Louisiana Purchase" and "Louisiana Purchase 1803" both work for "Louisiana Purchase (1803)". It also accepts:

- name-like parentheticals ("the Prophet", "Cotton Kingdom");
- any `alts` listed on the card, such as "Tariff of Abominations" or "Jefferson";
- small typos. The allowance scales with length, and a typo counts as "close", which is still correct.

A different number is always wrong ("Tariff of 1828" is not "Tariff of 1816"). The tests check that every card accepts its own term and alternates, and that no answer is accepted for two different cards.

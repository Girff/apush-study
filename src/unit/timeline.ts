/**
 * Timeline dates beyond what the term names contain. Most come straight from
 * a term's own definition ("Madison urged them in 1815"); a few are standard
 * dates noted as such. Everything here is listed in CONTENT_NOTES.md.
 */
import type { ParsedDate } from '../lib/dates';

/** Replace (or, with null, drop) the date parsed from a term name. */
export const DATE_OVERRIDES: Record<string, ParsedDate | null> = {
  // A lifespan, not an event: show the presidency instead (standard dates).
  '4.8:Andrew Jackson (1767–1845)': { start: 1829.17, end: 1837.17, label: 'Presidency, 1829–1837' },
  // The well-known Jefferson Day toasts were in April 1830; the term name says 1832.
  // Left off the timeline (and out of the ordering game) until checked. See CONTENT_NOTES.md.
  '4.8:1832 Jefferson dinner toasts': null,
  // Definition: "Declared June 1812"; the Battle of New Orleans was Jan. 1815.
  '4.4:War of 1812': { start: 1812.46, end: 1815.08, label: 'June 1812 – Jan. 1815' },
};

/** Dates for terms whose names carry none. Source noted for each. */
export const EXTRA_DATES: Record<string, ParsedDate> = {
  '4.2:Thomas Jefferson': { start: 1801.17, end: 1809.17, label: 'Presidency, 1801–1809' }, // standard
  '4.2:James Madison': { start: 1809.17, end: 1817.17, label: 'Presidency, 1809–1817' }, // standard
  '4.2:Rufus King': { start: 1816.85, label: '1816' }, // def
  '4.2:Death of the Federalist Party': { start: 1814.9, end: 1816.9, label: '1814–1816' }, // def + 4.4
  '4.3:Internal improvements': { start: 1815.9, label: '1815' }, // def
  '4.3:John C. Calhoun': { start: 1817, label: '1817' }, // def
  '4.3:New post offices': { start: 1810, end: 1830.99, label: '1810–1830' }, // def
  '4.3:"Era of good feelings"': { start: 1817.17, end: 1825.17, label: 'Monroe years, 1817–1825' }, // standard
  '4.4:Impressment': { start: 1803, end: 1812.99, label: '1803–1812' }, // def
  '4.5:National Road': { start: 1811, label: 'Begun 1811' }, // standard
  '4.5:Ohio canals': { start: 1840, label: 'By 1840' }, // def
  '4.5:Jefferson on "monied corporations"': { start: 1816, label: '1816' }, // def
  '4.5:Francis Cabot Lowell / Paul Moody': { start: 1813, label: '1813' }, // def
  '4.5:Textile corporations': { start: 1832, label: '1832' }, // def
  '4.6:Irish Famine': { start: 1840, end: 1860.99, label: '1840–1860' }, // def
  '4.6:Ten-Hour Movement': { start: 1840, end: 1849.99, label: '1840s' }, // def
  "4.6:Van Buren's ten-hour order": { start: 1840.25, label: '1840' }, // standard
  '4.6:Know-Nothings (American Party)': { start: 1850, end: 1859.99, label: '1850s' }, // def
  '4.7:"Vices of democracy"': { start: 1787.4, label: '1787' }, // def
  '4.7:William Morgan': { start: 1826.7, label: '1826' }, // def
  '4.7:Anti-Masonic Party': { start: 1830.7, label: '1830 convention' }, // def
  '4.7:Martin Van Buren': { start: 1836.85, label: 'Elected 1836' }, // def
  '4.7:John Tyler / "His Accidency"': { start: 1841.3, label: '1841' }, // standard
  '4.8:Virginia and Kentucky Resolutions': { start: 1798, end: 1799.99, label: '1798–1799' }, // def
  '4.8:Second Bank of the United States': { start: 1816.3, label: 'Chartered 1816' }, // def
  '4.8:Nicholas Biddle': { start: 1832, label: '1832' }, // def
  '4.8:Force Bill': { start: 1833.15, label: '1833' }, // standard
  '4.8:Compromise tariff': { start: 1833.17, label: '1833' }, // standard
  '4.8:Denmark Vesey conspiracy': { start: 1822.4, label: '1822' }, // 4.12 def
  '4.9:Henry David Thoreau': { start: 1849, label: '1849' }, // def
  '4.9:"Bobalition" broadsides': { start: 1810, end: 1819.99, label: '1810s' }, // def
  '4.10:Polygamy (plural marriage)': { start: 1852, label: 'Acknowledged 1852' }, // def
  '4.11:Elijah Lovejoy': { start: 1837.85, label: '1837' }, // def
  '4.12:Gradual emancipation': { start: 1777, end: 1804.99, label: '1777–1804' }, // def
  "4.12:Slavery's slow end in the North": { start: 1830, label: '1830' }, // def
  '4.12:Free Black population growth': { start: 1790, end: 1810.99, label: '1790–1810' }, // def
  '4.12:Denmark Vesey': { start: 1822.4, label: '1822' }, // def
  '4.12:Frederick Douglass': { start: 1845.4, label: '1845' }, // def
  '4.13:Cotton exports': { start: 1815, end: 1859.99, label: '1815–1859' }, // def
  '4.13:Interregional slave trade': { start: 1790, end: 1860.99, label: '1790–1860' }, // def
};

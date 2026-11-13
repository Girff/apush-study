# APUSH Unit 4 Flashcards

Flashcards for **AP U.S. History Unit 4 (Period 4, 1800–1848)**: 286 curated cards sorted into 22 topic baskets. Pick the baskets you need, choose how to study, and go. Your progress is saved in your browser.

**Live site:** https://girff.github.io/apush-study/

## The baskets

| Group | Baskets |
| --- | --- |
| The Early Republic, 1800–1815 | Jefferson’s Presidency · The Marshall Court · Native Resistance · The War of 1812 |
| Nationalism & Sectionalism, 1815–1824 | Era of Good Feelings · Sectionalism & the Missouri Compromise |
| The Age of Jackson, 1824–1841 | Jacksonian Democracy · The Nullification Crisis · The Bank War & Panic of 1837 · Indian Removal |
| Economy & Society | The Market Revolution · Workers & Labor · Immigration & Nativism · Class, Family & Gender |
| Religion, Reform & Culture | Second Great Awakening · Reform Movements · Abolitionism · Women’s Rights · American Culture |
| Slavery & Black America | Cotton & the Slave South · Enslaved Life & Resistance · Free Black Communities |

Every card, by basket, is listed in [`DECK.md`](DECK.md). [`CONTENT_NOTES.md`](CONTENT_NOTES.md) explains how the deck was built from the original 361-entry term list: what was merged, dropped, added and corrected.

## Studying

- **Choose cards:** tap baskets to select them, or select a whole group at once. Each basket has a **Study** button that starts it on its own, and a **Cards** list with every card in it.
- **Search** every term and definition (press <kbd>/</kbd>), then practice the results.
- **Star** cards to study later, and **hide** cards you don’t need. Uncheck a card in any list, or tap the eye on the card mid-session.
- **Two modes:**
  - **Practice:** go through any cards and sort each into *Know it* or *Still learning*. Missed cards come back four cards later until you know them all.
  - **Spaced review:** shows only cards that are due, plus a daily allowance of new ones. Grades are *Again / Hard / Good / Easy*, and the schedule uses SM-2: 1 day, then about 6 days, then weeks. A miss in Practice also brings a card back sooner in Spaced review.
- **Options:**
  - **Filters:** All, Starred, Weak (missed recently or forgotten twice) or New.
  - **Show first:** the term, the definition, or a mix.
  - **Answer by:** flipping, or **typing** the term. Typing is lenient about case, accents, small typos and a missing year, with hints and an "I was right" override.
  - **Order** (shuffled or in order) and **session size** (10, 20, 50 or all).
- **Progress:** each basket shows a mastery bar (New → Learning → Known → Mastered) and how many cards are due.
- **Session tools:**
  - **Undo** any answer (<kbd>U</kbd> or <kbd>Ctrl</kbd>+<kbd>Z</kbd>).
  - Sessions **resume** after a reload or a break.
  - A summary at the end offers **Practice the missed cards**.
- **Comfort:**
  - Swipe on phones; keyboard shortcuts on computers.
  - **Read aloud**; the screen stays awake while studying.
  - Light and dark themes, three text sizes and reduced motion.
  - Works **offline** once loaded, and can be added to a home screen.
- **Your data:**
  - Export or import progress as a file, to back it up or move it to another device.
  - Download the whole deck as TSV (imports straight into Quizlet or Anki) or CSV.

### Keyboard

| Key | Action |
| --- | --- |
| <kbd>Space</kbd> | Flip the card |
| <kbd>Enter</kbd> | Flip, then *Know it* / *Good* |
| <kbd>←</kbd> / <kbd>1</kbd> | *Still learning* (Practice) · *Again* (Spaced) |
| <kbd>→</kbd> / <kbd>2</kbd> | *Know it* (Practice) |
| <kbd>1</kbd>–<kbd>4</kbd> | *Again / Hard / Good / Easy* (Spaced) |
| <kbd>U</kbd> or <kbd>Ctrl</kbd>+<kbd>Z</kbd> | Undo |
| <kbd>S</kbd> | Star |
| <kbd>R</kbd> | Read aloud |
| <kbd>Esc</kbd> | End the session (saved for later) |
| <kbd>?</kbd> | Help |

## Quick start

Requires **Node.js 20+**.

```bash
npm install
```

```bash
npm run dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload. |
| `npm run build` | Check the deck, type-check, then build the static site into `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm test` | All unit tests: deck integrity and the curation ledger, scheduling, sessions, typed-answer matching, saved data and search. |
| `npm run validate` | The deck checks only (run first by `build`). |
| `npm run deck:md` | Regenerate `DECK.md` from the deck. |

## Editing the deck

Cards live in [`src/data/deck.json`](src/data/deck.json): `groups`, then `baskets`, then `cards` with these fields.

| Field | Required? | What it holds |
| --- | --- | --- |
| `id` | Yes | Stable; it’s the progress key, so don’t rename it. |
| `term` | Yes | The card’s term. |
| `def` | Yes | The definition. |
| `yawp` | No | Yawp section citations. |
| `alts` | No | Extra answers accepted in Type mode. |
| `added` | No | `true` when the card isn’t from the original list. |

When you add or remove a card, update [`src/data/curation.json`](src/data/curation.json) too. List the original entries the card covers, or `[]` for an added card. Then run `npm test` and `npm run deck:md`. The tests will tell you if:

- a definition contains its own term;
- two cards share a term or an accepted answer;
- any of the 361 original entries is no longer accounted for.

## Deploying

`npm run build` produces a static site in `dist/` with relative asset paths, so it works at a domain root or under a sub-path with no configuration.

- **GitHub Pages:** the site is served from the `gh-pages` branch (Settings → Pages → *Deploy from a branch* → `gh-pages`, `/ (root)`). [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) tests, builds and republishes on every push to `main`, and can be run by hand from the Actions tab.
- **Netlify:** [`netlify.toml`](netlify.toml) is ready; import the repository.
- **Vercel:** import the repository. Vercel detects Vite, so nothing else is needed.

The build also writes `sw.js`, a small service worker that caches the app for offline use. Pages load network-first, so a new deploy shows up on the next visit.

## Project structure

```
src/
  data/deck.json            The deck: groups → baskets → cards
  data/curation.json        Ledger: each card's sources; dropped entries; corrections
  data/apush-unit4-terms.json  The original term list (used by tests only)
  lib/
    deck.ts                 Loads the deck and builds lookups
    srs.ts                  SM-2 scheduling
    session.ts              Planning sessions, answering, undo, resume (pure functions)
    status.ts               New / Learning / Known / Mastered, weak and due
    store.ts, prefs.ts      Saved progress and settings (localStorage, synced across tabs)
    match.ts                Checking typed answers; hints
    search.ts, exportData.ts  Search; CSV/TSV and progress files
  views/                    Home (baskets), study panel, card lists, study session, settings, help
  ui/                       Dialog, segmented control, icons, toasts
scripts/deck-md.mjs         Writes DECK.md
```

## Privacy

Progress is stored only in your browser’s `localStorage` (keys `p4cards.v1`, `p4cards.prefs` and `p4cards.session`). Nothing is sent anywhere. If the browser blocks storage, the app still works for that visit, and Settings says so.

## Accessibility and performance

- WCAG AA contrast in both themes and visible focus rings.
- Every control works from the keyboard. Dialogs are native modal `<dialog>`s.
- Screen-reader announcements for flips and answers. The card face turned away is inert, so it isn't read out or reachable by Tab.
- Reduced motion swaps the 3D flip and swipes for quick fades.
- An axe-core audit of 50 screens and states (home, search, lists, settings, help, study, typing and summary, in both themes, on desktop and phone) reports no violations.
- Lighthouse on the production build:

  | | Performance | Accessibility | Best Practices | SEO |
  | --- | --- | --- | --- | --- |
  | Desktop | 100 | 100 | 100 | 100 |
  | Mobile | 96 | 100 | 100 | 100 |

## Credits

- Definitions are keyed to [*The American Yawp*](https://www.americanyawp.com/), an open U.S. history textbook.
- Fonts: Fraunces and Inter (SIL Open Font License), via Fontsource.
- Built with Vite, React, TypeScript and Tailwind CSS.

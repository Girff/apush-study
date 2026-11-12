# Period 4: an interactive APUSH Unit 4 exhibit

An interactive study site for **AP U.S. History Unit 4 (Period 4, 1800–1848)**, keyed to *The American Yawp*, chapters 7–11. It is built like a museum exhibit with a study arcade attached: Story Mode, a Map Room, a Living Timeline, a Causation Web, seven study games, a searchable glossary and a progress dashboard.

Every term, definition and Yawp citation comes from one file, [`src/data/apush-unit4-terms.json`](src/data/apush-unit4-terms.json) (13 topics, 361 terms). Teaching content added beyond that file is listed, with sources, in [`CONTENT_NOTES.md`](CONTENT_NOTES.md).

## What's inside

| Room | What it does |
| --- | --- |
| **Exhibit Hall** (`/`) | Scroll-scrubbed ribbon that unrolls 1800 → 1848, three gallery doors (Politics & Power, Economy & Society, Religion, Reform & Culture), continue-where-you-left-off and an overall mastery meter. |
| **Story Mode** (`/story/4.1` … `/story/4.13`) | One chapter per topic. Terms appear in cause → effect order as ESPN chips (hover or tap for the definition and Yawp citation), with a sticky scene plate, Pause & Predict checkpoints, three takeaways and a five-question mini-quiz. |
| **Map Room** (`/map`) | Year slider (with play) over real state outlines. Layers: U.S. territory and statehood, Louisiana Purchase, Adams-Onís Treaty, Missouri Compromise and 36°30′, Indian removal and the Trail of Tears, Erie and Ohio canals, National Road, the spreading Cotton Belt, and event markers. Select anything for its terms. |
| **Living Timeline** (`/timeline`) | Zoomable, pannable swimlanes of every dated event, filterable by theme and topic, with a caused-by / led-to panel and a list view. **Game:** put five events in order and keep a streak. |
| **Causation Web** (`/web`) | Force-directed graph of 41 developments and 44 explained links. **Build a Chain:** assemble a cause → effect chain and compare it with an expert chain. |
| **Study Arcade** (`/arcade`) | Flashcards (SM-2 spaced repetition, both directions, swipe and keyboard), Quiz (same-topic distractors, missed-term review), Speed Match, Who Am I?, Fill the Chain, Sort It and SAQ Practice. |
| **Glossary** (`/glossary`) | Instant fuzzy search over all 361 terms, filters by topic, Yawp chapter and mastery, related terms and deep links (`/glossary?term=<id>`). |
| **Progress** (`/progress`) | Mastery heat grid, study calendar, quiz history, weakest ten terms, badges, display settings and JSON export/import. |

## Quick start

Requires **Node.js 20+** (developed on Node 22).

```bash
npm install
```

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload. |
| `npm run build` | Validate content, type-check, then build static files into `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm test` | Run all unit tests (data loading, SM-2, quiz builder, dates, content). |
| `npm run validate` | Content checks only: every term reference in `src/unit/` must resolve to a real term, and every term must appear in its Story Mode chapter. `build` runs this first, so a broken reference fails the build. |
| `npm run typecheck` | TypeScript only. |

## Deploying

`npm run build` produces a fully static site in `dist/`. Routing uses the URL hash (`/#/story/4.4`) and asset paths are relative (`base: './'`), so the same build works at a domain root or under a sub-path with **no rewrite rules**.

### Vercel

Import the repository. Vercel detects Vite: build command `npm run build`, output directory `dist`. Nothing else is needed.

### Netlify

Import the repository; [`netlify.toml`](netlify.toml) already sets `npm run build` and the `dist` publish directory. Or drag the `dist/` folder onto the Netlify dashboard.

### GitHub Pages

[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds and publishes on every push to `main`. In the repository settings, under **Pages → Build and deployment**, choose **GitHub Actions** as the source.

## Project structure

```
src/
  data/apush-unit4-terms.json   The unit file: the single source of truth for terms
  lib/                          Shared data loading, types and logic
    loadUnit.ts, data.ts        Validate + index the JSON (stable term IDs: "4.4~louisiana-purchase-1803")
    progress.ts, storage.ts     Saved progress (localStorage with an in-memory fallback), XP, streaks, badges, export/import
    srs.ts, deck.ts             SM-2 scheduling and the flashcard queue
    quiz.ts, mastery.ts         Question builder (same-topic distractors) and the mastery model
    dates.ts, timeline.ts       Dates from term names, timeline events, caused-by / led-to lookups
    related.ts, markup.ts       Related terms; [[Term]] markup for authored prose
    prefs.ts                    Theme (parchment / lamplight) and motion preferences
  unit/                         Everything unit-specific that is NOT a term
    config.ts                   Unit metadata, themes, motifs, badges, solemn terms, confusable pairs
    stories/                    Story Mode chapters (one file per topic)
    causation.ts                Causation nodes, links and expert chains
    timeline.ts, map.ts         Curated dates; map layers and overlays
    games.ts, saq.ts            Who Am I?, Fill the Chain, Sort It; SAQ prompts
  components/                   Layout, ESPN term chip, SVG motifs, mastery meter, reorderable list, UI bits
  features/<feature>/           One folder per room or game (lazy-loaded routes)
  styles/index.css              Tailwind v4 tokens, paper grain, components, motion rules
```

## Swapping in a new unit

The data layer, glossary, flashcards, quiz, Speed Match, timeline (dates parsed from term names) and dashboard work from the JSON alone. The rest needs unit content.

1. **Add the JSON.** Put the new file in `src/data/` in the same shape: an array of `{ id, title, intro, terms: [{ term, yawp, def }] }`. Point the import at the top of `src/unit/config.ts` to it.
2. **Update `UNIT` in `src/unit/config.ts`.** Change `id`, `title`, `subtitle`, `startYear`/`endYear`, `expectedTermCount`/`expectedTopicCount`, and **`storageKey`**, so the new unit's progress never mixes with Unit 4's.
3. **Map topics to themes and motifs** with `TOPIC_THEME`, `TOPIC_MOTIF` and `TOPIC_SHORT`, and rename `TOPIC_BADGES`.
4. **Review `SOLEMN_TERMS` and `CONFUSABLE_PAIRS`** for the new terms. Solemn terms never get celebratory feedback; confusable pairs are never used as each other's quiz distractors.
5. **Author or clear the unit content** in `src/unit/`:
   - `stories/`: write chapters, or delete them. A topic with no chapter gets an automatic one that walks its terms in file order.
   - `causation.ts`, `timeline.ts`, `map.ts`, `games.ts`, `saq.ts`: replace, or empty the arrays. Games with no content show a short "nothing configured" note. The Map Room's overlays are specific to 1800–1848; for another period, replace `MAP_FEATURES`, `STATEHOOD` and `US_1800`, or remove the route from `src/App.tsx` and the nav.
6. **Run `npm run validate`.** It names every reference that doesn't match a term exactly, and every term missing from Story Mode.

## Progress and privacy

Progress is stored only in the browser, in `localStorage` under the unit's `storageKey` (display preferences live under `exhibit.prefs`). If storage is blocked (some private modes), the site keeps working in memory and shows a banner. **Progress → Your data** exports a JSON file and imports one, either merged with or replacing the current progress. Nothing is sent anywhere.

## Accessibility and motion

- WCAG AA contrast in both themes (text tokens checked at 5.4:1 or better; chart colors validated for color-vision deficiency). Visible focus rings, a skip link, labelled landmarks, and focus moved to the page on navigation.
- Every game is fully playable from the keyboard:
  - **Flashcards:** Space flips the card; 1–4 grade it; ← / → for again / good.
  - **Quiz:** 1–4 pick an answer; → goes to the next question.
  - **Timeline:** arrow keys step through events; + and − zoom.
  - **Reorderable lists:** focus a handle and press ↑ / ↓.
  - **Sort It:** focus a card and press its bucket's number.
  - **Everything else** uses standard buttons, links and form controls.
- Charts have table views, and the map and causation graph have list views.
- **Reduced motion:** the site follows the OS setting, and the header's "calm motion" toggle overrides it. With it on, the landing ribbon is static, cards flip without rotation, routes don't draw in, parallax and ink-bleed reveals are off, and CSS animations stop.
- An automated axe-core audit of all 21 routes, in both themes at desktop and phone widths, reports no violations.

## Performance

Routes are code-split; the landing page's critical script is about 100 KB gzipped, and fonts are self-hosted with the two first-screen files preloaded. Lighthouse results on the production build:

| Page | Desktop (perf / a11y) | Mobile (perf / a11y) |
| --- | --- | --- |
| Landing page | 100 / 100 | 92 / 100 |
| Story chapter (deep link) | 100 / 100 | 87 / 100 |
| Glossary (deep link) | 100 / 100 | 83 / 100 |

Best Practices and SEO score 100 on the landing page. On simulated slow 4G, deep links pay for an extra round trip to fetch the route's code, which accounts for the lower mobile scores.

## Credits

- Terms, definitions and citations: the provided Unit 4 file, keyed to [*The American Yawp*](https://www.americanyawp.com/), an open U.S. history textbook (see its site for license terms).
- State outlines: [us-atlas](https://github.com/topojson/us-atlas) (U.S. Census Bureau cartographic boundaries).
- Fonts: Fraunces and Inter (SIL Open Font License) via Fontsource.
- All illustrations are original SVG.
- Built with Vite, React, TypeScript, Tailwind CSS, Framer Motion, Fuse.js, Floating UI and d3 (d3-force, d3-geo).

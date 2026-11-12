import { lazy } from 'react';
import { createHashRouter } from 'react-router';
import { Layout } from './components/Layout';
import ExhibitHall from './features/exhibit/ExhibitHall';

// The landing page ships in the main bundle; everything else is split by route.
const ThemeHall = lazy(() => import('./features/exhibit/ThemeHall'));
const StoryIndex = lazy(() => import('./features/story/StoryIndex'));
const StoryChapter = lazy(() => import('./features/story/StoryChapter'));
const MapRoom = lazy(() => import('./features/map/MapRoom'));
const TimelinePage = lazy(() => import('./features/timeline/TimelinePage'));
const CausationPage = lazy(() => import('./features/causation/CausationPage'));
const ArcadeHub = lazy(() => import('./features/arcade/ArcadeHub'));
const Flashcards = lazy(() => import('./features/flashcards/FlashcardsPage'));
const Quiz = lazy(() => import('./features/quiz/QuizPage'));
const SpeedMatch = lazy(() => import('./features/speed-match/SpeedMatchPage'));
const WhoAmI = lazy(() => import('./features/who-am-i/WhoAmIPage'));
const FillChain = lazy(() => import('./features/fill-chain/FillChainPage'));
const SortIt = lazy(() => import('./features/sort-it/SortItPage'));
const Saq = lazy(() => import('./features/saq/SaqPage'));
const Glossary = lazy(() => import('./features/glossary/GlossaryPage'));
const Dashboard = lazy(() => import('./features/dashboard/DashboardPage'));
const NotFound = lazy(() => import('./features/exhibit/NotFound'));

// Hash routing works on any static host (Vercel, Netlify, GitHub Pages)
// without rewrite rules.
export const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <ExhibitHall /> },
      { path: '/hall/:themeId', element: <ThemeHall /> },
      { path: '/story', element: <StoryIndex /> },
      { path: '/story/:topicId', element: <StoryChapter /> },
      { path: '/map', element: <MapRoom /> },
      { path: '/timeline', element: <TimelinePage /> },
      { path: '/web', element: <CausationPage /> },
      { path: '/arcade', element: <ArcadeHub /> },
      { path: '/arcade/flashcards', element: <Flashcards /> },
      { path: '/arcade/quiz', element: <Quiz /> },
      { path: '/arcade/speed-match', element: <SpeedMatch /> },
      { path: '/arcade/who-am-i', element: <WhoAmI /> },
      { path: '/arcade/fill-the-chain', element: <FillChain /> },
      { path: '/arcade/sort-it', element: <SortIt /> },
      { path: '/arcade/saq', element: <Saq /> },
      { path: '/glossary', element: <Glossary /> },
      { path: '/progress', element: <Dashboard /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

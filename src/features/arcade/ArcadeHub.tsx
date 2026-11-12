import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Motif } from '../../components/Motif';
import { PageHeader, usePageMeta } from '../../components/ui';
import { topics } from '../../lib/data';
import { deckStats } from '../../lib/deck';
import { useProgress } from '../../lib/progress';
import type { MotifId } from '../../lib/types';

interface Game {
  to: string;
  title: string;
  blurb: string;
  motif: MotifId;
  skill: string;
}

const GAMES: Game[] = [
  { to: '/arcade/flashcards', title: 'Flashcards', blurb: 'Spaced repetition in both directions, with a due-today queue.', motif: 'press', skill: 'Recall' },
  { to: '/arcade/quiz', title: 'Quiz', blurb: 'Multiple choice with same-topic distractors and a missed-term review.', motif: 'ballot', skill: 'Recognition' },
  { to: '/arcade/speed-match', title: 'Speed Match', blurb: 'Pair terms with definitions against the clock. Beat your best.', motif: 'canal', skill: 'Fluency' },
  { to: '/arcade/who-am-i', title: 'Who Am I?', blurb: 'Clues revealed one at a time. Guess early for more points.', motif: 'broadside', skill: 'People' },
  { to: '/arcade/fill-the-chain', title: 'Fill the Chain', blurb: 'Complete cause → effect sequences with the right terms.', motif: 'scales', skill: 'Causation' },
  { to: '/arcade/sort-it', title: 'Sort It', blurb: 'Drag terms into buckets: parties, regions, kinds of reform.', motif: 'loom', skill: 'Comparison' },
  { to: '/arcade/saq', title: 'SAQ Practice', blurb: 'AP-style short answers with a rubric and model answers to grade against.', motif: 'petition', skill: 'Writing' },
];

export default function ArcadeHub() {
  usePageMeta('Study Arcade');
  const progress = useProgress();
  const due = deckStats(
    progress,
    topics.map((t) => t.id),
    'both',
  ).due;
  const stat: Record<string, string | undefined> = {
    '/arcade/flashcards': `${due} card${due === 1 ? '' : 's'} due today`,
    '/arcade/quiz': progress.quizzes.length ? `${progress.quizzes.length} quizzes taken` : undefined,
    '/arcade/speed-match': progress.bests['speed:all:time'] ? `Best (all topics): ${progress.bests['speed:all:time'].toFixed(1)}s` : undefined,
    '/arcade/who-am-i': progress.bests['whoami:score'] ? `Best round: ${progress.bests['whoami:score']} pts` : undefined,
    '/arcade/saq': Object.keys(progress.saq).length ? `${Object.keys(progress.saq).length} SAQs self-graded` : undefined,
  };
  return (
    <div className="wrap">
      <PageHeader
        kicker="Study Arcade"
        title="Practice that makes it stick"
        lede="Active recall beats rereading. Each game trains a different AP skill, and every answer feeds your mastery map."
        motif="ballot"
      />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => (
          <motion.li key={g.to} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={g.to} className="panel group flex h-full gap-4 p-5 transition-transform duration-200 hover:-translate-y-1">
              <span className="shrink-0 text-brass">
                <Motif id={g.motif} className="h-14 w-14" animated={false} />
              </span>
              <span className="min-w-0">
                <span className="kicker">{g.skill}</span>
                <span className="mt-0.5 block font-display text-xl font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                  {g.title}
                </span>
                <span className="mt-1 block text-sm text-ink-soft">{g.blurb}</span>
                {stat[g.to] && <span className="mt-2 block text-xs font-semibold text-teal">{stat[g.to]}</span>}
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

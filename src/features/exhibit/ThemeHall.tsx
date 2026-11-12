import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router';
import { Motif } from '../../components/Motif';
import { PageHeader, ProgressBar, usePageMeta } from '../../components/ui';
import { themeById, topicsInTheme } from '../../lib/data';
import { topicMastery } from '../../lib/mastery';
import { useProgress } from '../../lib/progress';
import type { MotifId, ThemeId } from '../../lib/types';
import { THEMES, TOPIC_MOTIF } from '../../unit/config';

const HALL_MOTIF: Record<ThemeId, MotifId> = { prologue: 'compass', politics: 'ballot', economy: 'canal', culture: 'tent' };

export default function ThemeHall() {
  const { themeId = '' } = useParams();
  const valid = THEMES.some((t) => t.id === themeId);
  const theme = themeById((valid ? themeId : 'prologue') as ThemeId);
  usePageMeta(theme.label, `Gallery: ${theme.label}`);
  const progress = useProgress();
  const list = topicsInTheme(theme.id);
  const color = `var(${theme.colorVar})`;
  const ids = list.map((t) => t.id).join(',');

  return (
    <motion.div className="wrap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageHeader kicker="Gallery" title={theme.label} lede={theme.blurb} motif={HALL_MOTIF[theme.id]}>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to={`/arcade/flashcards?topics=${ids}`} className="btn btn-primary btn-sm">
            Flashcards for this gallery
          </Link>
          <Link to={`/arcade/quiz?topics=${ids}`} className="btn btn-secondary btn-sm">
            Quiz this gallery
          </Link>
        </div>
      </PageHeader>
      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {list.map((t) => (
          <li key={t.id}>
            <Link to={`/story/${t.id}`} className="panel group flex h-full gap-4 p-5 transition-transform duration-200 hover:-translate-y-1" style={{ borderLeft: `5px solid ${color}` }}>
              <span className="shrink-0" style={{ color }}>
                <Motif id={TOPIC_MOTIF[t.id]} className="h-16 w-16" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="kicker" style={{ color }}>
                  Topic {t.id}
                </span>
                <span className="mt-0.5 block font-display text-xl font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{t.title}</span>
                {t.intro && <span className="mt-1 block text-sm text-ink-soft">{t.intro}</span>}
                <span className="mt-3 block">
                  <span className="mb-1 flex justify-between text-xs text-muted">
                    <span>{t.terms.length} terms</span>
                    <span>{progress.story[t.id]?.done ? 'Story finished' : 'Read the story →'}</span>
                  </span>
                  <ProgressBar value={topicMastery(t.id, progress)} label={`${t.id} mastery`} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <nav aria-label="Other galleries" className="mt-10 flex flex-wrap gap-2">
        {THEMES.filter((t) => t.id !== theme.id).map((t) => (
          <Link key={t.id} to={`/hall/${t.id}`} className="chip">
            {t.label}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}

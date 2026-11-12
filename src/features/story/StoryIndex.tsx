import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Motif } from '../../components/Motif';
import { PageHeader, ProgressBar, usePageMeta } from '../../components/ui';
import { themeOfTopic, topics } from '../../lib/data';
import { topicMastery } from '../../lib/mastery';
import { useProgress } from '../../lib/progress';
import { TOPIC_MOTIF } from '../../unit/config';

export default function StoryIndex() {
  usePageMeta('Story Mode');
  const progress = useProgress();
  const done = topics.filter((t) => progress.story[t.id]?.done).length;
  return (
    <div className="wrap">
      <PageHeader
        kicker="Story Mode"
        title="Thirteen chapters, cause to effect"
        lede={
          <>
            Each chapter walks its terms in cause → effect order. Tap any highlighted term for its definition and Yawp
            citation, pause to predict what happens next, then check yourself with a mini-quiz. {done} of {topics.length} chapters finished.
          </>
        }
        motif="press"
      />
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t, i) => {
          const theme = themeOfTopic(t.id);
          const finished = progress.story[t.id]?.done;
          return (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.05 }}
            >
              <Link
                to={`/story/${t.id}`}
                className="panel group flex h-full flex-col p-5 transition-transform duration-200 hover:-translate-y-1"
                style={{ borderTop: `4px solid var(${theme.colorVar})` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="kicker" style={{ color: `var(${theme.colorVar})` }}>
                      {t.id} · {theme.short}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                      {t.title}
                    </h2>
                  </div>
                  <span className="shrink-0" style={{ color: `var(${theme.colorVar})` }}>
                    <Motif id={TOPIC_MOTIF[t.id]} className="h-12 w-12" animated={false} />
                  </span>
                </div>
                {t.intro && <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{t.intro}</p>}
                <div className="mt-auto pt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-muted">
                    <span>{t.terms.length} terms</span>
                    <span>{finished ? 'Finished' : 'Not finished'}</span>
                  </div>
                  <ProgressBar value={topicMastery(t.id, progress)} label={`${t.id} mastery`} />
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

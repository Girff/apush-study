import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Fleuron, Motif } from '../../components/Motif';
import { CaseSafe, InkReveal, PageHeader, usePageMeta } from '../../components/ui';
import { themeOfTopic, topicById, topics } from '../../lib/data';
import { useReducedMotion } from '../../lib/prefs';
import { completeStory, recordPrediction, recordQuiz, useProgress } from '../../lib/progress';
import { buildQuiz } from '../../lib/quiz';
import { createRng } from '../../lib/random';
import type { Topic } from '../../lib/types';
import { TOPIC_MOTIF } from '../../unit/config';
import type { Prediction, Story } from '../../unit/types';
import { type QuizResult, QuizRunner } from '../quiz/QuizRunner';
import { RichText } from './RichText';
import { storyFor } from './storyData';

export default function StoryChapter() {
  const { topicId = '' } = useParams();
  const topic = topicById.get(topicId);
  if (!topic) {
    return (
      <div className="wrap py-16">
        <h1 className="text-3xl font-semibold">No chapter called “{topicId}”</h1>
        <p className="mt-3">
          <Link to="/story" className="font-semibold text-teal underline">
            See all chapters
          </Link>
        </p>
      </div>
    );
  }
  return <Chapter key={topic.id} topic={topic} story={storyFor(topic.id)!} />;
}

function Chapter({ topic, story }: { topic: Topic; story: Story }) {
  usePageMeta(`${topic.id} ${topic.title}`, `Story ${topic.id}: ${topic.title}`);
  const theme = themeOfTopic(topic.id);
  const accent = `var(${theme.colorVar})`;
  const progress = useProgress();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [skipped, setSkipped] = useState<string[]>([]);
  const beatEls = useRef<Array<HTMLElement | null>>([]);
  const rememberRef = useRef<HTMLElement>(null);
  const chapters = topics.map((t) => t.id);
  const idx = chapters.indexOf(topic.id);
  const prev = idx > 0 ? topics[idx - 1] : undefined;
  const next = idx < topics.length - 1 ? topics[idx + 1] : undefined;
  const chaptersCited = [...new Set(topic.terms.flatMap((t) => t.chapters))].sort((a, b) => a - b);

  const predictionId = (p: Prediction) => `${topic.id}:${p.after}`;
  const isOpen = (p: Prediction) => progress.predictions[predictionId(p)] === undefined && !skipped.includes(predictionId(p));
  // Everything after the first unanswered prediction stays locked until the student commits.
  const lockAfter = useMemo(() => {
    const open = story.predictions.filter(isOpen).map((p) => story.beats.findIndex((b) => b.id === p.after));
    return open.length ? Math.min(...open) : Infinity;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, progress.predictions, skipped]);

  // The active scene is the last one whose top has crossed the middle of the
  // viewport. Checked on scroll (once per frame), so jumps are handled too.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.5;
      let current = 0;
      beatEls.current.forEach((el, i) => {
        if (el && i <= lockAfter && el.getBoundingClientRect().top < line) current = i;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [lockAfter]);

  // Reaching the takeaways marks the chapter finished.
  useEffect(() => {
    const el = rememberRef.current;
    if (!el || lockAfter !== Infinity) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) completeStory(topic.id);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [topic.id, lockAfter]);

  const goTo = (i: number) => {
    const el = beatEls.current[i];
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  };

  const beat = story.beats[Math.min(active, story.beats.length - 1)];
  const plateMotif = beat?.motif ?? TOPIC_MOTIF[topic.id];

  // Build the reading column, wrapping everything after an open prediction in a locked region.
  const before: ReactNode[] = [];
  const after: ReactNode[] = [];
  story.beats.forEach((b, i) => {
    const target = i > lockAfter ? after : before;
    target.push(
      <section
        key={b.id}
        ref={(el) => {
          beatEls.current[i] = el;
        }}
        data-index={i}
        aria-labelledby={`beat-${b.id}`}
        className="scroll-mt-20 py-8 lg:min-h-[52vh] lg:py-14"
      >
        <p className="kicker" style={{ color: accent }}>
          <CaseSafe text={b.marker} />
        </p>
        <h2 id={`beat-${b.id}`} tabIndex={-1} className="mt-1 text-[clamp(1.6rem,1.3rem+1.2vw,2.3rem)] font-semibold outline-none">
          {b.heading}
        </h2>
        <InkReveal className="mt-4">
          <p className="text-[1.08rem] leading-[1.95] text-ink sm:text-[1.15rem]">
            <RichText text={b.text} topicId={topic.id} />
          </p>
        </InkReveal>
      </section>,
    );
    const p = story.predictions.find((x) => x.after === b.id);
    if (p) {
      target.push(
        <PredictCard
          key={`p-${b.id}`}
          prediction={p}
          chosen={progress.predictions[predictionId(p)]}
          skipped={skipped.includes(predictionId(p))}
          accent={accent}
          onChoose={(i2) => recordPrediction(predictionId(p), i2)}
          onSkip={() => setSkipped((s) => [...s, predictionId(p)])}
          onContinue={() => goTo(i + 1)}
        />,
      );
    }
  });

  const tail = (
    <>
      <section ref={rememberRef} aria-labelledby="remember" className="my-10 border-y-[3px] border-double border-rule-strong py-8">
        <p className="kicker" style={{ color: accent }}>
          End of chapter
        </p>
        <h2 id="remember" className="mt-1 text-3xl font-semibold">
          Three things to remember
        </h2>
        <ol className="mt-5 grid gap-4">
          {story.remember.map((r, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-display text-4xl font-bold leading-none" style={{ color: accent }} aria-hidden="true">
                {i + 1}
              </span>
              <p className="pt-1 text-lg">{r}</p>
            </li>
          ))}
        </ol>
      </section>
      <MiniQuiz topic={topic} />
    </>
  );

  return (
    <div className="wrap">
      <PageHeader
        kicker={`Story Mode · Topic ${topic.id} · ${theme.label}`}
        title={topic.title}
        lede={topic.intro || undefined}
        motif={TOPIC_MOTIF[topic.id]}
      >
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span>{topic.terms.length} terms</span>
          <span>Yawp ch. {chaptersCited.join(', ')}</span>
          <Link className="font-semibold text-teal underline underline-offset-2" to={`/arcade/flashcards?topics=${topic.id}`}>
            Flashcards for {topic.id}
          </Link>
          <Link className="font-semibold text-teal underline underline-offset-2" to={`/arcade/quiz?topics=${topic.id}`}>
            Full quiz for {topic.id}
          </Link>
        </p>
      </PageHeader>

      <div className="lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14">
        {/* Sticky visual plate (desktop) */}
        <aside className="hidden lg:block" aria-label="Chapter scenes">
          <div className="sticky top-6 py-10">
            <div className="panel overflow-hidden" style={{ borderTop: `5px solid ${accent}` }}>
              <div className="relative flex aspect-[5/4] items-center justify-center bg-sunk/60" style={{ color: accent }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={beat?.id}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.03, filter: 'blur(4px)' }}
                    transition={{ duration: reduce ? 0.01 : 0.45 }}
                    className="flex flex-col items-center"
                  >
                    <Motif id={plateMotif} className="h-40 w-40" />
                    <p className="mt-3 text-center font-display text-4xl font-bold tracking-tight text-ink">{beat?.marker}</p>
                  </motion.div>
                </AnimatePresence>
                <span className="absolute left-3 top-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Scene {Math.min(active + 1, story.beats.length)} / {story.beats.length}
                </span>
              </div>
              <nav aria-label="Scenes in this chapter" className="border-t border-rule p-3">
                <ol className="grid gap-0.5">
                  {story.beats.map((b, i) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        disabled={i > lockAfter}
                        aria-current={i === active ? 'step' : undefined}
                        className={`flex w-full items-baseline gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          i === active ? 'bg-sunk font-semibold text-ink' : 'text-ink-soft hover:bg-sunk'
                        }`}
                      >
                        <span className="w-5 shrink-0 text-xs tabular text-muted">{i + 1}</span>
                        <span className="min-w-0 flex-1">{b.heading}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Sticky plate (mobile) */}
          <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 border-b border-rule bg-paper/92 px-4 py-2 backdrop-blur-sm lg:hidden" aria-hidden="true">
            <span style={{ color: accent }}>
              <Motif id={plateMotif} className="h-9 w-9" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-none">{beat?.marker}</p>
              <p className="truncate text-xs text-muted">{beat?.heading}</p>
            </div>
            <span className="ml-auto text-xs tabular text-muted">
              {Math.min(active + 1, story.beats.length)}/{story.beats.length}
            </span>
          </div>

          {before}
          {lockAfter === Infinity ? (
            tail
          ) : (
            <div className="relative">
              <div inert className="pointer-events-none select-none opacity-25 blur-[3px]" aria-hidden="true">
                {after}
                {tail}
              </div>
            </div>
          )}

          <Fleuron className="mx-auto my-10 h-5 w-28 text-brass" />
          <nav aria-label="Chapters" className="flex flex-wrap justify-between gap-3">
            {prev ? (
              <Link to={`/story/${prev.id}`} className="btn btn-secondary">
                ← {prev.id} {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/story/${next.id}`} className="btn btn-primary">
                {next.id} {next.title} →
              </Link>
            ) : (
              <Link to="/story" className="btn btn-primary">
                All chapters
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}

function PredictCard({
  prediction,
  chosen,
  skipped,
  accent,
  onChoose,
  onSkip,
  onContinue,
}: {
  prediction: Prediction;
  chosen: number | undefined;
  skipped: boolean;
  accent: string;
  onChoose: (i: number) => void;
  onSkip: () => void;
  onContinue: () => void;
}) {
  const answered = chosen !== undefined;
  const headingId = `pp-${prediction.after}`;
  return (
    <aside aria-labelledby={headingId} className="my-6 rounded-md border-2 border-dashed p-5 sm:p-6" style={{ borderColor: accent }}>
      <p className="stamp" style={{ color: accent }}>
        Pause &amp; Predict
      </p>
      <h3 id={headingId} className="mt-3 text-xl font-semibold sm:text-2xl">
        {prediction.question}
      </h3>
      <div className="mt-4 grid gap-2" role="group" aria-labelledby={headingId}>
        {prediction.options.map((o, i) => {
          const isAnswer = i === prediction.answer;
          const picked = i === chosen;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              aria-pressed={picked}
              onClick={() => onChoose(i)}
              className={`flex min-h-11 items-center gap-3 rounded border-[1.5px] px-4 py-2.5 text-left transition-colors ${
                !answered
                  ? 'border-rule-strong bg-card hover:border-ink'
                  : isAnswer
                    ? 'border-teal bg-card font-semibold'
                    : picked
                      ? 'border-rule-strong bg-card'
                      : 'border-rule bg-card opacity-60'
              }`}
            >
              <span className="flex-1">{o}</span>
              {answered && isAnswer && <span className="text-xs font-semibold uppercase tracking-wider text-teal">What happened</span>}
              {answered && picked && !isAnswer && <span className="text-xs font-semibold uppercase tracking-wider text-muted">Your prediction</span>}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {answered && (
          <div className="mt-4 border-t border-rule pt-3">
            <p className="font-semibold">{chosen === prediction.answer ? 'Your prediction matched.' : 'Here is what happened.'}</p>
            <p className="mt-1 text-ink-soft">{prediction.reveal}</p>
            <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={onContinue}>
              Keep reading ↓
            </button>
          </div>
        )}
      </div>
      {!answered && !skipped && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted">Commit to a guess to reveal the rest of the chapter.</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onSkip}>
            Skip this question
          </button>
        </div>
      )}
    </aside>
  );
}

function MiniQuiz({ topic }: { topic: Topic }) {
  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState<ReturnType<typeof buildQuiz> | null>(null);
  const [result, setResult] = useState<QuizResult[] | null>(null);
  const start = () => {
    setQuestions(buildQuiz(topic.terms, 5, createRng(Date.now() + round), 'mixed'));
    setResult(null);
    setRound((r) => r + 1);
  };
  const finish = (res: QuizResult[]) => {
    setResult(res);
    setQuestions(null);
    recordQuiz({
      mode: 'story',
      topicIds: [topic.id],
      score: res.filter((r) => r.correct).length,
      total: res.length,
      missed: res.filter((r) => !r.correct).map((r) => r.question.termId),
    });
  };
  return (
    <section aria-labelledby="mini-quiz" className="my-10">
      <p className="kicker">Check yourself</p>
      <h2 id="mini-quiz" className="mt-1 text-3xl font-semibold">
        Mini-quiz: five questions on {topic.id}
      </h2>
      {questions ? (
        <div className="mt-4">
          <QuizRunner key={round} questions={questions} onFinish={finish} compact />
        </div>
      ) : result ? (
        <div className="panel mt-4 p-5">
          <p className="text-xl font-semibold">
            {result.filter((r) => r.correct).length} of {result.length} correct.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className="btn btn-secondary" onClick={start}>
              Try five more
            </button>
            <Link to={`/arcade/flashcards?topics=${topic.id}`} className="btn btn-ghost">
              Study {topic.id} flashcards
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-ink-soft">Wrong answers come from this same topic, so read closely. Your answers count toward mastery.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={start}>
            Start the mini-quiz
          </button>
        </div>
      )}
    </section>
  );
}

/** A study session: one card at a time, then a summary. */
import { type Dispatch, type Ref, type RefObject, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CARD, type Card } from '../lib/deck';
import { checkAnswer, hint, maxHint, type Verdict } from '../lib/match';
import { usePrefs } from '../lib/prefs';
import { type Item, type Session, answerCard, dropCard, firstTryCorrect, getSession, restoreCard, setSession, undoAnswer } from '../lib/session';
import { DAY, type Grade, cardKey, endOfDay, previewInterval } from '../lib/srs';
import { cardStatus } from '../lib/status';
import { commitProgress, getProgress, setExcluded, toggleStar, useProgress } from '../lib/store';
import { Icon } from '../ui/Icon';
import { toast } from '../ui/toast';
import { formatDuration, plural, StarButton, StatusPill } from './common';
import { Flashcard, type SwipeSide } from './Flashcard';

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

function speak(text: string) {
  if (!canSpeak) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[“”]/g, ''));
  u.lang = 'en-US';
  synth.speak(u);
}

function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = () => {
      if (document.visibilityState !== 'visible' || lock) return;
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          if (cancelled) void l.release();
          else {
            lock = l;
            l.addEventListener('release', () => {
              lock = null;
            });
          }
        })
        .catch(() => {});
    };
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', acquire);
      lock?.release().catch(() => {});
    };
  }, [enabled]);
}

const GRADES_BY_DIGIT: Grade[] = ['again', 'hard', 'good', 'easy'];

/** Map a key to a grade, or null. Practice: 1 / ← still learning, 2 / → know it. Spaced: 1–4, ← again, → good. */
function keyGrade(key: string, spaced: boolean): Grade | null {
  if (key === 'ArrowLeft') return 'again';
  if (key === 'ArrowRight') return 'good';
  if (spaced && /^[1-4]$/.test(key)) return GRADES_BY_DIGIT[Number(key) - 1];
  if (!spaced && (key === '1' || key === '2')) return key === '1' ? 'again' : 'good';
  return null;
}

function GradeBar({ session, item, onGrade, suggested }: { session: Session; item: Item; onGrade: (g: Grade) => void; suggested?: Grade }) {
  const progress = useProgress();
  if (session.spec.mode === 'practice') {
    return (
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Do you know it?">
        <button type="button" className="grade" data-tone="miss" data-suggested={suggested === 'again'} onClick={() => onGrade('again')}>
          <span className="inline-flex items-center gap-2">
            <Icon name="arrowLeft" size={18} />
            Still learning
          </span>
          <small>
            <span className="kbd">1</span>
          </small>
        </button>
        <button type="button" className="grade" data-tone="hit" data-suggested={suggested !== undefined && suggested !== 'again'} onClick={() => onGrade('good')}>
          <span className="inline-flex items-center gap-2">
            Know it
            <Icon name="arrowRight" size={18} />
          </span>
          <small>
            <span className="kbd">2</span>
          </small>
        </button>
      </div>
    );
  }
  const srs = progress.srs[cardKey(item.id, item.dir)];
  const now = Date.now();
  const buttons: { grade: Grade; label: string; tone?: 'miss' | 'hit' }[] = [
    { grade: 'again', label: 'Again', tone: 'miss' },
    { grade: 'hard', label: 'Hard' },
    { grade: 'good', label: 'Good', tone: 'hit' },
    { grade: 'easy', label: 'Easy' },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" role="group" aria-label="How well did you remember it?">
      {buttons.map((b, i) => (
        <button key={b.grade} type="button" className="grade" data-tone={b.tone} data-suggested={suggested === b.grade} onClick={() => onGrade(b.grade)}>
          <span>{b.label}</span>
          <small className="inline-flex items-center gap-1">
            <span className="sr-only">next review in </span>
            {previewInterval(srs, b.grade, now)} <span className="kbd">{i + 1}</span>
          </small>
        </button>
      ))}
    </div>
  );
}

interface Typed {
  value: string;
  verdict: Verdict | null;
  hints: number;
  /** "I was right" pressed after a wrong verdict. */
  override: boolean;
}

function suggestedGrade(t: Typed, spaced: boolean): Grade {
  if (t.verdict === 'wrong' && !t.override) return 'again';
  return t.hints > 0 && spaced ? 'hard' : 'good';
}

export function StudyView({
  session,
  onExit,
  onOpenHelp,
  onOpenSettings,
  onStudyAgain,
  onPracticeMissed,
}: {
  session: Session;
  onExit: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onStudyAgain: () => void;
  onPracticeMissed: (ids: string[]) => void;
}) {
  const prefs = usePrefs();
  const [live, setLive] = useState('');
  useWakeLock(prefs.wakeLock && !session.finishedAt);

  const item = session.queue[0];
  const card = item ? CARD.get(item.id) : undefined;

  const grade = useCallback(
    (g: Grade) => {
      const s = getSession();
      if (!s?.queue[0]) return;
      const r = answerCard(s, getProgress(), g, Date.now());
      commitProgress(r.progress);
      setSession(r.session);
      const next = r.session.queue[0];
      const nextCard = next && CARD.get(next.id);
      setLive(
        nextCard
          ? `${g === 'again' ? 'This card will come back soon.' : 'Done.'} ${r.session.done.length} of ${r.session.total} finished. Next ${next.dir === 'td' ? 'term' : 'definition'}: ${next.dir === 'td' ? nextCard.term : nextCard.def}`
          : 'Session complete.',
      );
    },
    [],
  );

  const undo = useCallback(() => {
    const s = getSession();
    const r = s && undoAnswer(s, getProgress());
    if (!r) {
      toast('Nothing to undo yet.');
      return;
    }
    commitProgress(r.progress);
    setSession(r.session);
    const c = CARD.get(r.session.queue[0].id)!;
    setLive(`Undone. Back to ${c.term}.`);
    toast(`Undid your answer for “${c.term}”.`);
  }, []);

  const hideCard = useCallback((it: Item) => {
    const s = getSession();
    if (!s) return;
    const c = CARD.get(it.id)!;
    setExcluded([it.id], true);
    setSession(dropCard(s, it.id, Date.now()));
    toast(`“${c.term}” is hidden from study.`, {
      label: 'Undo',
      run: () => {
        setExcluded([it.id], false);
        const latest = getSession();
        if (latest) setSession(restoreCard(latest, it));
      },
    });
  }, []);

  // Session-wide keys (the card's own keys live in <Turn>).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;
      const inField = !!(e.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]');
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'z' && !inField) {
        e.preventDefault();
        undo();
      } else if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        onExit();
      } else if (!inField && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '?') onOpenHelp();
        else if (e.key === 'u' || e.key === 'U') undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, onExit, onOpenHelp]);

  if (session.finishedAt || !card || !item) {
    return <Summary session={session} onExit={onExit} onStudyAgain={onStudyAgain} onPracticeMissed={onPracticeMissed} />;
  }

  const doneCount = session.done.length;
  const pct = session.total ? (doneCount / session.total) * 100 : 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="wrap flex items-center gap-1.5 pb-2 pt-[max(0.6rem,env(safe-area-inset-top))] sm:gap-2">
        <button type="button" className="btn btn-ghost btn-sm !px-2" onClick={onExit} title="End and save for later (Esc)">
          <Icon name="x" />
          <span className="hidden sm:inline">End</span>
          <span className="sr-only sm:hidden">End session</span>
        </button>
        <div className="mx-1 min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="min-w-0 truncate font-semibold">{session.spec.label}</span>
            <span className="tabular flex-none text-muted">
              {doneCount} / {session.total}
            </span>
          </div>
          <div className="progress-track mt-1" role="progressbar" aria-label="Cards finished" aria-valuemin={0} aria-valuemax={session.total} aria-valuenow={doneCount}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={undo} disabled={session.undo.length === 0} title="Undo last answer (U)">
          <Icon name="undo" />
          <span className="sr-only">Undo last answer</span>
        </button>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onOpenSettings} title="Settings">
          <Icon name="sliders" />
          <span className="sr-only">Settings</span>
        </button>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onOpenHelp} title="Shortcuts (?)">
          <Icon name="help" />
          <span className="sr-only">Help and shortcuts</span>
        </button>
      </header>

      <main id="main" className="wrap flex flex-1 flex-col items-center justify-center gap-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <h1 className="sr-only">Studying {session.spec.label}</h1>
        <Turn
          key={`${item.id}>${item.dir}#${session.answers}#${session.queue.length}`}
          session={session}
          item={item}
          card={card}
          onGrade={grade}
          onHide={hideCard}
          setLive={setLive}
        />
        <p className="sr-only" aria-live="polite">
          {live}
        </p>
      </main>
    </div>
  );
}

/** One card's turn. Keyed by card + answer count, so its state starts fresh for every card. */
function Turn({
  session,
  item,
  card,
  onGrade,
  onHide,
  setLive,
}: {
  session: Session;
  item: Item;
  card: Card;
  onGrade: (g: Grade) => void;
  onHide: (it: Item) => void;
  setLive: (s: string) => void;
}) {
  const prefs = usePrefs();
  const progress = useProgress();
  const typeMode = session.spec.answer === 'type';
  const spaced = session.spec.mode === 'spaced';
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState<Typed>({ value: '', verdict: null, hints: 0, override: false });
  const showRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const front = item.dir === 'td' ? card.term : card.def;
  const back = item.dir === 'td' ? card.def : card.term;
  const suggestion = typeMode && typed.verdict ? suggestedGrade(typed, spaced) : undefined;

  // Focus: the input in Type mode; otherwise follow the controls, but only if focus was already there.
  const focusIsOurs = () => {
    const a = document.activeElement;
    return !a || a === document.body || !!controlsRef.current?.contains(a);
  };
  useEffect(() => {
    if (typeMode) inputRef.current?.focus({ preventScroll: true });
    else if (focusIsOurs()) showRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    // After a flip, park focus on the controls group (not a grade button) so Space flips back instead of grading.
    if (!typeMode && focusIsOurs()) (revealed ? controlsRef.current : showRef.current)?.focus({ preventScroll: true });
  }, [revealed]);

  const flip = () => {
    setRevealed((r) => !r);
    if (!revealed) setLive(`Answer: ${back}`);
  };

  const check = (giveUp = false) => {
    if (typed.verdict) return;
    const verdict: Verdict = giveUp ? 'wrong' : checkAnswer(typed.value, card);
    setTyped((t) => ({ ...t, verdict }));
    setRevealed(true);
    setLive(verdict === 'correct' ? `Correct: ${card.term}` : verdict === 'close' ? `Almost. The answer is ${card.term}` : `The answer is ${card.term}`);
  };

  // Card keys: Space flips, Enter flips then accepts, arrows and digits grade, S stars, R reads aloud.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('dialog[open]') || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return; // the answer field has its own keys
      const k = e.key;
      if (k === 's' || k === 'S') return toggleStar(card.id);
      if (k === 'r' || k === 'R') return speak(revealed ? `${front}. ${back}` : front);
      if (typeMode && !typed.verdict) {
        if (k.length === 1 && /\S/.test(k)) inputRef.current?.focus(); // start typing anywhere
        return;
      }
      if (t.closest('button') && (k === ' ' || k === 'Enter')) return; // the focused button handles it
      if (k === ' ') {
        e.preventDefault();
        if (!typeMode) flip();
        return;
      }
      if (k === 'Enter') {
        e.preventDefault();
        if (!revealed) flip();
        else onGrade(suggestion ?? 'good');
        return;
      }
      const g = keyGrade(k, spaced);
      if (g) {
        e.preventDefault();
        onGrade(g === 'good' && suggestion && suggestion !== 'again' ? suggestion : g);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const tools = (
    <>
      {canSpeak && (
        <button type="button" className="btn btn-ghost btn-icon btn-sm text-muted" title="Read aloud (R)" onClick={() => speak(revealed ? `${front}. ${back}` : front)}>
          <Icon name="volume" size={18} />
          <span className="sr-only">Read aloud</span>
        </button>
      )}
      <button type="button" className="btn btn-ghost btn-icon btn-sm text-muted" title="Hide this card from study" onClick={() => onHide(item)}>
        <Icon name="eyeOff" size={18} />
        <span className="sr-only">Hide this card from study</span>
      </button>
      <StarButton id={card.id} on={!!progress.starred[card.id]} term={card.term} />
    </>
  );

  return (
    <>
      <div className="fc-enter h-[min(56dvh,27rem)] w-full max-w-[44rem]">
        <Flashcard
          card={card}
          dir={item.dir}
          revealed={revealed}
          onFlip={typeMode && !typed.verdict ? () => inputRef.current?.focus() : flip}
          onSwipe={(side: SwipeSide) => {
            if (typeMode && !typed.verdict) return;
            onGrade(side === 'right' ? (suggestion && suggestion !== 'again' ? suggestion : 'good') : 'again');
          }}
          swipeLabels={spaced ? { left: 'Again', right: 'Good' } : { left: 'Still learning', right: 'Know it' }}
          tools={tools}
          showYawp={prefs.showYawp}
          flipHint={!typeMode}
          frontExtra={
            typeMode && typed.hints > 0 && !typed.verdict ? (
              <p className="mt-5 text-lg">
                <span className="sr-only">Hint: </span>
                <span className="hint-text">{hint(card.term, typed.hints)}</span>
              </p>
            ) : undefined
          }
        />
      </div>

      <div ref={controlsRef} tabIndex={-1} className="w-full max-w-[44rem] rounded-xl outline-none" aria-label="Answer controls" role="group">
        {typeMode ? (
          <TypePanel
            card={card}
            typed={typed}
            setTyped={setTyped}
            onCheck={check}
            inputRef={inputRef}
            onGrade={onGrade}
            suggestion={suggestion}
            session={session}
            item={item}
          />
        ) : revealed ? (
          <GradeBar session={session} item={item} onGrade={onGrade} />
        ) : (
          <div className="grid gap-2">
            <button ref={showRef} type="button" className="btn btn-secondary btn-lg w-full" onClick={flip}>
              <Icon name="flip" size={18} />
              Show answer <span className="kbd">Space</span>
            </button>
            <p className="text-center text-xs text-muted">
              <span className="hidden [@media(hover:hover)]:inline">
                Or grade right away: <span className="kbd">←</span> {spaced ? 'again' : 'still learning'} · <span className="kbd">→</span> {spaced ? 'good' : 'know it'}
              </span>
              <span className="[@media(hover:hover)]:hidden">Swipe right if you know it, left if you don’t.</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function TypePanel({
  card,
  typed,
  setTyped,
  onCheck,
  inputRef,
  onGrade,
  suggestion,
  session,
  item,
}: {
  card: Card;
  typed: Typed;
  setTyped: Dispatch<SetStateAction<Typed>>;
  onCheck: (giveUp?: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  onGrade: (g: Grade) => void;
  suggestion?: Grade;
  session: Session;
  item: Item;
}) {
  const checked = !!typed.verdict;
  const wrong = typed.verdict === 'wrong' && !typed.override;
  const spaced = session.spec.mode === 'spaced';
  const verdictText =
    typed.verdict === 'correct'
      ? 'Correct!'
      : typed.verdict === 'close'
        ? 'Almost. Check the spelling.'
        : typed.override
          ? 'Counted as correct.'
          : typed.value.trim()
            ? 'Not quite.'
            : 'Here’s the answer.';
  return (
    <div className="grid gap-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!checked) onCheck();
          else if (suggestion) onGrade(suggestion);
        }}
      >
        <label htmlFor="answer" className="sr-only">
          Type the term
        </label>
        <input
          ref={inputRef as Ref<HTMLInputElement>}
          id="answer"
          className={`field flex-1 text-lg ${checked ? (wrong ? '!border-oxblood' : '!border-teal') : ''}`}
          placeholder="Type the term…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint={checked ? 'next' : 'done'}
          value={typed.value}
          readOnly={checked}
          onChange={(e) => setTyped((t) => ({ ...t, value: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && typed.value && !checked) {
              e.preventDefault(); // clears the field instead of ending the session
              setTyped((t) => ({ ...t, value: '' }));
              return;
            }
            if (!checked) return;
            // After checking, the field keeps focus so the keyboard can grade.
            const g = keyGrade(e.key, spaced);
            if (!g) return;
            e.preventDefault();
            onGrade(g === 'good' && suggestion && suggestion !== 'again' ? suggestion : g);
          }}
        />
        {!checked && (
          <button type="submit" className="btn btn-primary">
            Check
          </button>
        )}
      </form>

      {!checked ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={typed.hints >= maxHint(card.term)}
            onClick={() => {
              setTyped((t) => ({ ...t, hints: t.hints + 1 }));
              inputRef.current?.focus();
            }}
          >
            <Icon name="bulb" size={16} />
            {typed.hints === 0 ? 'Hint' : 'Another letter'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onCheck(true)}>
            I don’t know
          </button>
          <p className="ml-auto hidden text-xs text-muted [@media(hover:hover)]:block">
            <span className="kbd">Enter</span> to check
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className={`font-semibold ${wrong ? 'text-oxblood' : 'text-teal'}`}>{verdictText}</span>
            {typed.verdict !== 'correct' && typed.value.trim() && <span className="text-muted">You typed “{typed.value.trim()}”.</span>}
            {wrong && typed.value.trim() && (
              <button
                type="button"
                className="btn btn-ghost btn-sm ml-auto !min-h-8"
                onClick={() => {
                  setTyped((t) => ({ ...t, override: true }));
                  inputRef.current?.focus();
                }}
              >
                I was right
              </button>
            )}
          </div>
          <GradeBar session={session} item={item} onGrade={onGrade} suggested={suggestion} />
          <p className="hidden text-center text-xs text-muted [@media(hover:hover)]:block">
            <span className="kbd">Enter</span> accepts the highlighted choice
          </p>
        </>
      )}
    </div>
  );
}

function Summary({ session, onExit, onStudyAgain, onPracticeMissed }: { session: Session; onExit: () => void; onStudyAgain: () => void; onPracticeMissed: (ids: string[]) => void }) {
  const progress = useProgress();
  const firstRight = firstTryCorrect(session);
  const seen = Object.keys(session.first).length;
  const pct = seen ? Math.round((firstRight / seen) * 100) : 0;
  const missed = session.missed.filter((id) => CARD.has(id));
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  const dueTomorrow = useMemo(() => {
    const until = endOfDay(Date.now() + DAY);
    return session.done.filter((id) =>
      (['td', 'dt'] as const).some((d) => {
        const c = progress.srs[cardKey(id, d)];
        return c && c.due <= until;
      }),
    ).length;
  }, [session.done, progress.srs]);

  return (
    <main id="main" className="wrap max-w-3xl py-10">
      <p className="kicker">Session complete</p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-3xl font-semibold outline-none sm:text-4xl">
        {seen === 0 ? 'Session complete.' : pct >= 90 ? 'Excellent work.' : pct >= 70 ? 'Nice work.' : 'Good practice.'}
      </h1>
      <p className="mt-1 text-ink-soft">{session.spec.label}</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Cards', String(session.total)],
          ['Right first try', seen ? `${firstRight} (${pct}%)` : '—'],
          ['Answers', String(session.answers)],
          ['Time', formatDuration(session.activeMs)],
        ].map(([k, v]) => (
          <div key={k} className="panel px-4 py-3">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="tabular mt-0.5 text-xl font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      {session.spec.mode === 'spaced' && session.done.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          {dueTomorrow > 0 ? `${plural(dueTomorrow, 'card')} from this session will be due again by tomorrow.` : 'Everything here is scheduled for later days. Come back when cards are due.'}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {missed.length > 0 && (
          <button type="button" className="btn btn-primary btn-lg" onClick={() => onPracticeMissed(missed)}>
            <Icon name="play" filled size={16} />
            Practice the {plural(missed.length, 'missed card')}
          </button>
        )}
        <button type="button" className={`btn ${missed.length ? 'btn-secondary' : 'btn-primary'} btn-lg`} onClick={onStudyAgain}>
          <Icon name="flip" size={18} />
          Study again
        </button>
        <button type="button" className="btn btn-ghost btn-lg" onClick={onExit}>
          Back to baskets
        </button>
      </div>

      {missed.length > 0 && (
        <section aria-labelledby="missed-h" className="mt-10">
          <h2 id="missed-h" className="text-xl font-semibold">
            Cards you missed
          </h2>
          <ul className="mt-2">
            {missed.map((id) => {
              const c = CARD.get(id)!;
              return (
                <li key={id} className="flex gap-3 border-b border-rule py-3 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[1.06rem] font-semibold">{c.term}</h3>
                    <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">{c.def}</p>
                    <p className="mt-1.5">
                      <StatusPill status={cardStatus(progress, id)} />
                    </p>
                  </div>
                  <StarButton id={id} on={!!progress.starred[id]} term={c.term} />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}

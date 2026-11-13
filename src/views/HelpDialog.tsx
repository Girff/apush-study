import { MASTERED_DAYS } from '../lib/status';
import { Dialog } from '../ui/Dialog';
import { MeterLegend } from './common';

const KEYS: [string, string][] = [
  ['Space', 'Flip the card'],
  ['Enter', 'Flip, then “Know it” / “Good”'],
  ['← or 1', 'Still learning (Practice) · Again (Spaced)'],
  ['→ or 2', 'Know it (Practice)'],
  ['1 2 3 4', 'Again · Hard · Good · Easy (Spaced)'],
  ['U or Ctrl+Z', 'Undo the last answer'],
  ['S', 'Star or unstar the card'],
  ['R', 'Read the card aloud'],
  ['Esc', 'End the session (it’s saved, so you can resume)'],
  ['/', 'Search cards (home screen)'],
  ['?', 'This help'],
];

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="How it works" scrollFocus>
      <div className="grid gap-6 text-[0.95rem] leading-relaxed">
        <section>
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Choosing cards</h3>
          <p className="mt-2">
            Cards are sorted into baskets by topic. Tap baskets to select them, then press Start. Each basket’s <strong>Study</strong> button starts it on its own, and{' '}
            <strong>Cards</strong> lists everything in it. Uncheck a card to hide it from study, and star the ones you want to focus on.
          </p>
        </section>
        <section>
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Two ways to study</h3>
          <ul className="mt-2 grid gap-2">
            <li>
              <strong>Practice</strong>: go through any cards and sort them into “Know it” and “Still learning.” Missed cards come back a few cards later
              until you get them, so a session ends when you know every card.
            </li>
            <li>
              <strong>Spaced review</strong>: shows cards when they’re due. Grade each one Again, Hard, Good or Easy; the better you know a card, the
              longer until you see it again (1 day, then about 6, then weeks). Best done a little every day.
            </li>
          </ul>
          <p className="mt-2 text-sm text-muted">
            Both modes share one schedule: a miss in Practice brings a card back sooner in Spaced review, too.
          </p>
        </section>
        <section>
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">What the colors mean</h3>
          <MeterLegend className="mt-2 !text-sm" />
          <ul className="mt-2 grid gap-1 text-sm">
            <li>
              <strong>New</strong>: not studied yet.
            </li>
            <li>
              <strong>Learning</strong>: missed the last time you saw it.
            </li>
            <li>
              <strong>Known</strong>: you got it right; it comes back within three weeks.
            </li>
            <li>
              <strong>Mastered</strong>: right across spaced reviews, so it’s next due {MASTERED_DAYS}+ days out.
            </li>
            <li>
              <strong>Weak</strong> (a filter): cards you’re still learning, or forgot at least twice.
            </li>
          </ul>
        </section>
        <section>
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">Keyboard</h3>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            {KEYS.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-semibold tabular">{k}</dt>
                <dd className="text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">On a phone</h3>
          <p className="mt-2">
            Tap the card to flip it. Swipe right if you know it, left if you don’t. Add the site to your home screen to study offline.
          </p>
        </section>
        <section>
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted">About the cards</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Every definition was checked and rewritten as a complete, standalone answer, keyed to <cite>The American Yawp</cite> (chapters 7–11). A few
            standard Unit 4 terms that weren’t on the original list, like the Marshall Court cases, were added. Turn on textbook references in Settings to see
            each card’s source.
          </p>
        </section>
      </div>
    </Dialog>
  );
}

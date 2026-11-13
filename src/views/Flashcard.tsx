/** The card itself: two faces, a 3D flip (crossfade with reduced motion) and drag-to-swipe. */
import { type ReactNode, useRef, useState } from 'react';
import { BASKET, type Card } from '../lib/deck';
import type { Direction } from '../lib/srs';

export type SwipeSide = 'left' | 'right';

const SWIPE_COMMIT = 96;
const DRAG_START = 8;

function Face({ side, label, basket, children, tools, away }: { side: 'front' | 'back'; label: string; basket: string; children: ReactNode; tools: ReactNode; away: boolean }) {
  // The face turned away is inert: not read aloud by screen readers and its buttons can't be tabbed to.
  return (
    <div className={`fc-face fc-${side}`} inert={away} aria-hidden={away}>
      <div className="flex items-center gap-2 px-4 pb-1 pt-3 sm:px-5">
        <span className="kicker !text-[0.68rem]">{label}</span>
        <span className="min-w-0 truncate text-xs text-muted">· {basket}</span>
        <span className="ml-auto flex items-center">{tools}</span>
      </div>
      <div className="fc-scroll">
        <div className="fc-content">{children}</div>
      </div>
    </div>
  );
}

export function Flashcard({
  card,
  dir,
  revealed,
  onFlip,
  onSwipe,
  swipeLabels,
  tools,
  showYawp,
  frontExtra,
  flipHint = true,
}: {
  card: Card;
  dir: Direction;
  revealed: boolean;
  onFlip: () => void;
  onSwipe: (side: SwipeSide) => void;
  swipeLabels: Record<SwipeSide, string>;
  tools: ReactNode;
  showYawp: boolean;
  /** Shown under the prompt on the front face (Type mode hint). */
  frontExtra?: ReactNode;
  /** Show the "tap to flip" line on the front. */
  flipHint?: boolean;
}) {
  const basket = BASKET.get(card.basket)!.title;
  const termFirst = dir === 'td';
  const [drag, setDrag] = useState(0);
  const start = useRef<{ x: number; y: number; id: number; dragging: boolean } | null>(null);
  const moved = useRef(false);

  const term = (
    <p className="fc-term" data-len={card.term.length > 34 ? 'long' : undefined}>
      {card.term}
    </p>
  );
  const def = (
    <>
      <p className="fc-def" data-len={card.def.length > 190 ? 'long' : undefined}>
        {card.def}
      </p>
      {showYawp && <p className="mt-3 text-xs text-muted">{card.yawp ? `American Yawp ${card.yawp}` : 'Added for full Unit 4 coverage'}</p>}
    </>
  );

  const side: SwipeSide | null = drag > 0 ? 'right' : drag < 0 ? 'left' : null;
  const strength = Math.min(1, Math.abs(drag) / SWIPE_COMMIT);

  return (
    <div
      className="fc-stage relative h-full w-full select-none"
      style={{
        transform: drag ? `translateX(${drag}px) rotate(${drag / 28}deg)` : undefined,
        transition: drag ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, dragging: false };
        moved.current = false;
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s || s.id !== e.pointerId) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (!s.dragging) {
          if (Math.abs(dx) < DRAG_START || Math.abs(dx) < Math.abs(dy)) {
            if (Math.abs(dy) > DRAG_START) start.current = null; // a vertical scroll, not a swipe
            return;
          }
          s.dragging = true;
          moved.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }
        setDrag(dx);
      }}
      onPointerUp={(e) => {
        const s = start.current;
        start.current = null;
        if (!s || s.id !== e.pointerId) return;
        if (s.dragging) {
          const dx = e.clientX - s.x;
          setDrag(0);
          if (Math.abs(dx) >= SWIPE_COMMIT) onSwipe(dx > 0 ? 'right' : 'left');
        }
      }}
      onPointerCancel={() => {
        start.current = null;
        setDrag(0);
      }}
      onClick={(e) => {
        if (moved.current) {
          moved.current = false;
          return;
        }
        // Don't flip when a button or link on the card was the target.
        if ((e.target as HTMLElement).closest('button, a, input')) return;
        onFlip();
      }}
    >
      <div className="fc-card" data-flipped={revealed}>
        <Face side="front" label={termFirst ? 'Term' : 'Definition'} basket={basket} tools={tools} away={revealed}>
          {termFirst ? term : def}
          {frontExtra}
          {flipHint && !revealed && (
            <p className="mt-6 text-xs text-muted" aria-hidden="true">
              <span className="[@media(hover:hover)]:hidden">Tap to flip</span>
              <span className="hidden [@media(hover:hover)]:inline">Click or press Space to flip</span>
            </p>
          )}
        </Face>
        <Face side="back" label={termFirst ? 'Definition' : 'Term'} basket={basket} tools={tools} away={!revealed}>
          {termFirst ? def : term}
        </Face>
      </div>
      {side && (
        <div className="fc-swipe" data-side={side} style={{ opacity: strength }} aria-hidden="true">
          <span className="rounded-md bg-card px-2 py-1">{swipeLabels[side]}</span>
        </div>
      )}
    </div>
  );
}

/** Card rows (used by search results and the card list) and the card list dialog. */
import { useMemo, useState } from 'react';
import { BASKET, CARD, type Card } from '../lib/deck';
import { usePrefs } from '../lib/prefs';
import { highlight } from '../lib/search';
import { cardStatus } from '../lib/status';
import { type Progress, setExcluded, setStarred, toggleExcluded, useProgress } from '../lib/store';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { StarButton, StatusPill, plural } from './common';

function Marked({ text, query }: { text: string; query?: string }) {
  if (!query) return <>{text}</>;
  return (
    <>
      {highlight(text, query).map((part, i) => (part.hit ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>))}
    </>
  );
}

export function CardRow({ card, progress, query, hideDef = false, showBasket = false }: { card: Card; progress: Progress; query?: string; hideDef?: boolean; showBasket?: boolean }) {
  const prefs = usePrefs();
  const [revealed, setRevealed] = useState(false);
  const included = !progress.excluded[card.id];
  const status = cardStatus(progress, card.id);
  const stat = progress.stats[card.id];
  const showDef = !hideDef || revealed;
  return (
    <li className={`flex gap-3 border-b border-rule py-3 last:border-b-0 ${included ? '' : 'opacity-60'}`}>
      <label className="mt-0.5 flex-none cursor-pointer" title={included ? 'Included in study. Uncheck to hide this card.' : 'Hidden from study. Check to include it.'}>
        <input type="checkbox" className="peer sr-only" checked={included} onChange={() => toggleExcluded(card.id)} />
        <span className="check" aria-hidden="true">
          {included && <Icon name="check" size={14} />}
        </span>
        <span className="sr-only">Include {card.term} in study</span>
      </label>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="font-display text-[1.06rem] font-semibold leading-snug">
            <Marked text={card.term} query={query} />
          </h3>
          {!included && <span className="text-xs font-semibold text-muted">Hidden</span>}
        </div>
        {showDef ? (
          <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">
            <Marked text={card.def} query={query} />
          </p>
        ) : (
          <button type="button" className="mt-1 rounded-md border border-dashed border-rule-strong px-2.5 py-1 text-sm text-muted hover:border-ink hover:text-ink" onClick={() => setRevealed(true)}>
            Show definition
          </button>
        )}
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <StatusPill status={status} />
          {showBasket && <span>{BASKET.get(card.basket)!.title}</span>}
          {stat && stat.seen > 0 && <span>{stat.missed === 0 ? `${plural(stat.seen, 'answer')}, none missed` : `Missed ${stat.missed} of ${stat.seen}`}</span>}
          {prefs.showYawp && <span>{card.yawp ? `Yawp ${card.yawp}` : 'Added for Unit 4 coverage'}</span>}
        </p>
      </div>
      <div className="flex-none">
        <StarButton id={card.id} on={!!progress.starred[card.id]} term={card.term} />
      </div>
    </li>
  );
}

export type ListSpec = { kind: 'basket'; basketId: string } | { kind: 'starred' } | { kind: 'hidden' };

type Sort = 'deck' | 'az' | 'weak';

export function listTitle(spec: ListSpec): string {
  if (spec.kind === 'basket') return BASKET.get(spec.basketId)!.title;
  return spec.kind === 'starred' ? 'Starred cards' : 'Hidden cards';
}

export function CardListDialog({ spec, onClose, onStudy }: { spec: ListSpec; onClose: () => void; onStudy: (ids: string[], label: string) => void }) {
  const progress = useProgress();
  const [sort, setSort] = useState<Sort>('deck');
  const [hideDefs, setHideDefs] = useState(false);

  // Computed once per list, so cards don't vanish while the user un-stars or un-hides them.
  const [ids] = useState(() => {
    if (spec.kind === 'basket') return BASKET.get(spec.basketId)!.cardIds;
    const flags = spec.kind === 'starred' ? progress.starred : progress.excluded;
    return Object.keys(flags)
      .filter((id) => CARD.has(id))
      .sort((a, b) => CARD.get(a)!.index - CARD.get(b)!.index);
  });

  const cards = useMemo(() => {
    const list = ids.map((id) => CARD.get(id)!);
    if (sort === 'az') return [...list].sort((a, b) => a.term.replace(/^[“"]/, '').localeCompare(b.term.replace(/^[“"]/, '')));
    if (sort === 'weak') {
      // Weakest first: learning, then new, known, mastered; most-missed first within each.
      const order: Record<string, number> = { learning: 0, new: 1, known: 2, mastered: 3 };
      return [...list].sort(
        (a, b) =>
          order[cardStatus(progress, a.id)] - order[cardStatus(progress, b.id)] ||
          (progress.stats[b.id]?.missed ?? 0) - (progress.stats[a.id]?.missed ?? 0) ||
          a.index - b.index,
      );
    }
    return list;
  }, [ids, sort, progress]);

  const basket = spec.kind === 'basket' ? BASKET.get(spec.basketId)! : null;
  const includedIds = ids.filter((id) => !progress.excluded[id]);
  const hiddenHere = ids.length - includedIds.length;
  const title = listTitle(spec);

  return (
    <Dialog
      open
      wide
      onClose={onClose}
      title={title}
      subtitle={
        basket ? (
          <>
            {basket.years} · {plural(ids.length, 'card')} · {basket.blurb}
          </>
        ) : (
          plural(ids.length, 'card')
        )
      }
      footer={
        <div className="flex flex-wrap items-center gap-3">
          {spec.kind !== 'hidden' ? (
            <button type="button" className="btn btn-primary" disabled={includedIds.length === 0} onClick={() => onStudy(includedIds, title)}>
              <Icon name="play" filled size={16} />
              Practice {includedIds.length === ids.length ? 'these' : 'the'} {plural(includedIds.length, 'card')}
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" disabled={hiddenHere === 0} onClick={() => setExcluded(ids, false)}>
              <Icon name="eye" size={18} />
              Show all in study again
            </button>
          )}
          {spec.kind === 'starred' && ids.length > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStarred(ids, false)}>
              Unstar all
            </button>
          )}
          {spec.kind === 'basket' && hiddenHere > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setExcluded(ids, false)}>
              Include all {ids.length}
            </button>
          )}
          <p className="text-xs text-muted sm:ml-auto">Uncheck a card to hide it from study.</p>
        </div>
      }
    >
      {ids.length === 0 ? (
        <p className="py-8 text-center text-muted">
          {spec.kind === 'starred' ? 'No starred cards yet. Tap the star on any card to save it here.' : 'No hidden cards. Every card is included in study.'}
        </p>
      ) : (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sort</span>
              <select className="field !min-h-9 w-auto py-1 text-sm" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="deck">Deck order</option>
                <option value="az">A–Z</option>
                <option value="weak">Weakest first</option>
              </select>
            </label>
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="switch" checked={hideDefs} onChange={(e) => setHideDefs(e.target.checked)} />
              Hide definitions (self-test)
            </label>
          </div>
          <ul key={hideDefs ? 'hidden' : 'shown'}>
            {cards.map((c) => (
              <CardRow key={c.id} card={c} progress={progress} hideDef={hideDefs} showBasket={spec.kind !== 'basket'} />
            ))}
          </ul>
        </>
      )}
    </Dialog>
  );
}

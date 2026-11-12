/**
 * A list the student can reorder by dragging a handle (mouse or touch), with
 * the up/down buttons, or from the keyboard: focus a handle and press ↑/↓.
 * Every move is announced to screen readers.
 */
import { Reorder, useDragControls } from 'framer-motion';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface ReorderListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  label: string;
  disabled?: boolean;
  itemClassName?: (item: T, index: number) => string;
  onRemove?: (item: T) => void;
}

export function ReorderList<T>({ items, getKey, getLabel, onChange, renderItem, label, disabled, itemClassName, onRemove }: ReorderListProps<T>) {
  const [announcement, setAnnouncement] = useState('');
  const focusKey = useRef<string | null>(null);
  const handles = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (focusKey.current) {
      handles.current.get(focusKey.current)?.focus();
      focusKey.current = null;
    }
  });

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = items.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    focusKey.current = getKey(it);
    onChange(next);
    setAnnouncement(`${getLabel(it)} moved to position ${to + 1} of ${items.length}.`);
  };

  return (
    <div>
      <Reorder.Group as="ol" axis="y" values={items} onReorder={disabled ? () => {} : onChange} aria-label={label} className="grid gap-2">
        {items.map((item, i) => (
          <Row
            key={getKey(item)}
            item={item}
            index={i}
            count={items.length}
            label={getLabel(item)}
            disabled={disabled}
            className={itemClassName?.(item, i) ?? ''}
            onMove={(to) => move(i, to)}
            onRemove={onRemove ? () => onRemove(item) : undefined}
            handleRef={(el) => {
              if (el) handles.current.set(getKey(item), el);
              else handles.current.delete(getKey(item));
            }}
          >
            {renderItem(item, i)}
          </Row>
        ))}
      </Reorder.Group>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

function Row<T>({
  item,
  index,
  count,
  label,
  disabled,
  className,
  onMove,
  onRemove,
  handleRef,
  children,
}: {
  item: T;
  index: number;
  count: number;
  label: string;
  disabled?: boolean;
  className: string;
  onMove: (to: number) => void;
  onRemove?: () => void;
  handleRef: (el: HTMLButtonElement | null) => void;
  children: ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="li"
      value={item}
      dragListener={false}
      dragControls={controls}
      className={`panel flex items-center gap-2 p-2 pr-2 sm:gap-3 ${className}`}
      whileDrag={{ scale: 1.02, boxShadow: '0 18px 30px -16px rgba(0,0,0,0.45)' }}
    >
      <button
        ref={handleRef}
        type="button"
        disabled={disabled}
        aria-label={`${label}, position ${index + 1} of ${count}. Drag, or press the up and down arrow keys, to move.`}
        className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted hover:bg-sunk hover:text-ink active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
        onPointerDown={(e) => !disabled && controls.start(e)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            onMove(index - 1);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            onMove(index + 1);
          }
        }}
      >
        <svg viewBox="0 0 12 20" className="h-5 w-3" aria-hidden="true" fill="currentColor">
          {[4, 10, 16].map((y) => (
            <g key={y}>
              <circle cx="3" cy={y} r="1.6" />
              <circle cx="9" cy={y} r="1.6" />
            </g>
          ))}
        </svg>
      </button>
      <span className="w-6 shrink-0 text-center font-display text-lg font-bold tabular text-muted" aria-hidden="true">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
        <button type="button" className="btn-ghost rounded px-2 py-1 text-sm disabled:opacity-30" disabled={disabled || index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} up`}>
          ↑
        </button>
        <button
          type="button"
          className="btn-ghost rounded px-2 py-1 text-sm disabled:opacity-30"
          disabled={disabled || index === count - 1}
          onClick={() => onMove(index + 1)}
          aria-label={`Move ${label} down`}
        >
          ↓
        </button>
        {onRemove && (
          <button type="button" className="btn-ghost rounded px-2 py-1 text-sm disabled:opacity-30" disabled={disabled} onClick={onRemove} aria-label={`Remove ${label}`}>
            ✕
          </button>
        )}
      </div>
    </Reorder.Item>
  );
}

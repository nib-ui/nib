export type Key = string;

/** An item a keyboard can land on; disabled items are skipped, never removed. */
export interface Navigable {
  key: Key;
  disabled?: boolean;
}

export type Direction = 'next' | 'prev' | 'first' | 'last';

/**
 * The key the keyboard lands on when moving from `from` in `direction`. Disabled items are skipped;
 * at an edge the position stays put unless `loop` is set. A missing or unknown `from` enters the
 * list at its first (next) or last (prev) enabled item. Returns null when nothing is enabled.
 */
export function move(
  items: readonly Navigable[],
  from: Key | null,
  direction: Direction,
  { loop = false }: { loop?: boolean } = {},
): Key | null {
  const enabled = items.filter((item) => !item.disabled).map((item) => item.key);
  if (enabled.length === 0) return null;
  const first = enabled[0] ?? null;
  const last = enabled[enabled.length - 1] ?? null;
  if (direction === 'first') return first;
  if (direction === 'last') return last;

  const at = from === null ? -1 : items.findIndex((item) => item.key === from);
  if (at === -1) return direction === 'next' ? first : last;

  const step = direction === 'next' ? 1 : -1;
  for (let i = at + step; i >= 0 && i < items.length; i += step) {
    const item = items[i];
    if (item && !item.disabled) return item.key;
  }
  if (loop) return direction === 'next' ? first : last;
  // At the edge: stay on the current item if it is enabled, else fall back to the nearest end.
  return items[at]?.disabled ? (direction === 'next' ? last : first) : from;
}

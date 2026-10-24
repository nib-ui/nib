import type { Key } from '../parts/navigation.ts';

export interface Matchable {
  key: Key;
  label: string;
  disabled?: boolean;
}

export type FilterMode = 'contains' | 'startsWith' | 'none';

/** Where `query` sits in `label`, ignoring case and diacritics; null when it does not. */
export type MatchRange = { start: number; end: number } | null;

/**
 * A matcher for one locale: `tieng` matches "Tiếng Việt", `ha noi` matches "Hà Nội". Labels and
 * queries are compared character by character in NFC, so a match maps back to label positions.
 */
export function createMatcher(locale: string) {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', usage: 'search' });
  const range = (label: string, query: string, mode: FilterMode): MatchRange => {
    const text = label.normalize('NFC');
    const q = query.normalize('NFC').trim();
    if (!q) return { start: 0, end: 0 };
    const last = mode === 'startsWith' ? 0 : text.length - q.length;
    for (let start = 0; start <= last; start++) {
      if (collator.compare(text.slice(start, start + q.length), q) === 0) return { start, end: start + q.length };
    }
    return null;
  };
  return {
    range,
    /** The items that match, in their order; every item when the query is empty or mode is none. */
    filter<T extends Matchable>(items: readonly T[], query: string, mode: FilterMode): T[] {
      if (mode === 'none' || !query.trim()) return [...items];
      return items.filter((item) => range(item.label, query, mode) !== null);
    },
  };
}

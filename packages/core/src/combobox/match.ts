import type { Key } from '../parts/navigation.ts';

export interface Matchable {
  key: Key;
  label: string;
  disabled?: boolean;
}

export type FilterMode = 'contains' | 'startsWith' | 'none';

/** Where `query` sits in `label`, ignoring case and diacritics; null when it does not. */
export type MatchRange = { start: number; end: number } | null;

// A label folded once: marks stripped, lower case, and where each folded character came from.
interface Folded {
  text: string;
  /** NFC label. */
  source: string;
  /** For each folded UTF-16 unit, the index of its character in `source`. */
  at: number[];
  /** For each folded UTF-16 unit, the index just past its character in `source`. */
  end: number[];
}

// Letters with a stroke rather than a combining mark, which NFD leaves whole.
const STROKES: Record<string, string> = { đ: 'd', ł: 'l', ø: 'o', ħ: 'h' };

/**
 * A matcher for one locale: `tieng` matches "Tiếng Việt", `ha noi` matches "Hà Nội". A fast fold
 * (NFD, marks stripped, lower case) finds candidates; the locale's collator confirms each one, so
 * a language where å is its own letter (Swedish) does not match it to a. Folded labels are cached:
 * a keystroke costs one indexOf per label.
 */
export function createMatcher(locale: string) {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', usage: 'search' });
  const cache = new Map<string, Folded>();
  const fold = (label: string): Folded => {
    const hit = cache.get(label);
    if (hit) return hit;
    const source = label.normalize('NFC');
    const folded: Folded = { text: '', source, at: [], end: [] };
    let i = 0;
    for (const ch of source) {
      const lower = ch.toLocaleLowerCase(locale);
      const f = STROKES[lower] ?? lower.normalize('NFD').replace(/\p{M}/gu, '');
      folded.text += f;
      for (let n = 0; n < f.length; n++) {
        folded.at.push(i);
        folded.end.push(i + ch.length);
      }
      i += ch.length;
    }
    // Labels come from one list: a cap keeps a long-lived page from growing it without end.
    if (cache.size > 20_000) cache.clear();
    cache.set(label, folded);
    return folded;
  };

  const range = (label: string, query: string, mode: FilterMode): MatchRange => {
    const q = query.normalize('NFC').trim();
    if (!q) return { start: 0, end: 0 };
    const l = fold(label);
    const fq = fold(q).text;
    for (let pos = l.text.indexOf(fq); pos !== -1; pos = l.text.indexOf(fq, pos + 1)) {
      if (mode === 'startsWith' && pos > 0) return null;
      const start = l.at[pos]!;
      const end = l.end[pos + fq.length - 1]!;
      if (collator.compare(l.source.slice(start, end), q) === 0) return { start, end };
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

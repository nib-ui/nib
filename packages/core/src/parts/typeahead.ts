import type { Clock } from '../host.ts';
import type { Key, Navigable } from './navigation.ts';

export interface Labelled extends Navigable {
  label: string;
}

export interface Typeahead {
  /** Adds one typed character; returns the key to move to, or null when nothing matches. */
  type(char: string, items: readonly Labelled[], current: Key | null): Key | null;
  reset(): void;
}

// The APG pause after which typing starts a new search.
const RESET_MS = 500;

/**
 * Type-to-find for lists. Matching ignores case and diacritics in the given locale, so `tieng`
 * finds "Tiếng Việt". Repeating one letter cycles through the items that start with it.
 */
export function createTypeahead({ clock, locale }: { clock: Clock; locale: string }): Typeahead {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', usage: 'search' });
  let buffer = '';
  let cancel = () => undefined as void;

  const startsWith = (label: string, text: string) => {
    const nfc = label.normalize('NFC');
    return nfc.length >= text.length && collator.compare(nfc.slice(0, text.length), text) === 0;
  };

  return {
    type(char, items, current) {
      // NFC so decomposed input or labels (e + combining marks) line up character for character.
      const typed = char.normalize('NFC');
      if (!typed) return null;
      cancel();
      buffer += typed;
      cancel = clock.after(RESET_MS, () => (buffer = ''));
      // "bbb" (or "Bb") means "the next item starting with b", not an item starting with "bbb".
      const [first = '', ...rest] = [...buffer];
      const repeated = rest.every((c) => collator.compare(c, first) === 0);
      const text = repeated ? first : buffer;
      const at = items.findIndex((item) => item.key === current);
      // A longer search may still match the current item; a fresh letter looks past it.
      const start = text.length > 1 ? Math.max(at, 0) : at + 1;
      for (let i = 0; i < items.length; i++) {
        const item = items[(start + i) % items.length];
        if (item && !item.disabled && startsWith(item.label, text)) return item.key;
      }
      return null;
    },
    reset() {
      cancel();
      buffer = '';
    },
  };
}

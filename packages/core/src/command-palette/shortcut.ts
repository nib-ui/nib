/** The modifier and key fields of a keydown, from a DOM KeyboardEvent or a NibEvent. */
export interface ShortcutKeys {
  key?: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

/**
 * Whether a keydown is `shortcut`, written like `mod+k` or `shift+mod+p`: `mod` is ⌘ on Apple
 * platforms and Ctrl elsewhere. Every modifier must match exactly, so ⌘⇧K is not ⌘K.
 */
export function matchShortcut(e: ShortcutKeys, shortcut: string, apple: boolean): boolean {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts.pop();
  const want = new Set(parts.map((p) => (p === 'mod' ? (apple ? 'meta' : 'ctrl') : p)));
  return (
    e.key?.toLowerCase() === key &&
    !!e.metaKey === want.has('meta') &&
    !!e.ctrlKey === want.has('ctrl') &&
    !!e.altKey === want.has('alt') &&
    !!e.shiftKey === want.has('shift')
  );
}

const SYMBOLS: Record<string, string> = { meta: '⌘', ctrl: 'Ctrl', alt: '⌥', shift: '⇧' };
const NAMES: Record<string, string> = { meta: 'Meta', ctrl: 'Control', alt: 'Alt', shift: 'Shift' };

const split = (shortcut: string, apple: boolean) =>
  shortcut
    .toLowerCase()
    .split('+')
    .map((p) => (p === 'mod' ? (apple ? 'meta' : 'ctrl') : p));

/** The printed hotkey: `⌘K` on Apple platforms, `Ctrl+K` elsewhere. */
export function printShortcut(shortcut: string, apple: boolean): string {
  const parts = split(shortcut, apple).map((p) => SYMBOLS[p] ?? p.toUpperCase());
  return apple ? parts.join('') : parts.join('+');
}

/** The `aria-keyshortcuts` value: `Meta+K` or `Control+K`. */
export function ariaShortcut(shortcut: string, apple: boolean): string {
  return split(shortcut, apple)
    .map((p) => NAMES[p] ?? p.toUpperCase())
    .join('+');
}

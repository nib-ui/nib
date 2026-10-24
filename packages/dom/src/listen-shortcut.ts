import { matchShortcut } from '@nib-ui/core/command-palette';
import { applePlatform } from './binding-helpers.ts';

/**
 * Calls `fn` when `shortcut` (`mod+k`) is pressed anywhere in the document, unless something else
 * already handled the key, an IME is composing, or the key repeats from being held. A shortcut with
 * no Ctrl, ⌘ or Alt (`/`) stays out of text fields: keys never fire while typing. Returns a function
 * that stops listening.
 */
export function listenShortcut(shortcut: string, fn: () => void, doc: Document = document): () => void {
  const apple = applePlatform(doc.defaultView?.navigator);
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.isComposing || e.repeat || !matchShortcut(e, shortcut, apple)) return;
    const typing = (e.target as Element | null)?.closest?.('input, textarea, select, [contenteditable]');
    if (typing && !e.ctrlKey && !e.metaKey && !e.altKey) return;
    e.preventDefault();
    fn();
  };
  doc.addEventListener('keydown', onKey);
  return () => doc.removeEventListener('keydown', onKey);
}

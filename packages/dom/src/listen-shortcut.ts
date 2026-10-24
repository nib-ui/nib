import { matchShortcut } from '@nib-ui/core/command-palette';
import { applePlatform } from './binding-helpers.ts';

/**
 * Calls `fn` when `shortcut` (`mod+k`) is pressed anywhere in the document, unless something else
 * already handled the key or an IME is composing. Returns a function that stops listening.
 */
export function listenShortcut(shortcut: string, fn: () => void, doc: Document = document): () => void {
  const apple = applePlatform(doc.defaultView?.navigator);
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.isComposing || !matchShortcut(e, shortcut, apple)) return;
    e.preventDefault();
    fn();
  };
  doc.addEventListener('keydown', onKey);
  return () => doc.removeEventListener('keydown', onKey);
}

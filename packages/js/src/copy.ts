// Importing this module registers `data-nib="copy"`; call init() to set buttons up.
//
// <figure class="nib-code">
//   <button class="nib-button nib-button--ghost" data-nib="copy" type="button">Copy</button>
//   <pre><code>…</code></pre>
// </figure>
//
// The button copies the text of `data-copy-target` (an element id), else of the `<pre>` in its
// `.nib-code` block. It then reads `Copied ✓` (`data-copied-label`) for two seconds and announces
// it politely. When there is nothing to copy or the clipboard refuses (it is missing on http), it
// reads `Copy failed` (`data-failed-label`) for two seconds and announces that assertively.
import { announce } from '@nib-ui/dom';
import { define } from './registry.ts';

const SHOWN_MS = 2000;

define('copy', (button, { host }) => {
  const doc = button.ownerDocument;
  let destroyed = false;
  let restore = () => undefined as void;

  const source = () => {
    const target = button.dataset['copyTarget'];
    return target ? doc.getElementById(target) : button.closest('.nib-code')?.querySelector('pre');
  };

  const write = async () => {
    const text = source()?.textContent ?? '';
    const clipboard = doc.defaultView?.navigator.clipboard;
    if (!text || !clipboard) return false;
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  /** Shows `label` (and the tick on success) for a while, then puts the button back as it was. */
  const show = (label: string, ok: boolean) => {
    restore();
    const original = [...button.childNodes];
    const attr = ok ? 'data-copied' : 'data-failed';
    const cancel = host.clock.after(SHOWN_MS, () => restore());
    restore = () => {
      cancel();
      button.replaceChildren(...original);
      button.removeAttribute(attr);
      restore = () => undefined;
    };
    const parts: (string | Node)[] = [label];
    if (ok) {
      // The tick is decoration: the name is the word.
      const tick = Object.assign(doc.createElement('span'), { className: 'nib-copy-tick', textContent: ' ✓' });
      tick.setAttribute('aria-hidden', 'true');
      parts.push(tick);
    }
    button.replaceChildren(...parts);
    button.setAttribute(attr, '');
  };

  const onClick = async () => {
    const ok = await write();
    if (destroyed) return;
    const label = ok ? (button.dataset['copiedLabel'] ?? 'Copied') : (button.dataset['failedLabel'] ?? 'Copy failed');
    show(label, ok);
    announce(label, ok ? 'polite' : 'assertive', { document: doc, clock: host.clock });
  };

  const listener = () => void onClick();
  button.addEventListener('click', listener);
  return () => {
    destroyed = true;
    button.removeEventListener('click', listener);
    restore();
  };
});

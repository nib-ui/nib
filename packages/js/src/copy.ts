// Importing this module registers `data-nib="copy"`; call init() to set buttons up.
//
// <figure class="nib-code">
//   <button class="nib-button nib-button--ghost" data-nib="copy" type="button">Copy</button>
//   <pre><code>…</code></pre>
// </figure>
//
// The button copies the text of `data-copy-target` (an element id), else of the `<pre>` in its
// `.nib-code` block. It then reads `Copied ✓` (`data-copied-label`) for two seconds and announces
// it politely; a refused clipboard is announced assertively (`data-failed-label`).
import { announce } from '@nib-ui/dom';
import { define } from './registry.ts';

const SHOWN_MS = 2000;

define('copy', (button, { host }) => {
  const doc = button.ownerDocument;
  const original = [...button.childNodes];
  let restore = () => undefined as void;

  const source = () => {
    const target = button.dataset['copyTarget'];
    return target ? doc.getElementById(target) : button.closest('.nib-code')?.querySelector('pre');
  };

  const onClick = async () => {
    const text = source()?.textContent ?? '';
    try {
      await doc.defaultView?.navigator.clipboard.writeText(text);
    } catch {
      announce(button.dataset['failedLabel'] ?? 'Copy failed', 'assertive', { document: doc, clock: host.clock });
      return;
    }
    const label = button.dataset['copiedLabel'] ?? 'Copied';
    const tick = Object.assign(doc.createElement('span'), { textContent: ' ✓' });
    tick.setAttribute('aria-hidden', 'true');
    restore();
    button.replaceChildren(label, tick);
    button.setAttribute('data-copied', '');
    announce(label, 'polite', { document: doc, clock: host.clock });
    const cancel = host.clock.after(SHOWN_MS, () => restore());
    restore = () => {
      cancel();
      button.replaceChildren(...original);
      button.removeAttribute('data-copied');
      restore = () => undefined;
    };
  };

  const listener = () => void onClick();
  button.addEventListener('click', listener);
  return () => {
    button.removeEventListener('click', listener);
    restore();
  };
});

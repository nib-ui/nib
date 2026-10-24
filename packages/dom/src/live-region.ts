import { systemClock, type Clock } from '@nib-ui/core';

export type Politeness = 'polite' | 'assertive';

export interface AnnounceOptions {
  document?: Document;
  clock?: Clock;
}

/** Screen readers speak a change only once the region is in the tree; this is how long we wait. */
const SETTLE_MS = 100;

// Out of sight and out of layout, but still in the accessibility tree (display:none would remove it).
// Set through CSSOM, which a strict style-src policy allows, unlike a style attribute.
const VISUALLY_HIDDEN =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;' +
  'clip-path:inset(50%);white-space:nowrap';

/** The write each region is waiting to make; a newer message cancels it. */
const pending = new WeakMap<HTMLElement, () => void>();

/** Speaks `text` to screen readers through the page's live region. */
export function announce(text: string, politeness: Politeness, options: AnnounceOptions = {}): void {
  const doc = options.document ?? document;
  const clock = options.clock ?? systemClock;
  let el = doc.querySelector<HTMLElement>(`[data-nib-live="${politeness}"]`);
  if (!el) {
    el = doc.createElement('div');
    el.dataset['nibLive'] = politeness;
    el.setAttribute('role', politeness === 'polite' ? 'status' : 'alert');
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    el.style.cssText = VISUALLY_HIDDEN;
  }
  // A modal dialog makes everything outside it inert, live regions included, so speak from
  // inside the topmost one. Moving the region also re-attaches it if the body was replaced.
  const modals = doc.querySelectorAll('dialog:modal');
  const parent = modals[modals.length - 1] ?? doc.body ?? doc.documentElement;
  if (el.parentElement !== parent) parent.append(el);
  const target = el;
  pending.get(target)?.();
  // Emptying first makes a repeat of the last message a change, so it is spoken again.
  target.textContent = '';
  pending.set(
    target,
    clock.after(SETTLE_MS, () => {
      pending.delete(target);
      target.textContent = text;
    }),
  );
}

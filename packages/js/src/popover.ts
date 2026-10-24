// Importing this module registers `data-nib="popover"`; call init() to set elements up.
//
// <div data-nib="popover" data-side="bottom" data-align="start">
//   <button data-nib-trigger>Filters</button>
//   <div data-nib-content class="nib-popover">…</div>
// </div>
//
// The browser opens and closes it (native popover); this places it beside the trigger. The writing
// direction is read from the root each time it opens. Opening and closing dispatch `nib:change`
// (`detail.open`).
import { createPopover } from '@nib-ui/core/popover';
import type { Align, Side } from '@nib-ui/core/place';
import { bind } from './bind.ts';
import { define } from './registry.ts';

define('popover', (root, { id, host }) => {
  const own = (selector: string) =>
    [...root.querySelectorAll<HTMLElement>(selector)].find((el) => el.parentElement?.closest('[data-nib]') === root);
  const instance = createPopover(
    {
      id,
      side: (root.dataset['side'] as Side | undefined) ?? 'bottom',
      align: (root.dataset['align'] as Align | undefined) ?? 'start',
      onOpenChange: (open) =>
        queueMicrotask(() => root.dispatchEvent(new CustomEvent('nib:change', { detail: { open }, bubbles: true }))),
    },
    host,
  );
  const unbind = bind(instance, () => {
    const trigger = own('[data-nib-trigger]');
    const content = own('[data-nib-content]');
    return [
      ...(trigger ? [{ el: trigger, part: 'trigger' as const }] : []),
      ...(content ? [{ el: content, part: 'content' as const }] : []),
    ];
  });
  // Placement depends on the direction, so read it again just before each opening.
  const direction = () => instance.update({ dir: root.matches(':dir(rtl)') ? 'rtl' : 'ltr' });
  root.addEventListener('toggle', direction, { capture: true });
  return () => {
    root.removeEventListener('toggle', direction, { capture: true });
    unbind();
    instance.destroy();
  };
});

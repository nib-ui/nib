// Importing this module registers `data-nib="popover"`; call init() to set elements up.
//
// <div data-nib="popover" data-side="bottom" data-align="start">
//   <button data-nib-trigger>Filters</button>
//   <div data-nib-content class="nib-popover">…</div>
// </div>
//
// The browser opens and closes it (native popover); this places it beside the trigger, in the
// writing direction of the trigger. Opening and closing dispatch `nib:change`
// (`detail.open`).
import { createPopover } from '@nib-ui/core/popover';
import type { Align, Side } from '@nib-ui/core/place';
import { bind } from './bind.ts';
import { define } from './registry.ts';

const SIDES: readonly Side[] = ['top', 'bottom', 'start', 'end'];
const ALIGNS: readonly Align[] = ['start', 'center', 'end'];
const pick = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

define('popover', (root, { id, host }) => {
  const own = (selector: string) =>
    [...root.querySelectorAll<HTMLElement>(selector)].find((el) => el.parentElement?.closest('[data-nib]') === root);
  const instance = createPopover(
    {
      id,
      side: pick(root.dataset['side'], SIDES, 'bottom'),
      align: pick(root.dataset['align'], ALIGNS, 'start'),
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
  return () => {
    unbind();
    instance.destroy();
  };
});

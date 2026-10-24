// Importing this module registers `data-nib="tooltip"`; call init() to set elements up.
//
// <span data-nib="tooltip">
//   <button data-nib-trigger aria-label="Copy"><span class="nib-icon nib-icon-copy"></span></button>
//   <span data-nib-tooltip class="nib-tooltip">Copy</span>
// </span>
//
// `data-side` (top, bottom, start, end) and `data-delay` (ms) tune it.
import { createTooltip } from '@nib-ui/core/tooltip';
import type { Side } from '@nib-ui/core/place';
import { bind } from './bind.ts';
import { define } from './registry.ts';

const SIDES: readonly Side[] = ['top', 'bottom', 'start', 'end'];

define('tooltip', (root, { id, host }) => {
  const own = (selector: string) =>
    [...root.querySelectorAll<HTMLElement>(selector)].find((el) => el.parentElement?.closest('[data-nib]') === root);
  const side = root.dataset['side'] as Side | undefined;
  const delay = Number(root.dataset['delay']);
  const instance = createTooltip(
    {
      id,
      side: side && SIDES.includes(side) ? side : 'top',
      ...(Number.isFinite(delay) && root.dataset['delay'] !== undefined && { delay }),
    },
    host,
  );
  const unbind = bind(instance, () => {
    const trigger = own('[data-nib-trigger]');
    const tooltip = own('[data-nib-tooltip]');
    return [
      ...(trigger ? [{ el: trigger, part: 'trigger' as const }] : []),
      ...(tooltip ? [{ el: tooltip, part: 'tooltip' as const }] : []),
    ];
  });
  return () => {
    unbind();
    instance.destroy();
  };
});

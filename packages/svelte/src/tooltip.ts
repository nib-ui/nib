import { createTooltip, type TooltipOptions } from '@nib-ui/core/tooltip';
import { controller } from './controller.ts';

/** Tooltip for Svelte: a store of its state and spreadable attributes for `trigger` and `tooltip`. */
export function createTooltipStore(options: TooltipOptions = {}) {
  return controller(createTooltip, options);
}

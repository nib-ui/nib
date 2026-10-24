import { createPopover, type PopoverOptions } from '@nib-ui/core/popover';
import { controller } from './controller.ts';

/** Popover for Svelte: a store of its state and spreadable attributes for `trigger` and `content`. */
export function createPopoverStore(options: PopoverOptions = {}) {
  return controller(createPopover, options);
}

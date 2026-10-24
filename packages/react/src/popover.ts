import { createPopover, type PopoverOptions } from '@nib-ui/core/popover';
import { useController } from './use-controller.ts';

/** Popover for React: its state, and props for the `trigger` and `content` parts. */
export function usePopover(options: PopoverOptions = {}) {
  return useController(createPopover, options);
}

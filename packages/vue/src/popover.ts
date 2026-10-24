import { createPopover, type PopoverOptions } from '@nib-ui/core/popover';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/** Popover for Vue: its state, and `v-bind` objects for the `trigger` and `content` parts. */
export function usePopover(options: MaybeRefOrGetter<PopoverOptions> = {}) {
  return useController(createPopover, options);
}

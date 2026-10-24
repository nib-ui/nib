import { createTooltip, type TooltipOptions } from '@nib-ui/core/tooltip';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/** Tooltip for Vue: its state, and `v-bind` objects for the `trigger` and `tooltip` parts. */
export function useTooltip(options: MaybeRefOrGetter<TooltipOptions> = {}) {
  return useController(createTooltip, options);
}

import { createTooltip, type TooltipOptions } from '@nib-ui/core/tooltip';
import { useController } from './use-controller.ts';

/** Tooltip for React: its state, and props for the `trigger` and `tooltip` parts. */
export function useTooltip(options: TooltipOptions = {}) {
  return useController(createTooltip, options);
}

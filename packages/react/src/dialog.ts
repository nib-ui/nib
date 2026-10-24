import { createDialog, type DialogOptions } from '@nib-ui/core/dialog';
import { useController } from './use-controller.ts';

/** Dialog for React: its state, and props for `trigger`, `dialog`, `title`, `description` and `close`. */
export function useDialog(options: DialogOptions = {}) {
  return useController(createDialog, options);
}

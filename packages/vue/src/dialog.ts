import { createDialog, type DialogOptions } from '@nib-ui/core/dialog';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/** Dialog for Vue: its state, and `v-bind` objects for `trigger`, `dialog`, `title`, `description` and `close`. */
export function useDialog(options: MaybeRefOrGetter<DialogOptions> = {}) {
  return useController(createDialog, options);
}

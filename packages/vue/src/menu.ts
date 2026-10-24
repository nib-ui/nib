import { createMenu, type MenuOptions } from '@nib-ui/core/menu';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/** Menu button for Vue: its state, and `v-bind` objects for `button`, `menu` and each `item` (by key). */
export function useMenu(options: MaybeRefOrGetter<MenuOptions>) {
  return useController(createMenu, options);
}

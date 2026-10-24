import { createMenu, type MenuOptions } from '@nib-ui/core/menu';
import { useController } from './use-controller.ts';

/** Menu button for React: its state, and props for `button`, `menu` and each `item` part (by key). */
export function useMenu(options: MenuOptions) {
  return useController(createMenu, options);
}

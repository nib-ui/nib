import { createMenu, type MenuOptions } from '@nib-ui/core/menu';
import { controller } from './controller.ts';

/** Menu button for Svelte: a store of its state and spreadable attributes for `button`, `menu` and each `item`. */
export function createMenuStore(options: MenuOptions) {
  return controller(createMenu, options);
}

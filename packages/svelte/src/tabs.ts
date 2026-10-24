import { createTabs, type TabsOptions } from '@nib-ui/core/tabs';
import { controller } from './controller.ts';

/** Tabs for Svelte: a store of its state and spreadable attributes for `list` and each `tab` and `panel` (by key). */
export function createTabsStore(options: TabsOptions) {
  return controller(createTabs, options);
}

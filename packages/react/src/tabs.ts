import { createTabs, type TabsOptions } from '@nib-ui/core/tabs';
import { useController } from './use-controller.ts';

/** Tabs for React: its state, and props for the `list` part and each `tab` and `panel` part (by key). */
export function useTabs(options: TabsOptions) {
  return useController(createTabs, options);
}

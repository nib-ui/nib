import { createTabs, type TabsOptions } from '@nib-ui/core/tabs';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/** Tabs for Vue: its state, and `v-bind` objects for `list` and each `tab` and `panel` part (by key). */
export function useTabs(options: MaybeRefOrGetter<TabsOptions>) {
  return useController(createTabs, options);
}

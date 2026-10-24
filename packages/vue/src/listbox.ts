import { createListbox, type ListboxOptions } from '@nib-ui/core/listbox';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/** Listbox for Vue: its state, and `v-bind` objects for the `list` part and each `option` part (by key). */
export function useListbox(options: MaybeRefOrGetter<ListboxOptions>) {
  return useController(createListbox, options);
}

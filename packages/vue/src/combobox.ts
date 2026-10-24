import { createCombobox, type ComboboxOptions } from '@nib-ui/core/combobox';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/** Combobox for Vue: its state, and `v-bind` objects for `input`, `listbox` and each `option` (by key). */
export function useCombobox(options: MaybeRefOrGetter<ComboboxOptions>) {
  return useController(createCombobox, options);
}

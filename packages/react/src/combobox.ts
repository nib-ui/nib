import { createCombobox, type ComboboxOptions } from '@nib-ui/core/combobox';
import { useController } from './use-controller.ts';

/** Combobox for React: its state, and props for `input`, `listbox` and each `option` part (by key). */
export function useCombobox(options: ComboboxOptions) {
  return useController(createCombobox, options);
}

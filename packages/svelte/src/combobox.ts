import { createCombobox, type ComboboxOptions } from '@nib-ui/core/combobox';
import { controller } from './controller.ts';

/** Combobox for Svelte: a store of its state and spreadable attributes for `input`, `listbox` and each `option`. */
export function createComboboxStore(options: ComboboxOptions) {
  return controller(createCombobox, options);
}

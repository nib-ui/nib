import { createListbox, type ListboxOptions } from '@nib-ui/core/listbox';
import { controller } from './controller.ts';

/**
 * Listbox for Svelte (named `create…Store`, since component names such as `switch` are reserved
 * words): a store of its state and spreadable attributes for `list` and each `option` (by key).
 */
export function createListboxStore(options: ListboxOptions) {
  return controller(createListbox, options);
}

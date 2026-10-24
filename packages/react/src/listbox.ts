import { createListbox, type ListboxOptions } from '@nib-ui/core/listbox';
import { useController } from './use-controller.ts';

/** Listbox for React: its state, and props for the `list` part and each `option` part (by key). */
export function useListbox(options: ListboxOptions) {
  return useController(createListbox, options);
}

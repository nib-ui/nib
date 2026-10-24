import { createDialog, type DialogOptions } from '@nib-ui/core/dialog';
import { controller } from './controller.ts';

/** Dialog for Svelte: a store of its state and spreadable attributes for its parts. */
export function createDialogStore(options: DialogOptions = {}) {
  return controller(createDialog, options);
}

import { createDatePicker, type DatePickerOptions } from '@nib-ui/core/date-picker';
import { controller } from './controller.ts';

/** Date picker for Svelte: a store of its state (the month's weeks) and spreadable attributes for its parts. */
export function createDatePickerStore(options: DatePickerOptions = {}) {
  return controller(createDatePicker, options);
}

import { createDatePicker, type DatePickerOptions } from '@nib-ui/core/date-picker';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/**
 * Date picker for Vue: its state (the month's `weeks`, `weekdays` and `title`), and `v-bind`
 * objects for `grid`, `title`, `prev`, `next`, each `weekday` (by index) and each `day` (by ISO date).
 */
export function useDatePicker(options: MaybeRefOrGetter<DatePickerOptions> = {}) {
  return useController(createDatePicker, options);
}

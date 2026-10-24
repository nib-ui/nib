import { createDatePicker, type DatePickerOptions } from '@nib-ui/core/date-picker';
import { useController } from './use-controller.ts';

/**
 * Date picker for React: its state (the month's `weeks`, `weekdays` and `title`), and props for
 * `grid`, `title`, `prev`, `next`, each `weekday` (by index) and each `day` (by ISO date).
 */
export function useDatePicker(options: DatePickerOptions = {}) {
  return useController(createDatePicker, options);
}

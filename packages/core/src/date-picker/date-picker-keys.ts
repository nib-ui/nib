import type { NibEvent } from '../types.ts';
import { addDays, addMonths, startOfWeek, type IsoDate } from './civil.ts';

/**
 * Where a key moves focus in the grid (APG date picker): arrows by a day or a week, Home and End to
 * the week's ends, Page Up and Down by a month, with Shift by a year. Left and right follow the
 * reading direction. Null for a key that does not move.
 */
export function keyTarget(e: NibEvent, from: IsoDate, firstDay: number, rtl: boolean): IsoDate | null {
  const back = rtl ? 1 : -1;
  switch (e.key) {
    case 'ArrowLeft':
      return addDays(from, back);
    case 'ArrowRight':
      return addDays(from, -back);
    case 'ArrowUp':
      return addDays(from, -7);
    case 'ArrowDown':
      return addDays(from, 7);
    case 'Home':
      return startOfWeek(from, firstDay);
    case 'End':
      return addDays(startOfWeek(from, firstDay), 6);
    case 'PageUp':
      return addMonths(from, e.shiftKey ? -12 : -1);
    case 'PageDown':
      return addMonths(from, e.shiftKey ? 12 : 1);
    default:
      return null;
  }
}

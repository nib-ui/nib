import type { Intent, Part } from '../types.ts';
import type { calendarLocale } from './calendar-locale.ts';
import type { IsoDate } from './civil.ts';
import { keyTarget } from './date-picker-keys.ts';
import type { DatePickerOptions, DatePickerState } from './date-picker.ts';

export type DatePickerEvent =
  | { type: 'move'; to: IsoDate }
  | { type: 'month'; by: number }
  | { type: 'choose'; date?: IsoDate }
  | { type: 'hover'; date: IsoDate | null }
  | { type: 'cancel' };

interface DayContext {
  id: string;
  firstDay: number;
  /** Read when a key is pressed: on a first render the grid is not in the page to ask. */
  rtl: () => boolean;
  disabled: boolean;
  cal: ReturnType<typeof calendarLocale>;
}

// Where a day sits in the chosen range, or in the range the pointer previews from the anchor.
function rangeOf(state: DatePickerState, date: IsoDate): 'start' | 'end' | 'middle' | undefined {
  const { value, anchor } = state;
  let start: IsoDate | undefined;
  let end: IsoDate | undefined;
  if (anchor) {
    const other = state.hover ?? state.focus;
    [start, end] = other < anchor ? [other, anchor] : [anchor, other];
  } else if (value && typeof value === 'object') {
    ({ start, end } = value);
  }
  if (!start || !end || date < start || date > end) return undefined;
  return date === start ? 'start' : date === end ? 'end' : 'middle';
}

/**
 * One day cell: a gridcell named by its full date, in the tab order only when it has focus.
 * Chosen days (the date, or a range's ends and the days between) are `aria-selected`; a range's
 * ends are cursor blocks and the days between take the hover fill (`data-range`).
 */
export function renderDay(
  state: DatePickerState,
  o: DatePickerOptions,
  date: IsoDate,
  c: DayContext,
  send: (e: DatePickerEvent) => readonly Intent[],
): Part {
  const range = rangeOf(state, date);
  // A range's first press is announced as chosen at once; the rest of the preview is not.
  const selected = o.mode === 'range' ? (state.anchor ? state.anchor === date : !!range) : state.value === date;
  return {
    attrs: {
      id: `${c.id}-day-${date}`,
      role: 'gridcell',
      tabindex: state.focus === date ? 0 : -1,
      'aria-label': c.cal.full(date),
      'aria-selected': selected,
      'aria-disabled': c.disabled || undefined,
      'aria-current': state.today === date ? 'date' : undefined,
      'data-range': range,
    },
    on: {
      keydown: (e) => {
        // Modified keys belong to the browser and the system (Alt+Left goes back).
        if (e.ctrlKey || e.altKey || e.metaKey) return [];
        const to = keyTarget(e, state.focus, c.firstDay, c.rtl());
        if (to) {
          e.preventDefault();
          return send({ type: 'move', to });
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          return send({ type: 'choose' });
        }
        if (e.key === 'Escape' && state.anchor) {
          e.preventDefault();
          return send({ type: 'cancel' });
        }
        return [];
      },
      click: () => send({ type: 'choose', date }),
      pointerenter: () => (state.anchor ? send({ type: 'hover', date }) : []),
    },
  };
}

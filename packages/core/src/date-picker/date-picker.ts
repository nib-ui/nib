import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import type { Part } from '../types.ts';
import { calendarLocale, firstDayOf } from './calendar-locale.ts';
import { addMonths, localDate, monthGrid, monthOf, type IsoDate } from './civil.ts';
import { renderDay, type DatePickerEvent } from './date-picker-day.ts';

export interface DateRange {
  start: IsoDate;
  end: IsoDate;
}

export interface DatePickerOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag: month and day names, digits and the first day of the week. */
  locale?: string;
  /** One date, or a range chosen with two presses. */
  mode?: 'single' | 'range';
  /** Defined (null included) makes it controlled: the caller owns the value. */
  value?: IsoDate | DateRange | null;
  defaultValue?: IsoDate | DateRange | null;
  onValueChange?: (value: IsoDate | DateRange | null) => void;
  /** The earliest and latest dates that can be chosen; the keyboard stops at them. */
  min?: IsoDate;
  max?: IsoDate;
  /**
   * Dates that cannot be chosen (a closed day): focusable, struck through, `aria-disabled`. A range
   * may still span them; check the days between in `onValueChange` if it must not.
   */
  isDisabled?: (date: IsoDate) => boolean;
  /** Today, marked `aria-current="date"`; defaults to the clock's date in the user's time zone. */
  today?: IsoDate;
  /** 1 = Monday … 7 = Sunday; defaults to the locale's. */
  firstDay?: number;
  dir?: 'ltr' | 'rtl';
  /** Names of the month buttons, in the page's language. */
  labels?: { prev?: string; next?: string };
}

export interface DayCell {
  date: IsoDate;
  /** The day number as the locale writes it. */
  text: string;
}

export interface DatePickerState {
  /** The first day of the month shown. */
  month: IsoDate;
  /** The day that takes Tab focus (roving tabindex). */
  focus: IsoDate;
  value: IsoDate | DateRange | null;
  /** In range mode, the first press of a range not yet finished. */
  anchor: IsoDate | null;
  /** The day under the pointer, previewing a range from the anchor. */
  hover: IsoDate | null;
  today: IsoDate;
  /** "October 2026" in the locale, for the heading. */
  title: string;
  /** Seven column heads from the first day of the week: a narrow name to show, a long one for `abbr`. */
  weekdays: readonly { short: string; long: string }[];
  /** The weeks of the month; a day of another month is null (an empty cell). */
  weeks: readonly (readonly (DayCell | null)[])[];
}

export type DatePickerPart = 'grid' | 'title' | 'prev' | 'next' | 'weekday' | 'day';

const clamp = (date: IsoDate, o: DatePickerOptions) =>
  o.min && date < o.min ? o.min : o.max && date > o.max ? o.max : date;
const startOf = (value: IsoDate | DateRange | null | undefined) =>
  value == null ? null : typeof value === 'string' ? value : value.start;

/**
 * A calendar per the WAI-ARIA APG date picker grid: a month of days in a `role="grid"` table, one
 * day in the tab order, arrows by day and week, Page Up/Down by month (Shift: year), Enter or Space
 * to choose. Names, digits and the first day of the week come from `Intl` for the locale. Single
 * date or range; dates outside min/max or disabled are struck through and cannot be chosen.
 */
export function createDatePicker(
  options: DatePickerOptions = {},
  host: Host = nullHost,
): Instance<DatePickerState, DatePickerEvent, DatePickerPart, DatePickerOptions> {
  let internal = options.defaultValue ?? null;
  const valueOf = (o: DatePickerOptions) => (o.value !== undefined ? o.value : internal);
  // Names for the current locale, rebuilt when the caller changes it.
  let cal = { locale: '', names: calendarLocale('en-US') };
  const namesOf = (o: DatePickerOptions) => {
    const locale = o.locale ?? 'en-US';
    if (cal.locale !== locale) cal = { locale, names: calendarLocale(locale) };
    return cal.names;
  };
  const firstDay = (o: DatePickerOptions) => o.firstDay ?? firstDayOf(o.locale ?? 'en-US');
  const sameValue = (a: IsoDate | DateRange | null, b: IsoDate | DateRange | null) =>
    a === b || (!!a && !!b && typeof a === 'object' && typeof b === 'object' && a.start === b.start && a.end === b.end);

  // Everything shown for a month; recomputed only when the month changes.
  const view = (o: DatePickerOptions, month: IsoDate) => ({
    month,
    title: namesOf(o).title(month),
    weekdays: namesOf(o).weekdays(firstDay(o)),
    weeks: monthGrid(month, firstDay(o)).map((w) =>
      w.map((date) => (date ? { date, text: namesOf(o).day(date) } : null)),
    ),
  });
  const focusOn = (state: DatePickerState, o: DatePickerOptions, date: IsoDate): DatePickerState => {
    const focus = clamp(date, o);
    const month = monthOf(focus);
    return { ...state, focus, hover: null, ...(month === state.month ? {} : view(o, month)) };
  };
  const disabled = (o: DatePickerOptions, date: IsoDate) =>
    (!!o.min && date < o.min) || (!!o.max && date > o.max) || !!o.isDisabled?.(date);

  return createInstance<DatePickerState, DatePickerEvent, DatePickerPart, DatePickerOptions>(
    {
      name: 'date-picker',
      parts: ['grid', 'title', 'prev', 'next', 'weekday', 'day'],
      init: ({ options: o, host: h }) => {
        const today = o.today ?? localDate(h.clock.now());
        const focus = clamp(startOf(valueOf(o)) ?? today, o);
        return { ...view(o, monthOf(focus)), focus, value: valueOf(o), anchor: null, hover: null, today };
      },
      sync: ({ state, options: o }) => {
        const value = valueOf(o);
        const changed = !sameValue(value, state.value);
        let s = changed ? { ...state, value } : state;
        // A new locale or first day of the week: the same month, renamed and laid out again.
        const fresh = view(o, s.month);
        if (fresh.title !== s.title || fresh.weekdays[0]?.long !== s.weekdays[0]?.long) s = { ...s, ...fresh };
        // A value set from outside, in another month: show it.
        const start = changed ? startOf(value) : null;
        if (start && monthOf(start) !== s.month) return focusOn(s, o, start);
        const focus = clamp(s.focus, o);
        return focus === s.focus ? s : focusOn(s, o, focus);
      },
      reduce: ({ state, options: o, id }, event) => {
        const day = (date: IsoDate) => `${id}-day-${date}`;
        switch (event.type) {
          case 'move': {
            const next = focusOn(state, o, event.to);
            return { state: next, intents: [{ type: 'focus', ref: day(next.focus) }] };
          }
          case 'month': {
            const next = focusOn(state, o, addMonths(state.focus, event.by));
            return { state: next };
          }
          case 'hover':
            return { state: state.hover === event.date ? state : { ...state, hover: event.date } };
          case 'cancel':
            return { state: state.anchor ? { ...state, anchor: null, hover: null } : state };
          case 'choose': {
            const date = event.date ?? state.focus;
            if (disabled(o, date)) return { state };
            const moved = date === state.focus ? state : focusOn(state, o, date);
            if (o.mode === 'range' && !state.anchor) return { state: { ...moved, anchor: date, hover: null } };
            const value: IsoDate | DateRange =
              o.mode === 'range' && state.anchor
                ? { start: date < state.anchor ? date : state.anchor, end: date < state.anchor ? state.anchor : date }
                : date;
            if (o.value === undefined) internal = value;
            o.onValueChange?.(value);
            return { state: { ...moved, value: valueOf(o), anchor: null, hover: null } };
          }
        }
      },
      render: ({ state, options: o, id, host: h }, name, key = '', send): Part => {
        const rtl = () => (o.dir ?? h.geometry.direction?.(`${id}-grid`)) === 'rtl';
        const labels = o.labels ?? {};
        switch (name) {
          case 'grid':
            return {
              attrs: {
                id: `${id}-grid`,
                role: 'grid',
                'aria-labelledby': `${id}-title`,
                'aria-multiselectable': o.mode === 'range' || undefined,
              },
              // Leaving the grid ends a pointer's range preview.
              on: { pointerleave: () => (state.hover ? send({ type: 'hover', date: null }) : []) },
            };
          case 'title':
            return { attrs: { id: `${id}-title`, 'aria-live': 'polite' }, on: {} };
          case 'prev':
          case 'next': {
            const by = name === 'prev' ? -1 : 1;
            const target = addMonths(state.month, by);
            // Off when the whole month lies past min or max.
            const off = by < 0 ? !!o.min && addMonths(target, 1) <= monthOf(o.min) : !!o.max && target > o.max;
            return {
              attrs: {
                id: `${id}-${name}`,
                type: 'button',
                'aria-label': by < 0 ? (labels.prev ?? 'Previous month') : (labels.next ?? 'Next month'),
                'aria-disabled': off || undefined,
              },
              on: { click: () => (off ? [] : send({ type: 'month', by })) },
            };
          }
          case 'weekday':
            return { attrs: { abbr: state.weekdays[Number(key)]?.long }, on: {} };
          default:
            return renderDay(
              state,
              o,
              key,
              { id, firstDay: firstDay(o), rtl, disabled: disabled(o, key), cal: namesOf(o) },
              send,
            );
        }
      },
    },
    options,
    host,
  );
}

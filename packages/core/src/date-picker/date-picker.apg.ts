import type { ConformanceCase, ConformanceTable } from '../testing/conformance.ts';

// Saturday 24 October 2026, Monday-first weeks; the 30th is closed, nothing after 15 November.
const OPTIONS = { id: 'dp', locale: 'en-GB', today: '2026-10-24', firstDay: 1, max: '2026-11-15' };
const day = (date: string, attrs: Record<string, string | null>) => ({ part: 'day', key: date, attrs });
const focused = (date: string) => ({ type: 'focus' as const, ref: `dp-day-${date}` });

const row = (name: string, keys: ConformanceCase['keys'], expect: ConformanceCase['expect']): ConformanceCase => ({
  name,
  options: OPTIONS,
  target: { part: 'day', key: '2026-10-24' },
  keys,
  expect,
});

/**
 * The APG date picker grid as data. Core runs it in its spec; the Playwright keyboard spec runs the
 * same rows against every binding.
 */
export const datePickerApg: ConformanceTable = {
  pattern: 'date picker',
  cases: [
    row('ArrowRight moves to the next day', ['ArrowRight'], {
      attrs: [day('2026-10-25', { tabindex: '0' }), day('2026-10-24', { tabindex: '-1' })],
      intents: [focused('2026-10-25')],
    }),
    row('ArrowDown moves a week on, into the next month', ['ArrowDown', 'ArrowDown'], {
      attrs: [day('2026-11-07', { tabindex: '0' })],
      intents: [focused('2026-10-31'), focused('2026-11-07')],
    }),
    row('Home goes to the first day of the week', ['Home'], { intents: [focused('2026-10-19')] }),
    row('End goes to the last day of the week', ['End'], { intents: [focused('2026-10-25')] }),
    row('PageUp goes back a month', ['PageUp'], { intents: [focused('2026-09-24')] }),
    row('Shift+PageUp goes back a year', [{ key: 'PageUp', shiftKey: true }], { intents: [focused('2025-10-24')] }),
    row('PageDown stops at the latest date', ['PageDown'], { intents: [focused('2026-11-15')] }),
    row('Enter chooses the focused day', ['Enter'], {
      attrs: [day('2026-10-24', { 'aria-selected': 'true', 'aria-current': 'date' })],
    }),
    row('Space chooses too', [' '], { attrs: [day('2026-10-24', { 'aria-selected': 'true' })] }),
  ],
};

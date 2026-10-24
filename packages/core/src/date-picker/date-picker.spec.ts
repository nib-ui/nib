import { describe, expect, it, vi } from 'vitest';
import { runConformance } from '../testing/conformance.ts';
import { createTestHost } from '../testing/test-host.ts';
import { firstDayOf } from './calendar-locale.ts';
import { addMonths, monthGrid } from './civil.ts';
import { datePickerApg } from './date-picker.apg.ts';
import { createDatePicker, type DatePickerOptions } from './index.ts';

function setup(options: Partial<DatePickerOptions> = {}) {
  const t = createTestHost();
  const dp = createDatePicker({ id: 'dp', locale: 'en-US', today: '2026-10-24', ...options }, t.host);
  const key = (date: string, init: Record<string, unknown>) => t.fire(dp.part('day', date), 'keydown', init);
  return { t, dp, key };
}

describe('createDatePicker', () => {
  it('shows the month of today with the locale names, its weeks starting on the locale first day', () => {
    const { dp } = setup();
    expect(dp.state.title).toBe('October 2026');
    expect(dp.state.weekdays.map((d) => d.short).join('')).toBe('SMTWTFS');
    expect(dp.state.weeks[0]?.slice(0, 5)).toEqual([null, null, null, null, { date: '2026-10-01', text: '1' }]);
    expect(dp.part('day', '2026-10-24').attrs).toMatchObject({
      tabindex: 0,
      'aria-current': 'date',
      'aria-label': 'Saturday, October 24, 2026',
      'aria-selected': false,
    });
    expect(dp.part('weekday', '0').attrs['abbr']).toBe('Sunday');
  });

  it('names months and starts weeks the way Vietnamese and Japanese do', () => {
    expect(setup({ locale: 'vi-VN' }).dp.state).toMatchObject({ title: 'tháng 10 năm 2026' });
    expect(setup({ locale: 'vi-VN' }).dp.state.weekdays[0]?.long).toBe('Thứ Hai');
    const ja = setup({ locale: 'ja-JP' }).dp.state;
    expect(ja.title).toBe('2026年10月');
    expect(ja.weeks[0]?.[4]).toEqual({ date: '2026-10-01', text: '1' });
  });

  it('chooses with a click and reports it; a disabled or out-of-range day cannot be chosen', () => {
    const onValueChange = vi.fn();
    const { t, dp } = setup({ onValueChange, min: '2026-10-05', isDisabled: (d) => d === '2026-10-30' });
    t.fire(dp.part('day', '2026-10-30'), 'click');
    t.fire(dp.part('day', '2026-10-02'), 'click');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(dp.part('day', '2026-10-30').attrs['aria-disabled']).toBe(true);
    t.fire(dp.part('day', '2026-10-12'), 'click');
    expect(onValueChange).toHaveBeenCalledWith('2026-10-12');
    expect(dp.part('day', '2026-10-12').attrs['aria-selected']).toBe(true);
  });

  it('chooses a range with two presses in either order, previewing it under the pointer', () => {
    const onValueChange = vi.fn();
    const { t, dp } = setup({ mode: 'range', onValueChange });
    expect(dp.part('grid').attrs['aria-multiselectable']).toBe(true);
    t.fire(dp.part('day', '2026-10-20'), 'click');
    t.fire(dp.part('day', '2026-10-12'), 'pointerenter');
    expect(dp.part('day', '2026-10-15').attrs['data-range']).toBe('middle');
    t.fire(dp.part('day', '2026-10-12'), 'click');
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-10-12', end: '2026-10-20' });
    expect(dp.part('day', '2026-10-12').attrs).toMatchObject({ 'data-range': 'start', 'aria-selected': true });
    expect(dp.part('day', '2026-10-21').attrs['aria-selected']).toBe(false);
  });

  it('cancels an unfinished range with Escape', () => {
    const { t, dp, key } = setup({ mode: 'range' });
    t.fire(dp.part('day', '2026-10-24'), 'click');
    key('2026-10-24', { key: 'Escape' });
    expect(dp.state.anchor).toBeNull();
  });

  it('moves by month with the buttons, which stop at min and max', () => {
    const { t, dp } = setup({ min: '2026-09-10', max: '2026-11-20' });
    t.fire(dp.part('prev'), 'click');
    expect(dp.state.month).toBe('2026-09-01');
    expect(dp.part('prev').attrs['aria-disabled']).toBe(true);
    t.fire(dp.part('next'), 'click');
    t.fire(dp.part('next'), 'click');
    expect(dp.state).toMatchObject({ month: '2026-11-01', focus: '2026-11-20' });
    expect(dp.part('next').attrs['aria-disabled']).toBe(true);
  });

  it('mirrors left and right in a right-to-left page', () => {
    const { key } = setup({ dir: 'rtl' });
    expect(key('2026-10-24', { key: 'ArrowLeft' })).toEqual([{ type: 'focus', ref: 'dp-day-2026-10-25' }]);
  });

  it('opens on the chosen date and follows a value set from outside', () => {
    const { dp } = setup({ value: '2027-02-14' });
    expect(dp.state).toMatchObject({ month: '2027-02-01', focus: '2027-02-14' });
    dp.update({ value: '2027-03-01' });
    expect(dp.state).toMatchObject({ month: '2027-03-01', focus: '2027-03-01' });
    expect(dp.part('day', '2027-03-01').attrs).toMatchObject({ 'aria-selected': true, tabindex: 0 });
  });

  it('keeps the state when a controlled range comes back as a new but equal object', () => {
    const { dp } = setup({ mode: 'range', value: { start: '2026-10-12', end: '2026-10-16' } });
    const before = dp.state;
    dp.update({ value: { start: '2026-10-12', end: '2026-10-16' } });
    expect(dp.state).toBe(before);
  });

  it('renames the month and lays out the week again when the locale changes', () => {
    const { dp } = setup();
    dp.update({ locale: 'vi-VN' });
    expect(dp.state).toMatchObject({ title: 'tháng 10 năm 2026', month: '2026-10-01' });
    expect(dp.state.weekdays[0]?.long).toBe('Thứ Hai');
  });

  it('numbers days in the Gregorian calendar even where the locale uses another (fa-IR, ar-SA, th-TH)', () => {
    for (const locale of ['fa-IR', 'ar-SA', 'th-TH']) {
      const { dp } = setup({ locale });
      const cell = dp.state.weeks.flat().find((c) => c?.date === '2026-10-24');
      expect(
        Number(
          cell?.text
            .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
            .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))),
        ),
      ).toBe(24);
    }
  });

  it('leaves modified keys to the browser', () => {
    const { key } = setup();
    expect(key('2026-10-24', { key: 'ArrowLeft', altKey: true })).toEqual([]);
    expect(key('2026-10-24', { key: 'Home', metaKey: true })).toEqual([]);
  });

  it('marks a range first press as chosen, and the keyboard, not an old pointer, sets the preview', () => {
    const { t, dp, key } = setup({ mode: 'range' });
    t.fire(dp.part('day', '2026-10-20'), 'click');
    expect(dp.part('day', '2026-10-20').attrs['aria-selected']).toBe(true);
    t.fire(dp.part('day', '2026-10-28'), 'pointerenter');
    key('2026-10-20', { key: 'ArrowRight' });
    expect(dp.part('day', '2026-10-21').attrs['data-range']).toBe('end');
    expect(dp.part('day', '2026-10-28').attrs['data-range']).toBeUndefined();
    t.fire(dp.part('day', '2026-10-28'), 'pointerenter');
    t.fire(dp.part('grid'), 'pointerleave');
    expect(dp.state.hover).toBeNull();
  });

  it('reads the reading direction when a key is pressed, not when the cell was rendered', () => {
    const { t, dp } = setup();
    const day = dp.part('day', '2026-10-24');
    t.geometry.setDirection('rtl');
    expect(t.fire(day, 'keydown', { key: 'ArrowLeft' })).toEqual([{ type: 'focus', ref: 'dp-day-2026-10-25' }]);
  });

  it('passes every row of its APG table', () => {
    expect(runConformance(datePickerApg, createDatePicker as never).filter((r) => r.failures.length)).toEqual([]);
  });
});

describe('first day of the week without Intl week info', () => {
  it('falls back by region: Sunday in the US and Thailand, Saturday in Egypt, Monday elsewhere', () => {
    class Bare extends Intl.Locale {
      getWeekInfo = undefined;
      weekInfo = undefined;
    }
    const of = (l: string) => firstDayOf(l, Bare as unknown as typeof Intl.Locale);
    expect([of('en-US'), of('th-TH'), of('ar-EG'), of('vi-VN'), of('en-AU')]).toEqual([7, 7, 6, 1, 1]);
  });
});

describe('civil dates', () => {
  it('keeps the day where the month has it, and lays out leap Februaries', () => {
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28');
    expect(monthGrid('2027-02-01', 1).flat().filter(Boolean)).toHaveLength(28);
  });
});

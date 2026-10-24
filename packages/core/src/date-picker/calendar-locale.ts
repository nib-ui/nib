import { parts, type IsoDate } from './civil.ts';

// Regions whose week starts on Sunday or Saturday, for engines without `Intl.Locale` week info.
const SUNDAY = new Set(['US', 'CA', 'JP', 'KR', 'TW', 'HK', 'IL', 'IN', 'BR', 'MX', 'PH', 'SA', 'ZA', 'AU']);
const SATURDAY = new Set(['AE', 'AF', 'BH', 'DJ', 'DZ', 'EG', 'IQ', 'IR', 'JO', 'KW', 'LY', 'OM', 'QA', 'SD', 'SY']);

/** The first day of the week in a locale: 1 = Monday … 7 = Sunday. */
export function firstDayOf(locale: string): number {
  const loc = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number };
    weekInfo?: { firstDay: number };
  };
  const info = loc.getWeekInfo?.() ?? loc.weekInfo;
  if (info) return info.firstDay;
  const region = loc.maximize().region ?? '';
  return SUNDAY.has(region) ? 7 : SATURDAY.has(region) ? 6 : 1;
}

/** Names and numbers of a calendar in one locale, all through `Intl` in UTC so no zone shifts a day. */
export function calendarLocale(locale: string) {
  const utc = (date: IsoDate) => {
    const [y, m, d] = parts(date);
    const t = new Date(0);
    t.setUTCFullYear(y, m - 1, d);
    return t;
  };
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...o, timeZone: 'UTC' });
  const title = fmt({ year: 'numeric', month: 'long' });
  const day = fmt({ day: 'numeric' });
  const full = fmt({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const short = fmt({ weekday: 'narrow' });
  const long = fmt({ weekday: 'long' });
  return {
    /** "October 2026", "tháng 10 năm 2026", "2026年10月". */
    title: (month: IsoDate) => title.format(utc(month)),
    /** The day number as the locale writes it, without a suffix such as Japanese 日. */
    day: (date: IsoDate) =>
      day
        .formatToParts(utc(date))
        .filter((p) => p.type === 'day')
        .map((p) => p.value)
        .join(''),
    /** "Saturday, October 24, 2026": the name of a day cell. */
    full: (date: IsoDate) => full.format(utc(date)),
    /** Seven weekday names from `firstDay` on: a narrow one to show, a long one for `abbr`. */
    weekdays(firstDay: number) {
      // 2024-01-01 was a Monday.
      return Array.from({ length: 7 }, (_, i) => {
        const date = utc(`2024-01-0${((firstDay - 1 + i) % 7) + 1}`);
        return { short: short.format(date), long: long.format(date) };
      });
    },
  };
}

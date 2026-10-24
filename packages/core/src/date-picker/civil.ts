// Calendar dates as ISO strings (`2026-10-24`), with no time and no time zone: two dates compare
// as strings, and arithmetic runs on day numbers counted from 1970-01-01 (proleptic Gregorian).

/** A date as `YYYY-MM-DD`. */
export type IsoDate = string;

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** Days since 1970-01-01 for a civil date (Howard Hinnant's days_from_civil). */
function toDays(y: number, m: number, d: number): number {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** The civil date of a day number (civil_from_days). */
function fromDays(days: number): [number, number, number] {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return [yoe + era * 400 + (m <= 2 ? 1 : 0), m, d];
}

export function parts(date: IsoDate): [number, number, number] {
  const [y = 0, m = 1, d = 1] = date.split('-').map(Number);
  return [y, m, d];
}

export const iso = (y: number, m: number, d: number): IsoDate => `${pad(y, 4)}-${pad(m)}-${pad(d)}`;

export function daysInMonth(y: number, m: number): number {
  return m === 2 ? (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28) : [4, 6, 9, 11].includes(m) ? 30 : 31;
}

export function addDays(date: IsoDate, n: number): IsoDate {
  return iso(...fromDays(toDays(...parts(date)) + n));
}

/** Moves by whole months, keeping the day where the month has it (Jan 31 + 1 month = Feb 28). */
export function addMonths(date: IsoDate, n: number): IsoDate {
  const [y, m, d] = parts(date);
  const index = y * 12 + (m - 1) + n;
  const ny = Math.floor(index / 12);
  const nm = index - ny * 12 + 1;
  return iso(ny, nm, Math.min(d, daysInMonth(ny, nm)));
}

/** 1 = Monday … 7 = Sunday, as `Intl.Locale` week info counts. */
export function weekday(date: IsoDate): number {
  return ((((toDays(...parts(date)) + 3) % 7) + 7) % 7) + 1;
}

/** The first day of the date's month. */
export const monthOf = (date: IsoDate): IsoDate => `${date.slice(0, 8)}01`;

/** The day the week holding `date` starts on, for weeks starting on `firstDay`. */
export function startOfWeek(date: IsoDate, firstDay: number): IsoDate {
  return addDays(date, -((weekday(date) - firstDay + 7) % 7));
}

/** The weeks of the month as rows of seven dates; days of the next or last month are null. */
export function monthGrid(month: IsoDate, firstDay: number): (IsoDate | null)[][] {
  const first = monthOf(month);
  const [y, m] = parts(first);
  const last = iso(y, m, daysInMonth(y, m));
  const weeks: (IsoDate | null)[][] = [];
  for (let day = startOfWeek(first, firstDay); day <= last;) {
    const week: (IsoDate | null)[] = [];
    for (let i = 0; i < 7; i++, day = addDays(day, 1)) week.push(day < first || day > last ? null : day);
    weeks.push(week);
  }
  return weeks;
}

/** A date from a JS timestamp, in the runtime's local time zone (what "today" means to the user). */
export function localDate(ms: number): IsoDate {
  const d = new Date(ms);
  return iso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

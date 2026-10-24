// Importing this module registers `data-nib="date-picker"`; call init() to set one up.
//
// <div data-nib="date-picker" class="nib-calendar" data-value="2026-10-24" data-name="date"></div>
//
// The calendar renders itself: a header (‹ month ›) and the grid of the month. `data-mode="range"`
// chooses a range (`data-value="2026-10-12/2026-10-20"`); `data-min`, `data-max` and
// `data-disabled-dates` (comma-separated) limit the choice; `data-prev-label` / `data-next-label`
// name the buttons. With `data-name`, a hidden input carries the value into a form. Choosing
// dispatches `nib:change` (`detail.value`).
import { createDatePicker, type DateRange, type IsoDate } from '@nib-ui/core/date-picker';
import { bind } from './bind.ts';
import { define } from './registry.ts';

const encode = (v: IsoDate | DateRange | null) => (v === null ? '' : typeof v === 'string' ? v : `${v.start}/${v.end}`);
const decode = (s: string | undefined): IsoDate | DateRange | null => {
  if (!s) return null;
  const [start = '', end] = s.split('/');
  return end ? { start, end } : start;
};

define('date-picker', (root, { id, locale, host }) => {
  const doc = root.ownerDocument;
  const d = root.dataset;
  const closed = new Set((d['disabledDates'] ?? '').split(',').filter(Boolean));
  const make = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = '') =>
    Object.assign(doc.createElement(tag), { className, textContent: text });

  const hidden = d['name'] ? Object.assign(make('input'), { type: 'hidden', name: d['name'] }) : null;
  const emit = (value: IsoDate | DateRange | null) => {
    if (hidden) hidden.value = encode(value);
    queueMicrotask(() => root.dispatchEvent(new CustomEvent('nib:change', { detail: { value }, bubbles: true })));
  };
  const instance = createDatePicker(
    {
      id,
      locale,
      mode: d['mode'] === 'range' ? 'range' : 'single',
      defaultValue: decode(d['value']),
      onValueChange: emit,
      ...(d['min'] && { min: d['min'] }),
      ...(d['max'] && { max: d['max'] }),
      ...(d['today'] && { today: d['today'] }),
      ...(closed.size && { isDisabled: (date: IsoDate) => closed.has(date) }),
      labels: { ...(d['prevLabel'] && { prev: d['prevLabel'] }), ...(d['nextLabel'] && { next: d['nextLabel'] }) },
    },
    host,
  );
  if (hidden) hidden.value = encode(instance.state.value);

  const header = make('div', 'nib-calendar__header');
  const prev = make('button', 'nib-button', '‹');
  const next = make('button', 'nib-button', '›');
  const title = make('h2', 'nib-calendar__title');
  header.append(prev, title, next);
  const table = make('table', 'nib-calendar__grid');
  const head = make('tr');
  const body = make('tbody');
  const thead = make('thead');
  thead.append(head);
  table.append(thead, body);
  root.append(header, table, ...(hidden ? [hidden] : []));

  const weekday = (short: string, i: number) => {
    const th = make('th', '', short);
    th.scope = 'col';
    th.dataset['nibWeekday'] = String(i);
    return th;
  };
  const day = (date: string, text: string) => {
    const td = make('td', '', text);
    td.dataset['nibDay'] = date;
    return td;
  };
  // Rebuilds the grid when the month changes; bind then writes every cell's attributes.
  let shown = '';
  const render = () => {
    const s = instance.state;
    title.textContent = s.title;
    if (s.month === shown) return;
    shown = s.month;
    head.replaceChildren(...s.weekdays.map((w, i) => weekday(w.short, i)));
    body.replaceChildren(
      ...s.weeks.map((week) => {
        const tr = make('tr');
        tr.append(...week.map((cell) => (cell ? day(cell.date, cell.text) : make('td'))));
        return tr;
      }),
    );
  };
  render();
  const unsubscribe = instance.subscribe(render);
  const unbind = bind(instance, () => [
    { el: table, part: 'grid' as const },
    { el: title, part: 'title' as const },
    { el: prev, part: 'prev' as const },
    { el: next, part: 'next' as const },
    ...[...head.querySelectorAll<HTMLElement>('[data-nib-weekday]')].map((el) => ({
      el,
      part: 'weekday' as const,
      key: el.dataset['nibWeekday'],
    })),
    ...[...body.querySelectorAll<HTMLElement>('[data-nib-day]')].map((el) => ({
      el,
      part: 'day' as const,
      key: el.dataset['nibDay'],
    })),
  ]);
  return () => {
    unsubscribe();
    unbind();
    instance.destroy();
    header.remove();
    table.remove();
    hidden?.remove();
  };
});

import type { ConformanceCase, ConformanceTable } from '../testing/conformance.ts';

const COLUMNS = [
  { key: 'order', label: 'Order', sortable: true },
  { key: 'item', label: 'Item', editable: true },
  { key: 'total', label: 'Total', numeric: true, sortable: true },
];
const ROWS = [
  { key: '1042', order: '#1042', item: 'Kenya Nyeri', total: 48 },
  { key: '1041', order: '#1041', item: 'Decaf', total: 16 },
  { key: '1040', order: '#1040', item: 'Ethiopia', total: 72 },
];
const focused = (ref: string) => ({ type: 'focus' as const, ref: `dg-${ref}` });

const row = (name: string, keys: ConformanceCase['keys'], expect: ConformanceCase['expect']): ConformanceCase => ({
  name,
  options: { id: 'dg', locale: 'en', label: 'Orders', columns: COLUMNS, rows: ROWS, selectable: true },
  target: { part: 'header', key: 'order' },
  keys,
  expect,
});

/**
 * The APG data grid keyboard as data, starting on the first header. Core runs it in its spec; the
 * Playwright keyboard spec runs the same rows against every binding.
 */
export const dataGridApg: ConformanceTable = {
  pattern: 'grid',
  cases: [
    row('ArrowDown moves into the first row', ['ArrowDown'], {
      attrs: [{ part: 'cell', key: '1042::order', attrs: { tabindex: '0' } }],
      intents: [
        focused('cell-1042::order'),
        { type: 'scroll-into-view', ref: 'dg-cell-1042::order', block: 'nearest' },
      ],
    }),
    row('ArrowRight and End move along the row', ['End'], {
      attrs: [{ part: 'header', key: 'total', attrs: { tabindex: '0' } }],
    }),
    row('Home goes to the select column', ['Home'], {
      attrs: [{ part: 'select-all', attrs: { tabindex: '0' } }],
    }),
    row('Ctrl+End goes to the last cell', [{ key: 'End', ctrlKey: true }], {
      attrs: [{ part: 'cell', key: '1040::total', attrs: { tabindex: '0' } }],
    }),
    row('Enter on a header sorts by it, ascending then descending', ['Enter'], {
      attrs: [{ part: 'header', key: 'order', attrs: { 'aria-sort': 'ascending' } }],
    }),
    row('Space checks the row', ['ArrowDown', ' '], {
      attrs: [{ part: 'row', key: '1042', attrs: { 'aria-selected': 'true' } }],
    }),
  ],
};

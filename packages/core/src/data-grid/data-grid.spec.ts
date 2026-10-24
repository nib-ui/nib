import { describe, expect, it, vi } from 'vitest';
import { runConformance } from '../testing/conformance.ts';
import { createTestHost } from '../testing/test-host.ts';
import { dataGridApg } from './data-grid.apg.ts';
import { createDataGrid, sortRows, windowOf, type DataGridOptions, type GridRow } from './index.ts';

const COLUMNS = [
  { key: 'item', label: 'Item', sortable: true, editable: true },
  { key: 'total', label: 'Total', numeric: true, sortable: true, width: 120 },
];
const ROWS: GridRow[] = [
  { key: 'a', item: 'Phở', total: 9 },
  { key: 'b', item: 'Bánh mì', total: 30 },
  { key: 'c', item: 'Cà phê', total: 100 },
];

function setup(options: Partial<DataGridOptions> = {}) {
  const t = createTestHost();
  const dg = createDataGrid({ id: 'dg', locale: 'vi', columns: COLUMNS, rows: ROWS, ...options }, t.host);
  const key = (init: Record<string, unknown>) => t.fire(dg.part('header', 'item'), 'keydown', init);
  return { t, dg, key };
}

describe('createDataGrid', () => {
  it('renders an APG grid with one cell in the tab order', () => {
    const { dg } = setup({ label: 'Orders' });
    expect(dg.part('grid').attrs).toMatchObject({
      role: 'grid',
      'aria-label': 'Orders',
      'aria-rowcount': 4,
      'aria-colcount': 2,
    });
    expect(dg.part('header', 'item').attrs).toMatchObject({ tabindex: 0, 'aria-sort': 'none', 'aria-colindex': 1 });
    expect(dg.part('cell', 'a::item').attrs['tabindex']).toBe(-1);
    expect(dg.part('row', 'b').attrs['aria-rowindex']).toBe(3);
  });

  it('sorts by a header click, numbers as numbers and text in the locale order', () => {
    const onSortChange = vi.fn();
    const { t, dg } = setup({ onSortChange });
    t.fire(dg.part('header', 'total'), 'click');
    expect(dg.state.rows.map((r) => r.key)).toEqual(['a', 'b', 'c']);
    t.fire(dg.part('header', 'total'), 'click');
    expect(dg.state.rows.map((r) => r.key)).toEqual(['c', 'b', 'a']);
    expect(dg.part('header', 'total').attrs['aria-sort']).toBe('descending');
    t.fire(dg.part('header', 'item'), 'click');
    expect(dg.state.rows.map((r) => r.item)).toEqual(['Bánh mì', 'Cà phê', 'Phở']);
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'item', direction: 'ascending' });
  });

  it('checks rows, all of the page from the header, and announces the count', () => {
    const onSelectionChange = vi.fn();
    const { t, dg } = setup({ selectable: true, onSelectionChange, labels: { selected: (n) => `Đã chọn ${n}` } });
    expect(t.fire(dg.part('select', 'b'), 'click')).toContainEqual({
      type: 'announce',
      text: 'Đã chọn 1',
      politeness: 'polite',
    });
    expect(dg.part('row', 'b').attrs['aria-selected']).toBe(true);
    expect(dg.part('select-all').attrs['data-checked']).toBe('mixed');
    expect(dg.part('bulk').attrs['hidden']).toBeUndefined();
    t.fire(dg.part('select-all'), 'click');
    expect(onSelectionChange).toHaveBeenLastCalledWith(['b', 'a', 'c']);
    t.fire(dg.part('select-all'), 'click');
    expect(dg.state.selected).toEqual([]);
    expect(dg.part('bulk').attrs['hidden']).toBe(true);
  });

  it('edits a cell with Enter, commits with Enter and returns focus; Escape cancels', () => {
    const onEdit = vi.fn();
    const { t, dg, key } = setup({ onEdit });
    key({ key: 'ArrowDown' });
    expect(key({ key: 'Enter' })).toEqual([{ type: 'focus', ref: 'dg-editor' }]);
    expect(dg.part('editor').attrs).toMatchObject({ value: 'Phở', 'aria-label': 'Item' });
    t.fire(dg.part('editor'), 'input', { value: 'Phở bò' });
    expect(t.fire(dg.part('editor'), 'keydown', { key: 'Enter' })).toEqual([{ type: 'focus', ref: 'dg-cell-a::item' }]);
    expect(onEdit).toHaveBeenCalledWith('a', 'item', 'Phở bò');
    key({ key: 'F2' });
    t.fire(dg.part('editor'), 'keydown', { key: 'Escape' });
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(dg.state.editing).toBeNull();
  });

  it('keeps rows passed back from onEdit straight away, as a vanilla or store binding does', () => {
    const t = createTestHost();
    const dg = createDataGrid(
      {
        id: 'dg',
        locale: 'vi',
        columns: COLUMNS,
        rows: ROWS,
        onEdit: (row, column, value) =>
          dg.update({ rows: ROWS.map((r) => (r.key === row ? { ...r, [column]: value } : r)) }),
      },
      t.host,
    );
    t.fire(dg.part('header', 'item'), 'keydown', { key: 'ArrowDown' });
    t.fire(dg.part('header', 'item'), 'keydown', { key: 'Enter' });
    t.fire(dg.part('editor'), 'input', { value: 'Phở bò' });
    t.fire(dg.part('editor'), 'keydown', { key: 'Enter' });
    expect(dg.state.rows[0]).toMatchObject({ key: 'a', item: 'Phở bò' });
    expect(dg.state.editing).toBeNull();
  });

  it('ignores grid keys typed in a field, and does not edit a read-only column', () => {
    const { key } = setup();
    key({ key: 'ArrowDown' });
    expect(key({ key: 'ArrowDown', inField: true })).toEqual([]);
    key({ key: 'ArrowRight' });
    expect(key({ key: 'Enter' })).toEqual([]);
  });

  it('pages rows and keeps focus on the page', () => {
    const onPageChange = vi.fn();
    const { t, dg } = setup({ pageSize: 2, onPageChange });
    expect(dg.state).toMatchObject({ page: 0, pageCount: 2 });
    expect(dg.part('prev-page').attrs['aria-disabled']).toBe(true);
    t.fire(dg.part('next-page'), 'click');
    expect(dg.state.rows.map((r) => r.key)).toEqual(['c']);
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(dg.part('next-page').attrs['aria-disabled']).toBe(true);
  });

  it('resizes a column by dragging its edge, never below its minimum, and with Alt+Arrow on the header', () => {
    const { t, dg, key } = setup();
    const resizer = () => dg.part('resizer', 'total');
    t.fire(resizer(), 'pointerdown', { clientX: 300 });
    t.fire(resizer(), 'pointermove', { clientX: 340 });
    expect(dg.state.widths['total']).toBe(160);
    t.fire(resizer(), 'pointermove', { clientX: 0 });
    expect(dg.state.widths['total']).toBe(48);
    t.fire(resizer(), 'pointerup');
    // The click that ends a drag does not sort.
    t.fire(dg.part('header', 'total'), 'click');
    expect(dg.state.sort).toBeNull();
    key({ key: 'ArrowRight' });
    key({ key: 'ArrowRight', altKey: true });
    expect(dg.state.widths['total']).toBe(64);
    expect(dg.part('header', 'total').attrs['style']).toBe('inline-size: 64px; min-inline-size: 64px');
  });

  it('virtualises from 1,000 rows, and renders around a focused row far from the scroll position', () => {
    const many = Array.from({ length: 5000 }, (_, i) => ({ key: String(i), item: `Row ${i}`, total: i }));
    const { t, dg, key } = setup({ rows: many, rowHeight: 30 });
    expect(dg.state.window).toMatchObject({ start: 0, before: 0 });
    t.fire(dg.part('scroller'), 'scroll', { scrollTop: 30_000, clientHeight: 600 });
    expect(dg.state.window).toMatchObject({ start: 990, end: 1030, before: 29_700 });
    key({ key: 'End', ctrlKey: true });
    expect(dg.state.window?.end).toBe(5000);
    expect(dg.part('cell', '4999::total').attrs['tabindex']).toBe(0);
  });

  it('passes every row of its APG table', () => {
    expect(runConformance(dataGridApg, createDataGrid as never).filter((r) => r.failures.length)).toEqual([]);
  });
});

describe('grid model', () => {
  it('sorts stably, and numerals in text by value', () => {
    const rows = [
      { key: '1', v: 'item 10' },
      { key: '2', v: 'item 9' },
      { key: '3', v: 'item 9' },
    ];
    const sorted = sortRows(rows, { column: 'v', direction: 'ascending' }, [{ key: 'v', label: 'V' }], 'en');
    expect(sorted.map((r) => r.key)).toEqual(['2', '3', '1']);
  });

  it('windows rows with overscan and clamps at the ends', () => {
    expect(windowOf(100, { top: 0, height: 300, rowHeight: 30, overscan: 5 })).toEqual({
      start: 0,
      end: 15,
      before: 0,
      after: 2550,
    });
    expect(windowOf(100, { top: 2700, height: 300, rowHeight: 30, overscan: 5 }).end).toBe(100);
  });
});

describe('createDataGrid updates', () => {
  it('keeps its state when options come back equal but fresh, as a React render passes them', () => {
    const t = createTestHost();
    const base = { id: 'dg', columns: COLUMNS, rows: ROWS, pageSize: 2 };
    const dg = createDataGrid({ ...base, sort: { column: 'total', direction: 'ascending' }, selected: ['a'] }, t.host);
    const before = dg.state;
    dg.update({ ...base, sort: { column: 'total', direction: 'ascending' }, selected: ['a'], onEdit: () => undefined });
    expect(dg.state).toBe(before);
  });
});

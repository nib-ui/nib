import type { Key } from '../parts/navigation.ts';

export interface GridColumn {
  key: string;
  /** The header word. */
  label: string;
  /** Header click or Enter sorts by it. */
  sortable?: boolean;
  /** Enter or F2 edits its cells. */
  editable?: boolean;
  /** Numbers: end-aligned, tabular, sorted as numbers. */
  numeric?: boolean;
  /** Starting width in px; the user may drag it. */
  width?: number;
  /** Narrowest it can be dragged, in px; default 48. */
  minWidth?: number;
}

/** A row: its key and a value per column key. */
export type GridRow = { key: Key } & Readonly<Record<string, unknown>>;

export interface GridSort {
  column: string;
  direction: 'ascending' | 'descending';
}

/** The rows a virtualised body renders, and the space it leaves above and below them. */
export interface GridWindow {
  start: number;
  end: number;
  before: number;
  after: number;
}

/** Rows sorted by a column (stable): numbers as numbers, text in the locale's order, numerals by value. */
export function sortRows(
  rows: readonly GridRow[],
  sort: GridSort | null,
  columns: readonly GridColumn[],
  locale: string,
): readonly GridRow[] {
  const column = sort && columns.find((c) => c.key === sort.column);
  if (!sort || !column) return rows;
  const collator = new Intl.Collator(locale, { numeric: true });
  const sign = sort.direction === 'ascending' ? 1 : -1;
  const cmp = (a: unknown, b: unknown) =>
    column.numeric ? Number(a) - Number(b) : collator.compare(String(a ?? ''), String(b ?? ''));
  return rows
    .map((row, i) => ({ row, i }))
    .sort((a, b) => sign * cmp(a.row[sort.column], b.row[sort.column]) || a.i - b.i)
    .map(({ row }) => row);
}

/** The slice of `count` rows of `rowHeight` px to render for a scroll position, with `overscan` rows either side. */
export function windowOf(
  count: number,
  { top, height, rowHeight, overscan = 10 }: { top: number; height: number; rowHeight: number; overscan?: number },
): GridWindow {
  const rows = Math.ceil(height / rowHeight);
  const first = Math.floor(top / rowHeight);
  const start = Math.max(0, first - overscan);
  const end = Math.min(count, first + rows + overscan);
  return { start, end, before: start * rowHeight, after: (count - end) * rowHeight };
}

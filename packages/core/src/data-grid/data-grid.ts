import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import type { Intent } from '../types.ts';
import type { GridPos } from './data-grid-keys.ts';
import { sortRows, windowOf, type GridColumn, type GridRow, type GridSort } from './data-grid-model.ts';
import { renderGridPart } from './data-grid-render.ts';
import type { DataGridEvent, DataGridOptions, DataGridPart, DataGridState, Drag } from './data-grid-types.ts';

const VIRTUAL_FROM = 1000;

/**
 * A data grid per the WAI-ARIA APG grid pattern: one cell in the tab order, arrows, Home/End and
 * Page Up/Down move it; Enter sorts a header or edits a cell (F2 too), Space checks a row. Sorting
 * is stable and locale-aware; rows are paged and, from 1,000 on a page, virtualised. Columns resize
 * by dragging their edge or with Alt+Left/Right on the header.
 */
export function createDataGrid(
  options: DataGridOptions,
  host: Host = nullHost,
): Instance<DataGridState, DataGridEvent, DataGridPart, DataGridOptions> {
  let sortInternal = options.defaultSort ?? null;
  let selectedInternal = options.defaultSelected ?? [];
  let pageInternal = options.defaultPage ?? 0;
  const sortOf = (o: DataGridOptions) => (o.sort !== undefined ? o.sort : sortInternal);
  const selectedOf = (o: DataGridOptions) => o.selected ?? selectedInternal;
  const pageCountOf = (o: DataGridOptions) => (o.pageSize ? Math.max(1, Math.ceil(o.rows.length / o.pageSize)) : 1);
  const pageOf = (o: DataGridOptions) => Math.min(o.page ?? pageInternal, pageCountOf(o) - 1);
  const height = (o: DataGridOptions) => o.rowHeight ?? 36;

  // Rows, page and window for the options and the scroll position: derived, never stored apart.
  // Sorting and paging are kept while their inputs stay the same, so a caller that passes equal
  // options on every render (React) gets the same rows back and never renders in a loop.
  const memo = <A extends readonly unknown[], R>(fn: (...args: A) => R) => {
    let last: { args: A; result: R } | null = null;
    return (...args: A) => {
      if (!last || args.some((a, i) => !Object.is(a, last?.args[i]))) last = { args, result: fn(...args) };
      return last.result;
    };
  };
  // The sort is compared by its column and direction: an equal one passed fresh each time counts as the same.
  const sorted = memo(
    (rows: readonly GridRow[], by: string, columns: readonly GridColumn[], locale: string, manual: boolean) => {
      const [column = '', direction] = by.split(' ');
      const sort = by ? { column, direction: direction as GridSort['direction'] } : null;
      return manual ? rows : sortRows(rows, sort, columns, locale);
    },
  );
  const paged = memo((rows: readonly GridRow[], page: number, size: number | undefined) =>
    size ? rows.slice(page * size, (page + 1) * size) : rows,
  );
  const windowed = memo((count: number, top: number, viewport: number, rowHeight: number, keep: number) =>
    windowOf(count, { top, height: viewport, rowHeight, keep }),
  );

  // Rows, page and window for the options and the scroll position: derived, never stored apart.
  const derive = (o: DataGridOptions, state: Pick<DataGridState, 'viewport' | 'focus'>) => {
    const sort = sortOf(o);
    const page = pageOf(o);
    const by = sort ? `${sort.column} ${sort.direction}` : '';
    const all = sorted(o.rows, by, o.columns, o.locale ?? 'en-US', !!o.manualSort);
    const rows = paged(all, page, o.pageSize);
    const virtual = o.virtualize ?? rows.length >= VIRTUAL_FROM;
    const { top, height: viewport } = state.viewport;
    const window = virtual ? windowed(rows.length, top, viewport, height(o), state.focus.row) : null;
    return { sort, page, pageCount: pageCountOf(o), rows, window, selected: selectedOf(o) };
  };
  const cols = (o: DataGridOptions) => o.columns.length + (o.selectable ? 1 : 0);
  const drag: Drag = { current: null, ended: false };

  return createInstance<DataGridState, DataGridEvent, DataGridPart, DataGridOptions>(
    {
      name: 'data-grid',
      parts: [
        'scroller',
        'grid',
        'header',
        'select-all',
        'resizer',
        'row',
        'spacer',
        'select',
        'cell',
        'editor',
        'bulk',
        'prev-page',
        'next-page',
      ],
      init: ({ options: o }) => {
        const base = { focus: { row: -1, col: 0 }, viewport: { top: 0, height: 20 * height(o) } };
        return { ...base, ...derive(o, base), editing: null, widths: {} };
      },
      sync: ({ state, options: o }) => {
        const next = { ...state, ...derive(o, state) };
        // A controlled sort or selection passed fresh but equal keeps the state as it is.
        if (next.sort?.column === state.sort?.column && next.sort?.direction === state.sort?.direction)
          next.sort = state.sort;
        if (next.selected.length === state.selected.length && next.selected.every((k, i) => k === state.selected[i]))
          next.selected = state.selected;
        // Rows went away (a filter, a smaller page): keep focus inside the grid.
        const row = Math.min(next.focus.row, next.rows.length - 1);
        const focus = row === next.focus.row ? next.focus : { ...next.focus, row };
        const same =
          (Object.keys(next) as (keyof DataGridState)[]).every((k) => next[k] === state[k]) && focus === state.focus;
        return same ? state : { ...next, focus, ...(focus === next.focus ? {} : derive(o, { ...next, focus })) };
      },
      reduce: ({ state, options: o, id }, event) => {
        const focusIntent = (pos: GridPos): Intent => ({ type: 'focus', ref: cellId(id, o, state.rows, pos) });
        switch (event.type) {
          case 'focus': {
            const focus = event.to;
            const moved = { ...state, focus, ...derive(o, { ...state, focus }) };
            return {
              state: moved,
              intents: [
                focusIntent(focus),
                { type: 'scroll-into-view', ref: cellId(id, o, moved.rows, focus), block: 'nearest' },
              ],
            };
          }
          case 'focused': {
            const { row, col } = event.to;
            return {
              state: row === state.focus.row && col === state.focus.col ? state : { ...state, focus: event.to },
            };
          }
          case 'scrolled': {
            const viewport = { top: event.top, height: event.height };
            if (viewport.top === state.viewport.top && viewport.height === state.viewport.height) return { state };
            return { state: { ...state, viewport, ...derive(o, { ...state, viewport }) } };
          }
          case 'sort': {
            const current = sortOf(o);
            const sort: GridSort = {
              column: event.column,
              direction:
                current?.column === event.column && current.direction === 'ascending' ? 'descending' : 'ascending',
            };
            if (o.sort === undefined) sortInternal = sort;
            o.onSortChange?.(sort);
            return { state: { ...state, ...derive(o, state) } };
          }
          case 'select': {
            const all = state.rows.map((r) => r.key);
            const now = selectedOf(o);
            const next =
              event.row === undefined
                ? all.every((k) => now.includes(k))
                  ? now.filter((k) => !all.includes(k))
                  : [...new Set([...now, ...all])]
                : now.includes(event.row)
                  ? now.filter((k) => k !== event.row)
                  : [...now, event.row];
            if (o.selected === undefined) selectedInternal = next;
            o.onSelectionChange?.(next);
            const text = o.labels?.selected?.(next.length) ?? `${next.length} selected`;
            return {
              state: { ...state, selected: selectedOf(o) },
              intents: [{ type: 'announce', text, politeness: 'polite' }],
            };
          }
          case 'page': {
            const page = Math.max(0, Math.min(pageCountOf(o) - 1, event.to));
            if (page === pageOf(o)) return { state };
            if (o.page === undefined) pageInternal = page;
            o.onPageChange?.(page);
            const base = {
              ...state,
              focus: { ...state.focus, row: Math.min(state.focus.row, 0) },
              viewport: { ...state.viewport, top: 0 },
            };
            return { state: { ...base, ...derive(o, base) } };
          }
          case 'edit': {
            const row = state.rows[state.focus.row];
            const column = o.columns[state.focus.col - (o.selectable ? 1 : 0)];
            if (!row || !column?.editable) return { state };
            const editing = { row: row.key, column: column.key, draft: String(row[column.key] ?? '') };
            return { state: { ...state, editing }, intents: [{ type: 'focus', ref: `${id}-editor` }] };
          }
          case 'draft':
            return { state: state.editing ? { ...state, editing: { ...state.editing, draft: event.value } } : state };
          case 'done': {
            if (!state.editing) return { state };
            const { row, column, draft } = state.editing;
            if (event.commit) o.onEdit?.(row, column, draft);
            // Back to the cell, unless focus already left the grid (a blur).
            return { state: { ...state, editing: null }, intents: event.refocus ? [focusIntent(state.focus)] : [] };
          }
          case 'width': {
            const column = o.columns.find((c) => c.key === event.column);
            if (!column) return { state };
            const width = Math.max(column.minWidth ?? 48, Math.round(event.width));
            return {
              state:
                state.widths[column.key] === width
                  ? state
                  : { ...state, widths: { ...state.widths, [column.key]: width } },
            };
          }
        }
      },
      render: (ctx, name, key = '', send) =>
        renderGridPart(ctx, name, key, send, { cols: cols(ctx.options), cellId, drag }),
    },
    options,
    host,
  );
}

/** The id of the cell at a focus position: a header, the select column, or a data cell. */
function cellId(id: string, o: DataGridOptions, rows: readonly GridRow[], { row, col }: GridPos): string {
  const offset = o.selectable ? 1 : 0;
  const column = col < offset ? 'select' : (o.columns[col - offset]?.key ?? '');
  // Ids follow the part convention `<id>-<part>-<key>`, so a part's element is found by its key.
  const rowKey = rows[row]?.key ?? '';
  if (column === 'select') return row < 0 ? `${id}-select-all` : `${id}-select-${rowKey}`;
  return row < 0 ? `${id}-header-${column}` : `${id}-cell-${rowKey}::${column}`;
}

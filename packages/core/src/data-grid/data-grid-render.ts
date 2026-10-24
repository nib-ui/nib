import type { Key } from '../parts/navigation.ts';
import type { Intent, NibEvent, Part } from '../types.ts';
import { gridKeydown, type GridPos } from './data-grid-keys.ts';
import type { GridRow } from './data-grid-model.ts';
import type { Ctx, DataGridEvent, DataGridPart, Helpers } from './data-grid-types.ts';

const indexes = new WeakMap<readonly GridRow[], Map<Key, number>>();
const indexOf = (rows: readonly GridRow[], key: Key) => {
  let map = indexes.get(rows);
  if (!map) indexes.set(rows, (map = new Map(rows.map((r, i) => [r.key, i]))));
  return map.get(key) ?? -1;
};

/** Every part of the data grid; see createDataGrid for the behaviour. */
export function renderGridPart(
  { state, options: o, id, host }: Ctx,
  name: DataGridPart,
  key: string,
  send: (e: DataGridEvent) => readonly Intent[],
  { cols, cellId, drag }: Helpers,
): Part {
  const offset = o.selectable ? 1 : 0;
  const labels = o.labels ?? {};
  const focusedId = cellId(id, o, state.rows, state.focus);
  const roving = (cell: string) => (cell === focusedId ? 0 : -1);
  const gridKey = (e: NibEvent) => gridKeydown(e, { state, options: o, id, host }, send, { cols, focusedId });
  // Every focusable cell follows focus and takes the grid's keys (they bubble up from an editor too).
  const follow = (to: GridPos) => ({ focus: () => send({ type: 'focused', to }), keydown: gridKey });
  const colOf = (column: string) => o.columns.findIndex((c) => c.key === column) + offset;

  switch (name) {
    case 'scroller':
      return {
        attrs: { id: `${id}-scroller` },
        on: { scroll: (e) => send({ type: 'scrolled', top: e.scrollTop ?? 0, height: e.clientHeight ?? 0 }) },
      };
    case 'grid':
      return {
        attrs: {
          id: `${id}-grid`,
          role: 'grid',
          'aria-label': o.label,
          'aria-rowcount': state.rows.length + 1,
          'aria-colcount': cols,
          'aria-multiselectable': o.selectable || undefined,
        },
        on: {},
      };
    case 'header': {
      const column = o.columns.find((c) => c.key === key);
      const sorted = state.sort?.column === key ? state.sort.direction : undefined;
      const width = state.widths[key] ?? column?.width;
      const cell = `${id}-header-${key}`;
      return {
        attrs: {
          id: cell,
          tabindex: roving(cell),
          'aria-colindex': colOf(key) + 1,
          'aria-sort': column?.sortable ? (sorted ?? 'none') : undefined,
          'data-numeric': column?.numeric || undefined,
          style: width ? `inline-size: ${width}px; min-inline-size: ${width}px` : undefined,
        },
        on: {
          ...follow({ row: -1, col: colOf(key) }),
          click: () => {
            if (drag.ended) return ((drag.ended = false), []);
            return column?.sortable ? send({ type: 'sort', column: key }) : [];
          },
        },
      };
    }
    case 'select-all': {
      const cell = `${id}-select-all`;
      const count = state.rows.filter((r) => state.selected.includes(r.key)).length;
      return {
        attrs: {
          id: cell,
          tabindex: roving(cell),
          'aria-colindex': 1,
          'aria-label': labels.selectAll ?? 'Select all rows',
          'data-checked': count === 0 ? 'false' : count === state.rows.length ? 'true' : 'mixed',
        },
        on: { ...follow({ row: -1, col: 0 }), click: () => send({ type: 'select' }) },
      };
    }
    case 'resizer': {
      const column = o.columns.find((c) => c.key === key);
      const width = state.widths[key] ?? column?.width;
      return {
        attrs: {
          role: 'separator',
          'aria-orientation': 'vertical',
          'aria-label': labels.resize?.(column?.label ?? key) ?? `Resize ${column?.label ?? key}`,
          'aria-valuenow': width,
          'aria-valuemin': column?.minWidth ?? 48,
        },
        on: {
          pointerdown: (e) => {
            e.preventDefault();
            e.capturePointer?.();
            const measured = host.geometry.measure(`${id}-header-${key}`)?.width ?? 0;
            drag.current = { column: key, x: e.clientX ?? 0, width: width ?? measured };
            return [];
          },
          pointermove: (e) => {
            const d = drag.current;
            if (!d || d.column !== key) return [];
            const rtl = (o.dir ?? host.geometry.direction?.(`${id}-grid`)) === 'rtl';
            return send({ type: 'width', column: key, width: d.width + ((e.clientX ?? d.x) - d.x) * (rtl ? -1 : 1) });
          },
          pointerup: () => ((drag.ended = !!drag.current), (drag.current = null), []),
          pointercancel: () => ((drag.current = null), []),
        },
      };
    }
    case 'row': {
      const index = indexOf(state.rows, key);
      return {
        attrs: {
          id: `${id}-row-${key}`,
          'aria-rowindex': index + 2,
          'aria-selected': o.selectable ? state.selected.includes(key) : undefined,
        },
        on: {},
      };
    }
    case 'spacer': {
      const px = state.window ? (key === 'before' ? state.window.before : state.window.after) : 0;
      return {
        attrs: { 'aria-hidden': true, hidden: px ? undefined : true, style: px ? `block-size: ${px}px` : undefined },
        on: {},
      };
    }
    case 'select': {
      const cell = `${id}-select-${key}`;
      return {
        attrs: {
          id: cell,
          tabindex: roving(cell),
          'aria-colindex': 1,
          'aria-label': labels.select ?? 'Select',
          'data-checked': state.selected.includes(key) ? 'true' : 'false',
        },
        on: { ...follow({ row: indexOf(state.rows, key), col: 0 }), click: () => send({ type: 'select', row: key }) },
      };
    }
    case 'cell': {
      const split = key.lastIndexOf('::');
      const row = key.slice(0, split);
      const column = key.slice(split + 2);
      const def = o.columns.find((c) => c.key === column);
      const cell = `${id}-cell-${key}`;
      return {
        attrs: {
          id: cell,
          tabindex: roving(cell),
          'aria-colindex': colOf(column) + 1,
          'aria-readonly': def?.editable ? 'false' : undefined,
          'data-numeric': def?.numeric || undefined,
        },
        on: {
          ...follow({ row: indexOf(state.rows, row), col: colOf(column) }),
          dblclick: () => (def?.editable ? send({ type: 'edit' }) : []),
        },
      };
    }
    case 'editor': {
      const column = o.columns.find((c) => c.key === state.editing?.column);
      return {
        attrs: { id: `${id}-editor`, value: state.editing?.draft ?? '', 'aria-label': column?.label },
        on: {
          input: (e) => send({ type: 'draft', value: e.value ?? '' }),
          keydown: (e) => {
            if (e.isComposing || (e.key !== 'Enter' && e.key !== 'Escape')) return [];
            e.preventDefault();
            return send({ type: 'done', commit: e.key === 'Enter', refocus: true });
          },
          blur: () => send({ type: 'done', commit: true, refocus: false }),
        },
      };
    }
    case 'bulk':
      return { attrs: { id: `${id}-bulk`, hidden: state.selected.length ? undefined : true }, on: {} };
    case 'prev-page':
    case 'next-page': {
      const by = name === 'prev-page' ? -1 : 1;
      const off = by < 0 ? state.page === 0 : state.page >= state.pageCount - 1;
      return {
        attrs: {
          id: `${id}-${name}`,
          type: 'button',
          'aria-label': by < 0 ? (labels.prevPage ?? 'Previous page') : (labels.nextPage ?? 'Next page'),
          'aria-disabled': off || undefined,
        },
        on: { click: () => (off ? [] : send({ type: 'page', to: state.page + by })) },
      };
    }
  }
}

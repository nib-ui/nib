import type { DataGridState, GridColumn } from '@nib-ui/core/data-grid';

// What the body last showed, so a render that changes nothing visible rebuilds nothing.
const shown = new WeakMap<HTMLTableSectionElement, { rows: unknown; window: unknown; editing: string }>();

/**
 * Writes the grid's body: spacer rows around the rendered window, a row per record with its
 * select cell and data cells, and the editor in the cell being edited. Each element is marked
 * `data-nib-target="<part>|<key>"` for `bind` to wire.
 */
export function renderGridBody(
  body: HTMLTableSectionElement,
  state: DataGridState,
  columns: readonly GridColumn[],
  selectable: boolean,
  doc: Document,
): void {
  // The cell being edited, not its draft: typing must not rebuild the editor it types into.
  const editing = state.editing ? `${state.editing.row}::${state.editing.column}` : '';
  const last = shown.get(body);
  if (last && last.rows === state.rows && last.window === state.window && last.editing === editing) return;
  shown.set(body, { rows: state.rows, window: state.window, editing });
  const mark = (el: HTMLElement, part: string, key: string) => ((el.dataset['nibTarget'] = `${part}|${key}`), el);
  const spacer = (key: 'before' | 'after') => {
    const tr = mark(doc.createElement('tr'), 'spacer', key);
    tr.append(Object.assign(doc.createElement('td'), { colSpan: columns.length + (selectable ? 1 : 0) }));
    return tr;
  };
  const { start, end } = state.window ?? { start: 0, end: state.rows.length };
  const trs = state.rows.slice(start, end).map((row) => {
    const tr = mark(doc.createElement('tr'), 'row', row.key);
    if (selectable) tr.append(mark(doc.createElement('td'), 'select', row.key));
    for (const column of columns) {
      const td = mark(doc.createElement('td'), 'cell', `${row.key}::${column.key}`);
      if (editing === `${row.key}::${column.key}`) {
        const input = mark(doc.createElement('input'), 'editor', '');
        input.className = 'nib-data-grid__editor';
        td.append(input);
      } else td.textContent = String(row[column.key] ?? '');
      tr.append(td);
    }
    return tr;
  });
  // A rebuild while a cell has focus (scrolling a virtual grid) puts focus back on the same cell.
  const active = doc.activeElement as HTMLElement | null;
  const had = active && body.contains(active) ? active.dataset['nibTarget'] : undefined;
  body.replaceChildren(spacer('before'), ...trs, spacer('after'));
  if (had) body.querySelector<HTMLElement>(`[data-nib-target="${CSS.escape(had)}"]`)?.focus({ preventScroll: true });
}

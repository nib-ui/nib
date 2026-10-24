import type { Intent, NibEvent } from '../types.ts';
import type { Ctx, DataGridEvent } from './data-grid-types.ts';

/** A focus position: row -1 is the header row; columns count the select column when there is one. */
export interface GridPos {
  row: number;
  col: number;
}

/**
 * Where a key moves focus in the grid (APG data grid): arrows by a cell, Home and End to the row's
 * ends (with Ctrl, the grid's), Page Up and Down by `page` rows. Left and right follow the reading
 * direction. Null for a key that does not move.
 */
export function gridTarget(
  e: NibEvent,
  at: GridPos,
  size: { rows: number; cols: number; page: number },
  rtl: boolean,
): GridPos | null {
  const clampRow = (row: number) => Math.max(-1, Math.min(size.rows - 1, row));
  const clampCol = (col: number) => Math.max(0, Math.min(size.cols - 1, col));
  const back = rtl ? 1 : -1;
  switch (e.key) {
    case 'ArrowLeft':
      return { ...at, col: clampCol(at.col + back) };
    case 'ArrowRight':
      return { ...at, col: clampCol(at.col - back) };
    case 'ArrowUp':
      return { ...at, row: clampRow(at.row - 1) };
    case 'ArrowDown':
      return { ...at, row: clampRow(at.row + 1) };
    case 'Home':
      return e.ctrlKey ? { row: Math.min(0, size.rows - 1), col: 0 } : { ...at, col: 0 };
    case 'End':
      return e.ctrlKey ? { row: size.rows - 1, col: size.cols - 1 } : { ...at, col: size.cols - 1 };
    case 'PageUp':
      // From the header row there is nothing above; otherwise Page Up stops at the first row.
      return at.row < 0 ? at : { ...at, row: clampRow(Math.max(0, at.row - size.page)) };
    case 'PageDown':
      return { ...at, row: clampRow(at.row + size.page) };
    default:
      return null;
  }
}

const STEP = 16;

/**
 * The grid's keys, on whichever cell has focus: moving, Alt+Left/Right resizing a header's column,
 * Enter sorting a header or editing a cell (F2 too), Space checking a row.
 */
export function gridKeydown(
  e: NibEvent,
  { state, options: o, id, host }: Ctx,
  send: (e: DataGridEvent) => readonly Intent[],
  { cols, focusedId }: { cols: number; focusedId: string },
): readonly Intent[] {
  const offset = o.selectable ? 1 : 0;
  const focus = (to: GridPos) => send({ type: 'focus', to });
  // Keys typed into the cell editor (or any field in a cell) belong to typing.
  if (e.inField || state.editing || e.metaKey) return [];
  const { row, col } = state.focus;
  const column = o.columns[col - offset];
  if (row === -1 && column && e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    e.preventDefault();
    const rtl = (o.dir ?? host.geometry.direction?.(`${id}-grid`)) === 'rtl';
    const grow = (e.key === 'ArrowRight') !== rtl ? STEP : -STEP;
    const width = state.widths[column.key] ?? column.width ?? host.geometry.measure(focusedId)?.width ?? 0;
    return send({ type: 'width', column: column.key, width: width + grow });
  }
  if (e.altKey) return [];
  const page = Math.max(1, Math.floor(state.viewport.height / (o.rowHeight ?? 36)) - 1);
  const rtl = () => (o.dir ?? host.geometry.direction?.(`${id}-grid`)) === 'rtl';
  const to = gridTarget(e, state.focus, { rows: state.rows.length, cols, page }, rtl());
  if (to) {
    e.preventDefault();
    return to.row === row && to.col === col ? [] : focus(to);
  }
  const pressed = e.key === 'Enter' || e.key === ' ' || e.key === 'F2';
  if (!pressed) return [];
  e.preventDefault();
  if (row === -1) {
    if (col < offset) return e.key === 'F2' ? [] : send({ type: 'select' });
    return column?.sortable && e.key === 'Enter' ? send({ type: 'sort', column: column.key }) : [];
  }
  const rowKey = state.rows[row]?.key;
  if (rowKey !== undefined && o.selectable && (e.key === ' ' || col < offset))
    return send({ type: 'select', row: rowKey });
  return column?.editable && e.key !== ' ' ? send({ type: 'edit' }) : [];
}

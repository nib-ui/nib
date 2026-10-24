import { createDataGrid, type DataGridOptions } from '@nib-ui/core/data-grid';
import { useController } from './use-controller.ts';

/**
 * Data grid for React: its state (the page's sorted `rows`, the virtual `window`, `selected`,
 * `editing`), and props for `scroller`, `grid`, each `header`, `resizer` (by column key),
 * `select-all`, each `row` and `select` (by row key), each `cell` (by `row::column`), `editor`,
 * the `spacer`s (`before` / `after`), `bulk`, `prev-page` and `next-page`.
 */
export function useDataGrid(options: DataGridOptions) {
  return useController(createDataGrid, options);
}

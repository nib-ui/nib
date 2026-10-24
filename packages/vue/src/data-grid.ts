import { createDataGrid, type DataGridOptions } from '@nib-ui/core/data-grid';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/**
 * Data grid for Vue: its state (the page's sorted `rows`, the virtual `window`, `selected`,
 * `editing`), and `v-bind` objects for each part; cells are keyed `row::column`.
 */
export function useDataGrid(options: MaybeRefOrGetter<DataGridOptions>) {
  return useController(createDataGrid, options);
}

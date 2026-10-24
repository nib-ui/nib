import { createDataGrid, type DataGridOptions } from '@nib-ui/core/data-grid';
import { controller } from './controller.ts';

/** Data grid for Svelte: a store of its state and spreadable attributes for each part; cells are keyed `row::column`. */
export function createDataGridStore(options: DataGridOptions) {
  return controller(createDataGrid, options);
}

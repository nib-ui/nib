<script setup lang="ts">
import { dataGridApg } from '@nib-ui/core/data-grid/apg';
import type { DataGridOptions, GridRow } from '@nib-ui/core/data-grid';
import { useDataGrid } from '@nib-ui/vue/data-grid';
import { computed, shallowRef } from 'vue';
import { caseOptions } from './apg-case.ts';

const options = caseOptions(dataGridApg) as unknown as DataGridOptions;
const rows = shallowRef<readonly GridRow[]>(options.rows);
const dg = useDataGrid(() => ({
  ...options,
  rows: rows.value,
  onEdit: (row: string, column: string, value: string) =>
    (rows.value = rows.value.map((r) => (r.key === row ? { ...r, [column]: value } : r))),
}));
const shown = computed(() => {
  const { start, end } = dg.state.window ?? { start: 0, end: dg.state.rows.length };
  return dg.state.rows.slice(start, end);
});
const editing = (row: string, column: string) => dg.state.editing?.row === row && dg.state.editing.column === column;
</script>

<template>
  <div class="nib-data-grid" v-bind="dg.part('scroller')">
    <table class="nib-table" v-bind="dg.part('grid')">
      <thead>
        <tr>
          <th v-if="options.selectable" v-bind="dg.part('select-all')"></th>
          <th v-for="c in options.columns" :key="c.key" v-bind="dg.part('header', c.key)">
            {{ c.label }}<span class="nib-data-grid__resizer" v-bind="dg.part('resizer', c.key)"></span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-bind="dg.part('spacer', 'before')"></tr>
        <tr v-for="row in shown" :key="row.key" v-bind="dg.part('row', row.key)">
          <td v-if="options.selectable" v-bind="dg.part('select', row.key)"></td>
          <td v-for="c in options.columns" :key="c.key" v-bind="dg.part('cell', `${row.key}::${c.key}`)">
            <input v-if="editing(row.key, c.key)" class="nib-data-grid__editor" v-bind="dg.part('editor')" />
            <template v-else>{{ row[c.key] }}</template>
          </td>
        </tr>
        <tr v-bind="dg.part('spacer', 'after')"></tr>
      </tbody>
    </table>
  </div>
</template>

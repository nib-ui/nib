<script lang="ts">
  import { dataGridApg } from '@nib-ui/core/data-grid/apg';
  import type { DataGridOptions, GridRow } from '@nib-ui/core/data-grid';
  import { createDataGridStore } from '@nib-ui/svelte/data-grid';
  import { caseOptions } from './apg-case.ts';

  const options = caseOptions(dataGridApg) as unknown as DataGridOptions;
  let rows: readonly GridRow[] = options.rows;
  const dg = createDataGridStore({
    ...options,
    onEdit: (row, column, value) => {
      rows = rows.map((r) => (r.key === row ? { ...r, [column]: value } : r));
      dg.update({ rows });
    },
  });
  const shown = $derived.by(() => {
    const { start, end } = $dg.state.window ?? { start: 0, end: $dg.state.rows.length };
    return $dg.state.rows.slice(start, end);
  });
</script>

<div class="nib-data-grid" {...$dg.part('scroller')}>
  <table class="nib-table" {...$dg.part('grid')}>
    <thead>
      <tr>
        {#if options.selectable}<th {...$dg.part('select-all')}></th>{/if}
        {#each options.columns as c (c.key)}
          <th {...$dg.part('header', c.key)}>
            {c.label}<span class="nib-data-grid__resizer" {...$dg.part('resizer', c.key)}></span>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <tr {...$dg.part('spacer', 'before')}></tr>
      {#each shown as row (row.key)}
        <tr {...$dg.part('row', row.key)}>
          {#if options.selectable}<td {...$dg.part('select', row.key)}></td>{/if}
          {#each options.columns as c (c.key)}
            <td {...$dg.part('cell', `${row.key}::${c.key}`)}>
              {#if $dg.state.editing?.row === row.key && $dg.state.editing.column === c.key}
                <input class="nib-data-grid__editor" {...$dg.part('editor')} />
              {:else}{row[c.key]}{/if}
            </td>
          {/each}
        </tr>
      {/each}
      <tr {...$dg.part('spacer', 'after')}></tr>
    </tbody>
  </table>
</div>

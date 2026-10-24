import { dataGridApg } from '@nib-ui/core/data-grid/apg';
import type { DataGridOptions, GridRow } from '@nib-ui/core/data-grid';
import { useDataGrid } from '@nib-ui/react/data-grid';
import { useState } from 'react';
import { caseOptions } from './apg-case.ts';

const options = caseOptions(dataGridApg) as unknown as DataGridOptions;

export default function DataGridReact() {
  const [rows, setRows] = useState<readonly GridRow[]>(options.rows);
  const dg = useDataGrid({
    ...options,
    rows,
    onEdit: (row, column, value) => setRows((all) => all.map((r) => (r.key === row ? { ...r, [column]: value } : r))),
  });
  const { start, end } = dg.state.window ?? { start: 0, end: dg.state.rows.length };
  return (
    <div className="nib-data-grid" {...dg.part('scroller')}>
      <table className="nib-table" {...dg.part('grid')}>
        <thead>
          <tr>
            {options.selectable && <th {...dg.part('select-all')} />}
            {options.columns.map((c) => (
              <th key={c.key} {...dg.part('header', c.key)}>
                {c.label}
                <span className="nib-data-grid__resizer" {...dg.part('resizer', c.key)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr {...dg.part('spacer', 'before')} />
          {dg.state.rows.slice(start, end).map((row) => (
            <tr key={row.key} {...dg.part('row', row.key)}>
              {options.selectable && <td {...dg.part('select', row.key)} />}
              {options.columns.map((c) => (
                <td key={c.key} {...dg.part('cell', `${row.key}::${c.key}`)}>
                  {dg.state.editing?.row === row.key && dg.state.editing.column === c.key ? (
                    <input className="nib-data-grid__editor" {...dg.part('editor')} />
                  ) : (
                    String(row[c.key] ?? '')
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr {...dg.part('spacer', 'after')} />
        </tbody>
      </table>
    </div>
  );
}

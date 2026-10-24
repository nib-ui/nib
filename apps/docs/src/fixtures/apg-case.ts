// The keyboard specs run each row of a component's APG table against every binding. Fixture pages
// read the row from `?case=<index>` and render the component with that row's options.
import type { ConformanceTable } from '@nib-ui/core/testing';

export function caseOptions(table: ConformanceTable): Record<string, unknown> {
  const index = Number(new URLSearchParams(location.search).get('case') ?? 0);
  const row = table.cases[index];
  if (!row) throw new Error(`${table.pattern} has no case ${index}`);
  return row.options;
}

// Importing this module registers `data-nib="data-grid"`; call init() to set one up.
//
// <div data-nib="data-grid" class="nib-data-grid" data-label="Orders" data-selectable data-page-size="50">
//   <table class="nib-table">
//     <thead><tr>
//       <th data-column="order" data-sortable>Order</th>
//       <th data-column="item" data-editable>Item</th>
//       <th data-column="total" data-numeric data-sortable data-width="120">Total</th>
//     </tr></thead>
//     <tbody>
//       <tr data-row="1042"><td>#1042</td><td>Kenya Nyeri</td><td>48.00</td></tr>
//     </tbody>
//   </table>
// </div>
//
// The scrolling element is `[data-nib-scroller]` inside the root, or the root itself. The rows are
// read once from the markup; the grid then renders its body itself (sorted, paged,
// virtualised). Optional: a `[data-nib-bulk]` bar (shown while rows are checked, its
// `[data-nib-count]` filled in), `[data-nib-prev-page]` / `[data-nib-next-page]` buttons and a
// `[data-nib-page]` (class `nib-data-grid__page`) that shows "2 / 5".
// Events: `nib:sort`, `nib:select` (`detail.selected`), `nib:edit` (`detail.row/column/value`).
import { createDataGrid, type GridColumn, type GridRow } from '@nib-ui/core/data-grid';
import { bind } from './bind.ts';
import { define } from './registry.ts';
import { renderGridBody } from './data-grid-body.ts';

define('data-grid', (root, { id, locale, host }) => {
  const table = root.querySelector('table');
  const head = table?.tHead?.rows[0];
  if (!table || !head) throw new Error('[nib] data-grid needs a <table> with a <thead> row');
  const doc = root.ownerDocument;
  const heads = [...head.cells].filter((th) => th.dataset['column']);
  const columns: GridColumn[] = heads.map((th) => ({
    key: th.dataset['column'] ?? '',
    label: (th.textContent ?? '').trim(),
    sortable: th.hasAttribute('data-sortable'),
    editable: th.hasAttribute('data-editable'),
    numeric: th.hasAttribute('data-numeric'),
    ...(Number(th.dataset['width']) > 0 && { width: Number(th.dataset['width']) }),
  }));
  let rows: GridRow[] = [...(table.tBodies[0]?.rows ?? [])].map((tr) => ({
    key: tr.dataset['row'] ?? '',
    ...Object.fromEntries(columns.map((c, i) => [c.key, (tr.cells[i]?.textContent ?? '').trim()])),
  }));
  // The authored body comes back on destroy, so init can read it again.
  const authored = [...(table.tBodies[0]?.childNodes ?? [])];
  const scroller = root.querySelector<HTMLElement>('[data-nib-scroller]') ?? root;
  const emit = (type: string, detail: object) =>
    queueMicrotask(() => root.dispatchEvent(new CustomEvent(type, { detail, bubbles: true })));
  const selectable = root.hasAttribute('data-selectable');
  const pageSize = Number(root.dataset['pageSize']) || undefined;
  const label = root.dataset['label'];
  const instance = createDataGrid(
    {
      id,
      locale,
      columns,
      rows,
      selectable,
      ...(pageSize && { pageSize }),
      ...(label && { label }),
      viewportHeight: scroller.clientHeight || undefined,
      onSortChange: (sort) => emit('nib:sort', sort),
      onSelectionChange: (selected) => emit('nib:select', { selected }),
      onEdit: (row, column, value) => {
        rows = rows.map((r) => (r.key === row ? { ...r, [column]: value } : r));
        instance.update({ rows });
        emit('nib:edit', { row, column, value });
      },
    },
    host,
  );

  // The header gets its select cell and a resize handle per column.
  const selectAll = selectable ? doc.createElement('th') : null;
  if (selectAll) head.prepend(selectAll);
  const resizers = heads.map((th) => {
    const handle = doc.createElement('span');
    handle.className = 'nib-data-grid__resizer';
    th.append(handle);
    return handle;
  });
  const body = table.tBodies[0] ?? table.createTBody();
  const own = (selector: string) => [...root.querySelectorAll<HTMLElement>(selector)];
  const render = () => {
    renderGridBody(body, instance.state, columns, selectable, doc);
    const count = String(instance.state.selected.length);
    for (const el of own('[data-nib-count]')) el.textContent = count;
    const page = `${instance.state.page + 1} / ${instance.state.pageCount}`;
    for (const el of own('[data-nib-page]')) el.textContent = page;
  };
  render();
  const unsubscribe = instance.subscribe(render);
  const unbind = bind(instance, () => [
    { el: scroller, part: 'scroller' as const },
    { el: table, part: 'grid' as const },
    ...(selectAll ? [{ el: selectAll, part: 'select-all' as const }] : []),
    ...heads.map((el, i) => ({ el, part: 'header' as const, key: columns[i]?.key })),
    ...resizers.map((el, i) => ({ el, part: 'resizer' as const, key: columns[i]?.key })),
    ...[...body.querySelectorAll<HTMLElement>('[data-nib-target]')].map((el) => {
      const [part = '', key] = (el.dataset['nibTarget'] ?? '').split('|');
      return { el, part: part as 'row', key };
    }),
    ...own('[data-nib-bulk]').map((el) => ({ el, part: 'bulk' as const })),
    ...own('[data-nib-prev-page]').map((el) => ({ el, part: 'prev-page' as const })),
    ...own('[data-nib-next-page]').map((el) => ({ el, part: 'next-page' as const })),
  ]);
  // A virtual grid renders as many rows as its scroller shows, so it follows the scroller's size.
  const resize = new ResizeObserver(() => {
    if (scroller.clientHeight)
      instance.send({ type: 'scrolled', top: scroller.scrollTop, height: scroller.clientHeight });
  });
  resize.observe(scroller);
  return () => {
    resize.disconnect();
    unsubscribe();
    unbind();
    body.replaceChildren(...authored);
    instance.destroy();
    selectAll?.remove();
    for (const handle of resizers) handle.remove();
  };
});

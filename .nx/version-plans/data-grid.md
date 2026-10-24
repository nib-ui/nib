---
nib: minor
---

Data grid: `createDataGrid` in `@nib-ui/core/data-grid` (APG data grid with one tab stop; sorting that is stable and locale-aware, or `manualSort`; row selection with a select-all header; Enter/F2 cell editing with `onEdit`; column resize by drag or Alt+Left/Right; paging; windowed rendering from 1,000 rows on a page) and `sortRows` / `windowOf`; `useDataGrid` (React, Vue), `createDataGridStore` (Svelte), `data-nib="data-grid"` (vanilla, reads its rows from the table markup); `nib-data-grid` in `@nib-ui/css`. `NibEvent` carries `clientX` and `capturePointer()` on pointer events and `scrollTop` / `clientHeight` on scroll. A send or `update()` made from a callback inside a controller's reduce now applies after reduce's own state is committed.

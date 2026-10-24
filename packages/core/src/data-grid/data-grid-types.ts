import type { Host } from '../host.ts';
import type { Key } from '../parts/navigation.ts';
import type { GridPos } from './data-grid-keys.ts';
import type { GridColumn, GridRow, GridSort, GridWindow } from './data-grid-model.ts';

export interface DataGridOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag: text sorts in its order. */
  locale?: string;
  /** The grid's name. */
  label?: string;
  columns: readonly GridColumn[];
  rows: readonly GridRow[];
  /** Defined (null included) makes sorting controlled. */
  sort?: GridSort | null;
  defaultSort?: GridSort | null;
  onSortChange?: (sort: GridSort) => void;
  /** The caller sorts (a server): rows are shown as given. */
  manualSort?: boolean;
  /** Adds a select column; checked rows are `aria-selected` and show the bulk action bar. */
  selectable?: boolean;
  /** Defined makes selection controlled. */
  selected?: readonly Key[];
  defaultSelected?: readonly Key[];
  onSelectionChange?: (selected: readonly Key[]) => void;
  /** Rows per page; without it every row is on one page. */
  pageSize?: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** A finished cell edit; the caller updates `rows`. */
  onEdit?: (row: Key, column: string, value: string) => void;
  /** Row height in px, which virtualisation counts on and the rows are drawn at; default 36. */
  rowHeight?: number;
  /**
   * Height in px of the scrolling element before it first scrolls, for virtualised rows; default
   * 20 rows. The vanilla binding measures it; set it for a taller grid in a framework binding.
   */
  viewportHeight?: number;
  /** Render only the rows in view; default on from 1,000 rows on a page. */
  virtualize?: boolean;
  dir?: 'ltr' | 'rtl';
  /** Words, in the page's language. */
  labels?: {
    select?: string;
    selectAll?: string;
    selected?: (count: number) => string;
    resize?: (column: string) => string;
    prevPage?: string;
    nextPage?: string;
  };
}

export interface DataGridState {
  sort: GridSort | null;
  /** 0-based. */
  page: number;
  pageCount: number;
  /** The rows of this page, sorted. */
  rows: readonly GridRow[];
  /** Virtualised: which of `rows` to render and the space around them; null renders them all. */
  window: GridWindow | null;
  focus: GridPos;
  selected: readonly Key[];
  editing: { row: Key; column: string; draft: string } | null;
  /** Column widths in px, once set or dragged. */
  widths: Readonly<Record<string, number>>;
  /** The visible box of the scroller, from its scroll events. */
  viewport: { top: number; height: number };
}

export type DataGridEvent =
  | { type: 'focus'; to: GridPos }
  /** The browser moved focus to a cell (a click, a screen reader): follow it, no intents. */
  | { type: 'focused'; to: GridPos }
  | { type: 'scrolled'; top: number; height: number }
  | { type: 'sort'; column: string }
  /** A row's check; without `row`, every row of the page. */
  | { type: 'select'; row?: Key }
  | { type: 'page'; to: number }
  | { type: 'edit' }
  | { type: 'draft'; value: string }
  | { type: 'done'; commit: boolean; refocus: boolean }
  | { type: 'width'; column: string; width: number };

export type DataGridPart =
  | 'scroller'
  | 'grid'
  | 'header'
  | 'select-all'
  | 'resizer'
  | 'row'
  | 'spacer'
  | 'select'
  | 'cell'
  | 'editor'
  | 'bulk'
  | 'prev-page'
  | 'next-page';

export interface Ctx {
  state: DataGridState;
  options: DataGridOptions;
  id: string;
  host: Host;
}

/** A column edge being dragged, shared by one grid's resizers. */
export interface Drag {
  current: { column: string; x: number; width: number } | null;
  /** A drag just ended: the click it makes must not sort the column. */
  ended: boolean;
}

export interface Helpers {
  cols: number;
  cellId: (id: string, o: DataGridOptions, rows: readonly GridRow[], pos: GridPos) => string;
  drag: Drag;
}

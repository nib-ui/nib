import { readFileSync } from 'node:fs';

interface Budgets {
  /** All of `@nib-ui/css`: tokens, base and components. */
  css: string;
  /** The opt-in utilities file. */
  utilities: string;
  /** One component stylesheet built on its own. */
  cssModule: string;
  /** One JS module: a controller or a binding entry. */
  module: string;
  /** Combobox, date picker and data grid. */
  heavyModule: string;
}

// The numbers live in size-budgets.json at the workspace root, so a package's .size-limit.js can
// read them without depending on this package (which itself depends on @nib-ui/tokens).
const budgets = JSON.parse(readFileSync(new URL('../../../size-budgets.json', import.meta.url), 'utf8')) as Budgets & {
  $comment?: string;
};
delete budgets.$comment;

/** Size budgets (gzip) that fail CI when exceeded, in size-limit's notation. */
export const BUDGETS: Readonly<Budgets> = Object.freeze(budgets);

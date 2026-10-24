import { readFileSync } from 'node:fs';

const BUDGETS = JSON.parse(readFileSync(new URL('../../size-budgets.json', import.meta.url), 'utf8'));

// tokens.css ships inside every Nib stylesheet, so it counts against the CSS budget.
export default [{ name: 'tokens.css', path: 'dist/tokens.css', limit: BUDGETS.css, gzip: true }];

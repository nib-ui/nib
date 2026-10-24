import { readFileSync } from 'node:fs';

const BUDGETS = JSON.parse(readFileSync(new URL('../../size-budgets.json', import.meta.url), 'utf8'));

// Tokens, base and every component in one file.
export default [{ name: '@nib-ui/css', path: 'dist/nib.css', limit: BUDGETS.css, gzip: true }];

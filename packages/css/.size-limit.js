import { existsSync, readdirSync, readFileSync } from 'node:fs';

const BUDGETS = JSON.parse(readFileSync(new URL('../../size-budgets.json', import.meta.url), 'utf8'));
const components = existsSync('src/components') ? readdirSync('src/components').filter((f) => f.endsWith('.css')) : [];

// The whole stylesheet against the CSS budget, and each component file against the module budget.
export default [
  { name: '@nib-ui/css', path: 'dist/nib.css', limit: BUDGETS.css, gzip: true },
  ...components.map((file) => ({ name: file, path: `dist/components/${file}`, limit: BUDGETS.module, gzip: true })),
];

import { readFileSync } from 'node:fs';

const BUDGETS = JSON.parse(readFileSync(new URL('../../size-budgets.json', import.meta.url), 'utf8'));

export default [{ name: '@nib-ui/vue', path: 'dist/index.js', limit: BUDGETS.module, gzip: true, ignore: ['vue'] }];

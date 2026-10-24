import { readFileSync } from 'node:fs';

const BUDGETS = JSON.parse(readFileSync(new URL('../../size-budgets.json', import.meta.url), 'utf8'));
const { exports } = JSON.parse(readFileSync(new URL('package.json', import.meta.url), 'utf8'));
// These may grow to the heavy budget (ADR 6); every other controller gets the module budget.
const HEAVY = ['combobox', 'command-palette', 'date-picker', 'data-grid'];

// One entry per controller subpath, bundled with the kernel it pulls in. The test helpers ship
// separately and do not count.
export default Object.entries(exports)
  .filter(([path]) => path !== './package.json' && path !== './testing')
  .map(([path, target]) => ({
    name: `@nib-ui/core${path.slice(1)}`,
    path: target.default,
    limit: HEAVY.includes(path.slice(2)) ? BUDGETS.heavyModule : BUDGETS.module,
    gzip: true,
  }));

import { readFileSync } from 'node:fs';

const BUDGETS = JSON.parse(readFileSync(new URL('../../size-budgets.json', import.meta.url), 'utf8'));
const { exports } = JSON.parse(readFileSync(new URL('package.json', import.meta.url), 'utf8'));

// One entry per subpath (the bridge, then one per component). Core and dom are budgeted in their
// own packages, so only this package's code counts.
export default Object.entries(exports)
  .filter(([path]) => path !== './package.json')
  .map(([path, target]) => ({
    name: `@nib-ui/js${path.slice(1)}`,
    path: target.default,
    limit: BUDGETS.module,
    gzip: true,
    ignore: ['@nib-ui/core', '@nib-ui/dom'],
  }));

// Size budgets for CSS files: gzip each file and compare it with its budget in size-budgets.json.
// size-limit's esbuild plugin, which the JS packages need, cannot measure a CSS file, so CSS is
// checked here. Usage: node css-size.ts <budget>=<file>... (budget is a key of size-budgets.json)
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const budgets: Record<string, string> = JSON.parse(
  readFileSync(new URL('../size-budgets.json', import.meta.url), 'utf8'),
);
const bytes = (size: string) => Number.parseFloat(size) * (size.endsWith('kB') ? 1000 : 1);

let over = 0;
for (const arg of process.argv.slice(2)) {
  const [budget = '', file = ''] = arg.split('=');
  const limit = budgets[budget];
  if (!limit) throw new Error(`Unknown budget "${budget}" for ${file}`);
  const size = gzipSync(readFileSync(file), { level: 9 }).length;
  const ok = size <= bytes(limit);
  if (!ok) over++;
  console.log(`${ok ? '✓' : '✗'} ${file}: ${(size / 1000).toFixed(2)} kB gzip (limit ${limit})`);
}
if (over) process.exit(1);

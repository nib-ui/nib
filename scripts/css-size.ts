// Size budgets for CSS files: gzip each file and compare it with its budget in size-budgets.json.
// size-limit's esbuild plugin, which the JS packages need, cannot measure a CSS file, so CSS is
// checked here. Usage: node css-size.ts <budget>=<file>... (budget is a key of size-budgets.json)
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const budgets: Record<string, string> = JSON.parse(
  readFileSync(new URL('../size-budgets.json', import.meta.url), 'utf8'),
);
// The units size-limit accepts: B, kB (1000), KiB (1024); case-insensitive "kb" is read as kB.
const UNITS: Record<string, number> = { b: 1, kb: 1000, kib: 1024 };
const bytes = (size: string) => {
  const match = /^\s*([\d.]+)\s*([a-z]*)\s*$/i.exec(size);
  const unit = UNITS[(match?.[2] || 'b').toLowerCase()];
  if (!match || unit === undefined) throw new Error(`Cannot read the size "${size}"`);
  return Number.parseFloat(match[1] ?? '') * unit;
};

let over = 0;
for (const arg of process.argv.slice(2)) {
  const at = arg.indexOf('=');
  const [budget, file] = [arg.slice(0, at), arg.slice(at + 1)];
  const limit = budgets[budget];
  if (!limit) throw new Error(`Unknown budget "${budget}" for ${file}`);
  const size = gzipSync(readFileSync(file), { level: 9 }).length;
  const ok = size <= bytes(limit);
  if (!ok) over++;
  console.log(`${ok ? '✓' : '✗'} ${file}: ${(size / 1000).toFixed(2)} kB gzip (limit ${limit})`);
}
if (over) process.exit(1);

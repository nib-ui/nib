// Records the browser floor (ADR 5) for the next release: resolves the browserslist query in
// package.json against the installed caniuse data and writes it as a version plan, so the
// changelog of that release carries it under "Browser support". Run before each minor release:
// `pnpm browser-support`, then commit the plan.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import browserslist from 'browserslist';

const root = fileURLToPath(new URL('..', import.meta.url));
const query = browserslist.loadConfig({ path: root }) ?? [];

/** "chrome 155, 154 · firefox 157, 156 · safari 26.6, 26.5" from browserslist's "chrome 155" list. */
export function describe(resolved: readonly string[]): string {
  const byBrowser = new Map<string, string[]>();
  for (const entry of resolved) {
    const [name = '', version = ''] = entry.split(' ');
    byBrowser.set(name, [...(byBrowser.get(name) ?? []), version]);
  }
  return [...byBrowser].map(([name, versions]) => `${name} ${versions.join(', ')}`).join(' · ');
}

if (import.meta.main) {
  const resolved = browserslist(query);
  const plan = `---
nib: minor
---

Browser support: ${describe(resolved)} (\`${query.join(', ')}\`, caniuse data of ${new Date().toISOString().slice(0, 10)}).
`;
  writeFileSync(`${root}.nx/version-plans/browser-support.md`, plan);
  console.log(plan);
}

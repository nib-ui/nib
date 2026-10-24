import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { CONTAINER_SIZES, utilities, type TokenJson, type Utility } from './utilities.ts';

const require = createRequire(import.meta.url);
const LAYER_ORDER = '@layer nib.theme, nib.base, nib.components, nib.utilities;';

const rule = (u: Utility, prefix = '') => `.${u.name.replace(/^nib-/, `nib-${prefix}`)} { ${u.decls.join('; ')}; }`;

/**
 * Writes the opt-in `utilities.css` (every utility in `nib.utilities`, plus `nib-at-<size>-`
 * container-query variants of the layout ones) and `utilities.json` (the list, for the docs),
 * generated from the built tokens.
 */
export function buildUtilities(outDir: string): void {
  const tokens = JSON.parse(readFileSync(require.resolve('@nib-ui/tokens/tokens.json'), 'utf8')) as TokenJson;
  const all = utilities(tokens);
  const responsive = all.filter((u) => u.group === 'layout' && u.name !== 'nib-cq');
  const lines = [
    LAYER_ORDER,
    '@layer nib.utilities {',
    ...all.map((u) => `  ${rule(u)}`),
    ...Object.entries(CONTAINER_SIZES).flatMap(([size, width]) => [
      `  @container (min-width: ${width}) {`,
      ...responsive.map((u) => `    ${rule(u, `at-${size}-`)}`),
      '  }',
    ]),
    '}',
  ];
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'utilities.css'), `${lines.join('\n')}\n`);
  writeFileSync(join(outDir, 'utilities.json'), `${JSON.stringify(all, null, 2)}\n`);
}

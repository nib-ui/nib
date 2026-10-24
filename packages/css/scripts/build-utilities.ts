import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { CONTAINER_NAME, CONTAINER_SIZES, utilities, type TokenJson, type Utility } from './utilities.ts';

const require = createRequire(import.meta.url);
const LAYER_ORDER = '@layer nib.theme, nib.base, nib.components, nib.utilities;';

const variant = (u: Utility, size: string): Utility & { container: string } => ({
  ...u,
  name: u.name.replace(/^nib-/, `nib-at-${size}-`),
  container: size,
});
const rule = (u: Utility) => `.${u.name} { ${u.decls.join('; ')}; }`;

/**
 * Writes the opt-in `utilities.css` (every utility in `nib.utilities`, plus `nib-at-<size>-`
 * container-query variants of the layout ones) and `utilities.json` (the list, for the docs),
 * generated from the built tokens.
 */
export function buildUtilities(outDir: string): void {
  const tokens = JSON.parse(readFileSync(require.resolve('@nib-ui/tokens/tokens.json'), 'utf8')) as TokenJson;
  const all = utilities(tokens);
  const responsive = all.filter((u) => u.group === 'layout' && u.name !== 'nib-cq');
  const variants = Object.keys(CONTAINER_SIZES).flatMap((size) => responsive.map((u) => variant(u, size)));
  const lines = [
    LAYER_ORDER,
    '@layer nib.utilities {',
    ...all.map((u) => `  ${rule(u)}`),
    // Named: an unrelated container between `nib-cq` and the element must not answer the query.
    ...Object.entries(CONTAINER_SIZES).flatMap(([size, width]) => [
      `  @container ${CONTAINER_NAME} (min-width: ${width}) {`,
      ...variants.filter((v) => v.container === size).map((v) => `    ${rule(v)}`),
      '  }',
    ]),
    '}',
  ];
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'utilities.css'), `${lines.join('\n')}\n`);
  writeFileSync(join(outDir, 'utilities.json'), `${JSON.stringify([...all, ...variants], null, 2)}\n`);
}

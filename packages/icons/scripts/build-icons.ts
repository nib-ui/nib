import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkIcon, type CheckedIcon } from './check-icon.ts';

const SRC = fileURLToPath(new URL('../src/svg', import.meta.url));
const LAYER_ORDER = '@layer nib.theme, nib.base, nib.components, nib.utilities;';
// Directional icons that point the reading way: they flip under dir="rtl". Each is drawn
// symmetric about x = 8, the axis the flip turns on, so the pair lines up in either direction.
const MIRRORED = new Set(['arrow-prev', 'arrow-next']);
// Names that cannot be an exported binding in the ES module index.
const RESERVED = new Set(
  'break case catch class const continue debugger default delete do else enum export extends false finally for function if import in instanceof new null return super switch this throw true try typeof var void while with yield let static await'.split(
    ' ',
  ),
);

const camel = (name: string) => name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/** The finished SVG: square caps, miter joins, no fill, stroked in `paint`. */
function render(icon: CheckedIcon, paint: string, attrs = ''): string {
  const paths = icon.paths.map((p) => `<path d="${p.d}"${p.width === 2 ? ' stroke-width="2"' : ''}/>`).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.size} ${icon.size}" fill="none" stroke="${paint}" ` +
    `stroke-linecap="square" stroke-linejoin="miter"${attrs}>${paths}</svg>`
  );
}

/** Reads and checks every source icon; throws listing each one that breaks the drawing laws. */
export function readIcons(srcDir = SRC): Map<string, CheckedIcon> {
  const icons = new Map<string, CheckedIcon>();
  const errors: string[] = [];
  const exported = new Map<string, string>();
  for (const file of readdirSync(srcDir)
    .filter((f) => f.endsWith('.svg'))
    .sort()) {
    const name = file.slice(0, -4);
    if (!/^[a-z][a-z0-9-]*$/.test(name)) errors.push(`${file}: name must be kebab-case`);
    const binding = camel(name);
    if (RESERVED.has(binding)) errors.push(`${file}: "${binding}" is a reserved word`);
    const clash = exported.get(binding);
    if (clash) errors.push(`${file}: exports as "${binding}", like ${clash}`);
    exported.set(binding, file);
    const icon = checkIcon(readFileSync(join(srcDir, file), 'utf8'));
    errors.push(...icon.problems.map((p) => `${file}: ${p}`));
    icons.set(name, icon);
  }
  if (errors.length) throw new Error(`Icons break the drawing laws:\n${errors.join('\n')}`);
  return icons;
}

/**
 * Writes the three deliveries: `sprite.svg` (symbols `nib-icon-<name>`), one ES module per icon
 * under `esm/` (default export: the SVG markup) with an index of camelCase names, and
 * `icons.css` (`class="nib-icon nib-icon-<name>"`, a CSS mask painted in currentColor).
 */
export function buildIcons(outDir: string, srcDir = SRC): void {
  const icons = readIcons(srcDir);
  // From scratch: a renamed icon must not linger and get published.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, 'esm'), { recursive: true });

  const symbols = [...icons].map(([name, icon]) =>
    render(icon, 'currentColor')
      .replace(/^<svg xmlns="[^"]+"/, `<symbol id="nib-icon-${name}"`)
      .replace(/<\/svg>$/, '</symbol>'),
  );
  writeFileSync(join(outDir, 'sprite.svg'), `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`);

  const index: string[] = [];
  for (const [name, icon] of icons) {
    const markup = render(
      icon,
      'currentColor',
      ` width="${icon.size}" height="${icon.size}" aria-hidden="true" focusable="false"`,
    );
    writeFileSync(join(outDir, 'esm', `${name}.js`), `export default ${JSON.stringify(markup)};\n`);
    writeFileSync(join(outDir, 'esm', `${name}.d.ts`), 'declare const icon: string;\nexport default icon;\n');
    index.push(`export { default as ${camel(name)} } from './${name}.js';`);
  }
  writeFileSync(join(outDir, 'esm', 'index.js'), `${index.join('\n')}\n`);
  writeFileSync(
    join(outDir, 'esm', 'index.d.ts'),
    `${[...icons.keys()].map((n) => `export declare const ${camel(n)}: string;`).join('\n')}\n`,
  );

  const rules = [...icons].map(
    ([name, icon]) =>
      `.nib-icon-${name}{--nib-icon:url("data:image/svg+xml,${encodeURIComponent(render(icon, 'black'))}");` +
      `--nib-icon-size:${icon.size}px}`,
  );
  const mirrored = [...MIRRORED].filter((n) => icons.has(n)).map((n) => `.nib-icon-${n}:dir(rtl)`);
  writeFileSync(
    join(outDir, 'icons.css'),
    `${LAYER_ORDER}\n@layer nib.utilities{` +
      // Pixel-grid drawings stay at their own size.
      `.nib-icon{display:inline-block;flex:none;inline-size:var(--nib-icon-size,16px);block-size:var(--nib-icon-size,16px);` +
      `vertical-align:middle;background-color:currentColor;forced-color-adjust:none;` +
      // Without a name class (or with a misspelt one) the icon is empty, never a filled square.
      `mask-image:var(--nib-icon,linear-gradient(transparent,transparent));mask-position:center;mask-size:contain;mask-repeat:no-repeat}` +
      `${rules.join('')}${mirrored.length ? `${mirrored.join(',')}{transform:scaleX(-1)}` : ''}` +
      // Forced colours: an icon opted out of adjustment would keep the author colour, so it takes
      // the system text colour, which always stands out on Canvas.
      `@media (forced-colors:active){.nib-icon{background-color:CanvasText}}}\n`,
  );
}

if (import.meta.main) {
  buildIcons(fileURLToPath(new URL('../dist/', import.meta.url)));
}

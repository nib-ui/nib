import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { bundleAsync } from 'lightningcss';
import { buildUtilities } from './build-utilities.ts';

const SRC = fileURLToPath(new URL('../src', import.meta.url));
const require = createRequire(import.meta.url);
// Minifying drops a bare layer statement, yet it alone fixes the order of the layers for every rule
// that follows, the user's included. Written back by hand.
const LAYER_ORDER = '@layer nib.theme,nib.base,nib.components,nib.utilities;';

const bundle = async (filename: string) => {
  const { code } = await bundleAsync({
    filename,
    minify: true,
    resolver: {
      read: (file) => readFileSync(file, 'utf8'),
      // Relative imports stay relative; bare ones (`@nib-ui/tokens/tokens.css`) resolve like Node.
      resolve: (specifier, from) =>
        specifier.startsWith('.') ? fileURLToPath(new URL(specifier, `file://${from}`)) : require.resolve(specifier),
    },
  });
  return new TextDecoder().decode(code);
};

/**
 * Bundles `nib.css` and everything it imports (package imports such as the tokens included) into
 * one minified `nib.css` in `outDir`, and each file of `components/` and `presets/` on its own
 * into `outDir/components/` and `outDir/presets/`.
 */
export async function buildCss(outDir: string, srcDir = SRC): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/nib.css`, LAYER_ORDER + (await bundle(`${srcDir}/nib.css`)));
  for (const folder of ['components', 'presets']) {
    mkdirSync(`${outDir}/${folder}`, { recursive: true });
    const files = existsSync(`${srcDir}/${folder}`) ? readdirSync(`${srcDir}/${folder}`) : [];
    for (const file of files.filter((f) => f.endsWith('.css'))) {
      // Each file declares the order too: whichever Nib stylesheet loads first fixes it for the page.
      writeFileSync(`${outDir}/${folder}/${file}`, LAYER_ORDER + (await bundle(`${srcDir}/${folder}/${file}`)));
    }
  }
}

if (import.meta.main) {
  const dist = fileURLToPath(new URL('../dist/', import.meta.url));
  // From scratch: a removed component must not linger and get published.
  rmSync(dist, { recursive: true, force: true });
  await buildCss(dist);
  buildUtilities(dist);
}

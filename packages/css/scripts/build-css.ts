import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { bundleAsync } from 'lightningcss';

const ENTRY = fileURLToPath(new URL('../src/nib.css', import.meta.url));
const require = createRequire(import.meta.url);
// Minifying drops a bare layer statement, yet it alone fixes the order of the layers for every rule
// that follows, the user's included. Written back by hand.
const LAYER_ORDER = '@layer nib.theme,nib.base,nib.components,nib.utilities;';

/**
 * Bundles `src/nib.css` and everything it imports (package imports such as the tokens included)
 * into one minified `nib.css` in `outDir`.
 */
export async function buildCss(outDir: string): Promise<void> {
  const { code } = await bundleAsync({
    filename: ENTRY,
    minify: true,
    resolver: {
      read: (file) => readFileSync(file, 'utf8'),
      // Relative imports stay relative; bare ones (`@nib-ui/tokens/tokens.css`) resolve like Node.
      resolve: (specifier, from) =>
        specifier.startsWith('.') ? fileURLToPath(new URL(specifier, `file://${from}`)) : require.resolve(specifier),
    },
  });
  mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/nib.css`, LAYER_ORDER + new TextDecoder().decode(code));
}

if (import.meta.main) {
  await buildCss(fileURLToPath(new URL('../dist/', import.meta.url)));
}

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { bundleAsync } from 'lightningcss';

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
 * one minified `nib.css` in `outDir`, and each file of `components/` on its own into
 * `outDir/components/`.
 */
export async function buildCss(outDir: string, srcDir = SRC): Promise<void> {
  mkdirSync(`${outDir}/components`, { recursive: true });
  writeFileSync(`${outDir}/nib.css`, LAYER_ORDER + (await bundle(`${srcDir}/nib.css`)));
  const components = existsSync(`${srcDir}/components`) ? readdirSync(`${srcDir}/components`) : [];
  for (const file of components.filter((f) => f.endsWith('.css'))) {
    writeFileSync(`${outDir}/components/${file}`, await bundle(`${srcDir}/components/${file}`));
  }
}

if (import.meta.main) {
  await buildCss(fileURLToPath(new URL('../dist/', import.meta.url)));
}

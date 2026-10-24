import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

// Fontsource's variable packages are the source: the upstream fonts split into unicode-range
// subsets. Only the weight axis, upright, and the subsets Nib's languages need are shipped.
const FAMILIES = [
  { family: 'Inter', pkg: '@fontsource-variable/inter', licence: 'LICENSE-inter.txt' },
  { family: 'JetBrains Mono', pkg: '@fontsource-variable/jetbrains-mono', licence: 'LICENSE-jetbrains-mono.txt' },
];
const SUBSETS = ['vietnamese', 'latin-ext', 'latin'];

interface Face {
  subset: string;
  file: string;
  weight: string;
  range: string;
}

/** The faces of a Fontsource `wght.css`, keyed by the subset named in each face's comment. */
function readFaces(css: string): Face[] {
  const faces: Face[] = [];
  for (const [, name = '', body = ''] of css.matchAll(/\/\* ([a-z0-9-]+)-wght-normal \*\/\s*@font-face\s*{([^}]*)}/g)) {
    const get = (prop: string) => new RegExp(`${prop}:\\s*([^;]+);`).exec(body)?.[1]?.trim() ?? '';
    const file = /url\(\.\/files\/([^)]+)\)/.exec(body)?.[1] ?? '';
    // The face comment is "<package>-<subset>"; the package name may itself contain dashes.
    const subset = SUBSETS.find((s) => name.endsWith(`-${s}`)) ?? '';
    faces.push({ subset, file, weight: get('font-weight'), range: get('unicode-range') });
  }
  return faces;
}

const face = (family: string, f: Face) => `@font-face {
  font-family: '${family}';
  font-style: normal;
  font-display: swap;
  font-weight: ${f.weight};
  src: url(./files/${f.file}) format('woff2');
  unicode-range: ${f.range};
}
`;

/**
 * Writes `fonts.css` (one variable @font-face per family and subset, under the names the tokens
 * use: "Inter", "JetBrains Mono"), the woff2 files it points to, and each font's OFL licence.
 */
export async function buildFonts(outDir: string): Promise<void> {
  mkdirSync(join(outDir, 'files'), { recursive: true });
  let css = '/* Inter and JetBrains Mono, variable, Latin + Latin Extended + Vietnamese. SIL OFL 1.1. */\n';
  for (const { family, pkg, licence } of FAMILIES) {
    const root = dirname(require.resolve(`${pkg}/package.json`));
    const faces = readFaces(readFileSync(join(root, 'wght.css'), 'utf8'));
    for (const subset of SUBSETS) {
      const f = faces.find((x) => x.subset === subset);
      if (!f?.file) throw new Error(`${pkg} has no ${subset} subset`);
      copyFileSync(join(root, 'files', f.file), join(outDir, 'files', f.file));
      css += face(family, f);
    }
    copyFileSync(join(root, 'LICENSE'), join(outDir, licence));
  }
  writeFileSync(join(outDir, 'fonts.css'), css);
}

if (import.meta.main) {
  await buildFonts(fileURLToPath(new URL('../dist/', import.meta.url)));
}

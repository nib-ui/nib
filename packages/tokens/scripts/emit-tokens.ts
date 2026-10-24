import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildTokens } from '../src/index.ts';
import { readTokenSource } from './token-source.ts';

const FILES = ['tokens.css', 'tailwind.css', 'tokens.json'];

/** Builds the token source and writes the published CSS and JSON files into `outDir`. */
export function emitTokens(outDir: string) {
  const { css, tailwindCss, json } = buildTokens(readTokenSource());
  mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/tokens.css`, css);
  writeFileSync(`${outDir}/tailwind.css`, tailwindCss);
  writeFileSync(`${outDir}/tokens.json`, json);
  for (const file of FILES) {
    if (!existsSync(`${outDir}/${file}`)) throw new Error(`emit-tokens did not write ${file}`);
  }
}

// import.meta.main, not a comparison with process.argv: a path with spaces or a Windows path would
// make that comparison fail silently and publish a package without CSS.
if (import.meta.main) {
  emitTokens(fileURLToPath(new URL('../dist/', import.meta.url)));
}

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { DtcgGroup, TokenSource } from '../src/index.ts';

const SOURCE_DIR = fileURLToPath(new URL('../source/', import.meta.url));

/** Reads one `<name>.tokens.json` file and returns its top-level group. */
function group(file: string, key: string): DtcgGroup {
  const json = JSON.parse(readFileSync(`${SOURCE_DIR}${file}.tokens.json`, 'utf8')) as Record<string, DtcgGroup>;
  const value = json[key];
  if (!value) throw new Error(`${file}.tokens.json has no "${key}" group`);
  return value;
}

/** Loads the DTCG source files from `packages/tokens/source/`. */
export function readTokenSource(): TokenSource {
  return {
    color: { dark: group('color-dark', 'color'), light: group('color-light', 'color') },
    font: group('font', 'font'),
    typography: group('typography', 'typography'),
    spacing: group('spacing', 'spacing'),
    density: group('density', 'density'),
    motion: group('motion', 'motion'),
  };
}

import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

// Folders that hold installed or generated code, never the project's own.
const SKIP = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  'coverage',
  '.astro',
  '.next',
  '.nuxt',
  '.svelte-kit',
  '.output',
  '.vercel',
]);
const CSS = new Set(['.css']);
const MARKUP = new Set([
  '.html',
  '.htm',
  '.jsx',
  '.tsx',
  '.js',
  '.mjs',
  '.ts',
  '.mts',
  '.vue',
  '.svelte',
  '.astro',
  '.mdx',
]);

export interface LintFiles {
  css: string[];
  markup: string[];
}

/**
 * The stylesheets and markup under `paths` (files or folders, relative to `cwd`), as paths
 * relative to `cwd`, sorted. Installed and built folders are skipped; a file named outright is
 * always read.
 */
export async function lintFiles(cwd: string, paths: readonly string[]): Promise<LintFiles> {
  const found: LintFiles = { css: [], markup: [] };
  const add = (file: string) => {
    const ext = extname(file).toLowerCase();
    const rel = relative(cwd, file) || file;
    if (CSS.has(ext)) found.css.push(rel);
    else if (MARKUP.has(ext) && !file.endsWith('.d.ts')) found.markup.push(rel);
  };
  const walk = async (dir: string): Promise<void> => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP.has(entry.name)) await walk(join(dir, entry.name));
      } else if (entry.isFile()) add(join(dir, entry.name));
    }
  };
  for (const path of paths.length ? paths : ['.']) {
    const full = resolve(cwd, path);
    const info = await stat(full).catch(() => null);
    if (!info) throw new Error(`${path} is not there.`);
    if (info.isDirectory()) await walk(full);
    else add(full);
  }
  found.css.sort();
  found.markup.sort();
  return found;
}

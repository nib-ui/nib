import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Io } from './io.ts';
import { main } from './main.ts';

/** Runs `nib …` in a fresh folder; `answers` reply to questions in turn, as a person at a terminal would. */
async function nib(args: string[], answers?: string[], files: Record<string, string> = {}) {
  const cwd = mkdtempSync(join(tmpdir(), 'nib-init-'));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(cwd, name), text);
  const out: string[] = [];
  const err: string[] = [];
  const asked: string[] = [];
  const io: Io = {
    cwd,
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    ...(answers && { ask: async (q: string) => (asked.push(q), answers.shift() ?? '') }),
  };
  const code = await main(args, io);
  const read = (name: string) => readFileSync(join(cwd, name), 'utf8');
  return { code, out: out.join('\n'), err: err.join('\n'), asked, read };
}

describe('nib init', () => {
  it('takes the first preset and plain CSS when no one can answer, and writes three files', async () => {
    const run = await nib(['init']);
    expect(run.code).toBe(0);
    expect(JSON.parse(run.read('nib.config.json'))).toEqual({
      preset: 'docs',
      css: 'plain',
      entry: 'src/nib.css',
      theme: 'src/nib-theme.css',
    });
    expect(run.read('src/nib.css')).toContain("@import '@nib-ui/css/nib.css';\n@import './nib-theme.css';");
    expect(run.read('src/nib-theme.css')).toContain(':root {');
    expect(run.out).toContain('Next: install @nib-ui/css @nib-ui/tokens, then import src/nib.css once in your app.');
    expect(run.out).toMatch(/Pulled a proof → nib\.config\.json\. Locked up\.$/);
  });

  it('asks at a terminal, and wires Tailwind with the preset page attributes', async () => {
    const run = await nib(['init', '--dir', 'app/styles'], ['dashboard', 'tailwind']);
    expect(run.asked).toEqual(['Preset (docs / dashboard / blog / landing)', 'CSS (plain / tailwind)']);
    const entry = run.read('app/styles/nib.css');
    expect(entry).toContain('@layer theme, base, nib, components, utilities;');
    expect(entry.indexOf("@import 'tailwindcss';")).toBeLessThan(entry.indexOf("@import '@nib-ui/css/nib.css';"));
    expect(run.out).toContain('install @nib-ui/css @nib-ui/tokens tailwindcss');
    expect(run.out).toContain('The dashboard preset sets the page: <html data-theme="dark" data-density="compact">.');
  });

  it('keeps files that are already there', async () => {
    const run = await nib(['init', '--preset', 'blog', '--css', 'plain'], undefined, {
      'nib.config.json': '{ "theme": "mine.css" }',
    });
    expect(run.code).toBe(0);
    expect(run.read('nib.config.json')).toBe('{ "theme": "mine.css" }');
    expect(run.out).toContain('Kept      nib.config.json (already there)');
    expect(run.out).toMatch(/\nLocked up\.$/);
  });

  it('refuses an unknown preset or flag', async () => {
    const preset = await nib(['init', '--preset', 'shop']);
    expect(preset).toMatchObject({
      code: 1,
      err: 'error    Preset must be one of docs, dashboard, blog, landing; got "shop".',
    });
    const flag = await nib(['init', '--force']);
    expect(flag.code).toBe(2);
    expect(flag.err).toContain("Unknown option '--force'");
  });
});

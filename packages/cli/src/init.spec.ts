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
    expect(run.read('src/nib.css')).toContain(
      "@import '@nib-ui/css/nib.css';\n@import '@nib-ui/css/presets/docs.css';\n@import './nib-theme.css';",
    );
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
    expect(entry.indexOf("@import '@nib-ui/css/nib.css';")).toBeLessThan(
      entry.indexOf("@import '@nib-ui/css/presets/dashboard.css';"),
    );
    expect(run.out).toContain('install @nib-ui/css @nib-ui/tokens tailwindcss');
    expect(run.out).toContain('The dashboard preset sets the page: <html data-theme="dark" data-density="compact">.');
  });

  it("keeps files that are already there, and an existing config's choices over new ones", async () => {
    const run = await nib(['init', '--preset', 'blog', '--css', 'tailwind'], undefined, {
      'nib.config.json': '{ "css": "plain", "theme": "mine.css" }',
    });
    expect(run.code).toBe(0);
    expect(run.read('nib.config.json')).toBe('{ "css": "plain", "theme": "mine.css" }');
    expect(run.out).toContain('Reading   nib.config.json: its css, theme stay as they are');
    expect(run.read('src/nib.css')).toBe(
      "/* Nib, set by `nib init`. Import this file once, before your own styles. */\n@import '@nib-ui/css/nib.css';\n@import '@nib-ui/css/presets/blog.css';\n@import '../mine.css';\n",
    );
    expect(run.out).toContain('Kept      nib.config.json (already there)');
    expect(run.out).toContain('The blog preset sets the page: <html data-theme="light">.');
    expect(run.out).toMatch(/\nLocked up\.$/);
  });

  it('keeps the stylesheets inside the project, with forward slashes', async () => {
    const run = await nib(['init', '--dir', 'web\\styles']);
    expect(JSON.parse(run.read('nib.config.json'))).toMatchObject({ entry: 'web/styles/nib.css' });
    for (const dir of ['../out', '/tmp/x', ' ']) {
      const outside = await nib(['init', '--dir', dir]);
      expect(outside.code).toBe(2);
      expect(outside.err).toContain('--dir must be a folder inside the project');
    }
  });

  it('refuses an unknown preset, value or flag as a usage mistake', async () => {
    const preset = await nib(['init', '--preset', 'shop']);
    expect(preset.code).toBe(2);
    expect(preset.err).toContain('Preset must be one of docs, dashboard, blog, landing; got "shop".');
    expect((await nib(['init', '--css', 'sass'])).code).toBe(2);
    expect((await nib(['init', '--preset'])).code).toBe(2);
    const flag = await nib(['init', '--force']);
    expect(flag.code).toBe(2);
    expect(flag.err).toContain("Unknown option '--force'");
  });
});

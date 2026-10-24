import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { main } from './main.ts';

/** Runs `nib …` in a fresh folder holding `files`; returns the exit code and what it printed. */
async function nib(args: string[], files: Record<string, string> = {}) {
  const cwd = mkdtempSync(join(tmpdir(), 'nib-cli-'));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(cwd, name)), { recursive: true });
    writeFileSync(join(cwd, name), text);
  }
  const out: string[] = [];
  const err: string[] = [];
  const code = await main(args, { cwd, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join('\n'), err: err.join('\n') };
}

describe('nib theme check', () => {
  it("passes Nib's own palette, printing only the known colour-vision warnings", async () => {
    const run = await nib(['theme', 'check']);
    expect(run.code).toBe(0);
    expect(run.err).toBe('');
    expect(run.out).toContain("Pulling a proof of Nib's own palette…");
    expect(run.out).toMatch(/Locked up: 0 errors, \d+ warnings\.$/);
  });

  it('fails a pale accent with proof marks, and reads the theme file named in nib.config.json', async () => {
    const run = await nib(['theme', 'check'], {
      'nib.config.json': JSON.stringify({ theme: 'theme.css' }),
      'theme.css': ':root { --nib-accent: light-dark(#9fd8cc, #00967d); }',
    });
    expect(run.code).toBe(1);
    expect(run.out).toContain('Pulling a proof of theme.css…');
    expect(run.err).toContain('error    Proof mark: accent on paper is');
    expect(run.out).toMatch(/Not locked up: \d+ errors?, \d+ warnings?\.$/);
  });

  it("stops on a colour it cannot read rather than proofing Nib's in its place, and names unreadable files", async () => {
    const unreadable = await nib(['theme', 'check', 'a.css'], { 'a.css': ':root { --nib-accent: teal; }' });
    expect(unreadable.code).toBe(1);
    expect(unreadable.err).toBe(
      'error    a.css: cannot proof --nib-accent: teal; write it as hex, light-dark() of two hex colours, or var(--nib-…).',
    );
    expect(unreadable.out).toContain('Not locked up: 1 unreadable colour.');
    const folder = await nib(['theme', 'check', '.']);
    expect(folder).toMatchObject({ code: 1, err: 'error    Cannot read . (a folder).' });
    const missing = await nib(['theme', 'check', 'gone.css']);
    expect(missing).toMatchObject({ code: 1, err: 'error    gone.css is not there.' });
  });

  it('rejects a translucent colour the rules read', async () => {
    const run = await nib(['theme', 'check', 'a.css'], { 'a.css': ':root { --nib-accent: #00967d80; }' });
    expect(run.code).toBe(1);
    expect(run.err).toContain('must be opaque');
  });
});

describe('nib lint', () => {
  it('passes a project that keeps the laws', async () => {
    const run = await nib(['lint'], {
      'src/app.css': '.card { border: 1px solid var(--nib-line); color: var(--nib-on-surface); }',
      'src/card.tsx': 'export const Card = () => <div className="border-2 bg-nib-surface rounded-none" />;',
    });
    expect(run).toMatchObject({ code: 0, err: '' });
    expect(run.out).toContain('Setting type: 2 files…');
    expect(run.out).toContain('Locked up: no proof marks.');
  });

  it('marks CSS and class names that break a law, with file, line, column and rule', async () => {
    const run = await nib(['lint'], {
      'src/app.css': '.card {\n  border-radius: 4px;\n  color: #333;\n}',
      'src/card.vue': '<template>\n  <div class="p-4 shadow-lg text-red-500"></div>\n</template>',
      'node_modules/x/y.css': '.z { border-radius: 9px; }',
    });
    expect(run.code).toBe(1);
    expect(run.err.split('\n')).toEqual([
      expect.stringMatching(/^src\/app\.css:2:18 {2}nib\/no-radius {2}Unexpected border-radius/),
      expect.stringMatching(/^src\/app\.css:3:10 {2}nib\/color-tokens {2}Unexpected color "#333"/),
      'src/card.vue:2:19  nib/no-shadow  shadow-lg: nothing casts a shadow.',
      'src/card.vue:2:29  nib/color-tokens  text-red-500: colours come from the tokens (nib-*).',
    ]);
    expect(run.out).toContain('Not locked up: 4 proof marks in 2 files.');
  });

  it("ignores the project's .stylelintignore, and waives a line marked nib-lint-ignore", async () => {
    const run = await nib(['lint'], {
      '.stylelintignore': '*.css',
      'a.css': '.a { border-radius: 2px; }',
      'b.html': '<!-- nib-lint-ignore: a vendor widget -->\n<div class="rounded-lg"></div>',
    });
    expect(run.code).toBe(1);
    expect(run.err).toMatch(/^a\.css:1:\d+ {2}nib\/no-radius/);
    expect(run.err).not.toContain('b.html');
  });

  it("lets the config's theme file set colours, and only that file", async () => {
    const run = await nib(['lint', 'src'], {
      'nib.config.json': JSON.stringify({ theme: 'src/theme.css' }),
      'src/theme.css': ':root { --nib-accent: light-dark(#02806c, #00967d); }',
      'src/other.css': ':root { --brand: #02806c; }',
    });
    expect(run.code).toBe(1);
    expect(run.err).toMatch(/^src\/other\.css:1:\d+ {2}nib\/color-tokens/);
  });
});

describe('nib', () => {
  it('prints help with no command or --help anywhere, and exits 2 on an unknown command or option', async () => {
    expect((await nib([])).out).toContain('Usage: nib <command>');
    expect(await nib(['theme', 'check', '--help'])).toMatchObject({ code: 0, err: '' });
    const option = await nib(['theme', 'check', '--fix']);
    expect(option.code).toBe(2);
    expect(option.err).toContain('Unknown option: --fix');
    const unknown = await nib(['paint']);
    expect(unknown.code).toBe(2);
    expect(unknown.err).toContain('Unknown command: paint');
  });

  it('reports a config that is not JSON', async () => {
    const run = await nib(['theme', 'check'], { 'nib.config.json': '{ theme: ' });
    expect(run).toMatchObject({ code: 1, err: 'error    nib.config.json is not a JSON object.' });
    const theme = await nib(['theme', 'check'], { 'nib.config.json': '{ "theme": 5 }' });
    expect(theme).toMatchObject({
      code: 1,
      err: 'error    "theme" in nib.config.json must be the path of a stylesheet.',
    });
  });
});

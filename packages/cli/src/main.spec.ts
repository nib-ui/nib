import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { main } from './main.ts';

/** Runs `nib …` in a fresh folder holding `files`; returns the exit code and what it printed. */
async function nib(args: string[], files: Record<string, string> = {}) {
  const cwd = mkdtempSync(join(tmpdir(), 'nib-cli-'));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(cwd, name), text);
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

  it('counts a colour it cannot read as an error, and reports a missing file', async () => {
    const unreadable = await nib(['theme', 'check', 'a.css'], { 'a.css': ':root { --nib-accent: teal; }' });
    expect(unreadable.code).toBe(1);
    expect(unreadable.err).toContain('cannot proof --nib-accent: teal');
    const missing = await nib(['theme', 'check', 'gone.css']);
    expect(missing).toMatchObject({ code: 1, err: 'error    gone.css is not there.' });
  });

  it('rejects a translucent colour the rules read', async () => {
    const run = await nib(['theme', 'check', 'a.css'], { 'a.css': ':root { --nib-accent: #00967d80; }' });
    expect(run.code).toBe(1);
    expect(run.err).toContain('must be opaque');
  });
});

describe('nib', () => {
  it('prints help with no command, and exits 2 on an unknown one', async () => {
    expect((await nib([])).out).toContain('Usage: nib <command>');
    const unknown = await nib(['paint']);
    expect(unknown.code).toBe(2);
    expect(unknown.err).toContain('Unknown command: paint');
  });

  it('reports a config that is not JSON', async () => {
    const run = await nib(['theme', 'check'], { 'nib.config.json': '{ theme: ' });
    expect(run).toMatchObject({ code: 1, err: 'error    nib.config.json is not a JSON object.' });
  });
});

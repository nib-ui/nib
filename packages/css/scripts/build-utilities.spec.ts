import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import stylelint from 'stylelint';
import { beforeAll, describe, expect, it } from 'vitest';
import config from '@nib-ui/stylelint-plugin/config';
import { buildUtilities } from './build-utilities.ts';

let out: string;
let css: string;

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'nib-utilities-'));
  buildUtilities(out);
  css = readFileSync(join(out, 'utilities.css'), 'utf8');
});

describe('buildUtilities', () => {
  it('puts every rule in nib.utilities, after the layer order', () => {
    expect(css.startsWith('@layer nib.theme, nib.base, nib.components, nib.utilities;\n@layer nib.utilities {')).toBe(
      true,
    );
  });

  it('derives spacing, colour and type utilities from the tokens', () => {
    expect(css).toContain('.nib-gap-md { gap: var(--nib-space-md); }');
    expect(css).toContain('.nib-pi-lg { padding-inline: var(--nib-space-lg); }');
    expect(css).toContain('.nib-fg-accent-text { color: var(--nib-accent-text); }');
    expect(css).toContain('.nib-bg-red-soft { background-color: var(--nib-red-soft); }');
    expect(css).toContain('.nib-rule-green { border-inline-start: var(--nib-space-rule) solid var(--nib-green); }');
    // on-surface-4 is never text.
    expect(css).not.toContain('.nib-fg-on-surface-4');
  });

  it('gives layout utilities container-query variants', () => {
    expect(css).toMatch(
      /@container \(min-width: 48rem\) {\n(\s+\.nib-at-md-[^\n]+\n)*\s+\.nib-at-md-flex { display: flex; }/,
    );
    expect(css).toContain('.nib-at-lg-columns-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }');
    expect(css).not.toContain('.nib-at-md-gap');
  });

  it('prefixes every class, so none collides with Tailwind', () => {
    const classes = [...css.matchAll(/^\s*\.([a-z0-9-]+)\s*{/gm)].map((m) => m[1] ?? '');
    expect(classes.length).toBeGreaterThan(150);
    expect(classes.filter((c) => !c.startsWith('nib-'))).toEqual([]);
  });

  it('obeys every Nib law (no radius, shadow, gradient, blur, physical direction)', async () => {
    const result = await stylelint.lint({ code: css, config });
    expect(result.results[0]?.warnings ?? []).toEqual([]);
  });

  it('stays within 10 kB gzipped', () => {
    expect(gzipSync(css, { level: 9 }).length).toBeLessThanOrEqual(10_000);
  });

  it('lists every utility for the docs', () => {
    const list = JSON.parse(readFileSync(join(out, 'utilities.json'), 'utf8')) as { name: string; group: string }[];
    expect(list.find((x) => x.name === 'nib-gap-md')).toEqual({
      name: 'nib-gap-md',
      group: 'spacing',
      decls: ['gap: var(--nib-space-md)'],
    });
  });
});

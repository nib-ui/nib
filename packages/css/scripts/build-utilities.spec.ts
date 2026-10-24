import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
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
  it('puts every rule in nib.utilities, after the same layer order as nib.css', () => {
    const order = /@layer [^;{]+;/.exec(readFileSync(new URL('../src/nib.css', import.meta.url), 'utf8'))?.[0];
    expect(css.split('\n')[0]).toBe(order);
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
    const md = css.slice(css.indexOf('@container nib (min-width: 48rem) {'));
    expect(md.slice(0, md.indexOf('\n  }'))).toContain('.nib-at-md-flex { display: flex; }');
    // After every plain rule, so a variant wins over the utility it varies.
    expect(css.indexOf('@container')).toBeGreaterThan(css.lastIndexOf('.nib-rule-'));
    expect(css).toContain('.nib-cq { container: nib / inline-size; }');
    expect(css).toContain('.nib-at-lg-columns-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }');
    expect(css).not.toContain('.nib-at-md-gap');
  });

  it('lets a one-side spacing utility override the density cell padding', () => {
    expect(css.indexOf('.nib-cell ')).toBeLessThan(css.indexOf('.nib-pi-0 '));
  });

  it('shares no class name with the base and component CSS', () => {
    const src = new URL('../src/', import.meta.url);
    const files = [
      ...readdirSync(new URL('base/', src)).map((f) => new URL(`base/${f}`, src)),
      ...readdirSync(new URL('components/', src)).map((f) => new URL(`components/${f}`, src)),
    ];
    const taken = new Set(
      files.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/\.(nib-[a-z0-9_-]+)/g)].map((m) => m[1])),
    );
    const ours = [...css.matchAll(/^\s*\.([a-z0-9-]+)\s*{/gm)].map((m) => m[1]);
    expect(ours.filter((c) => taken.has(c))).toEqual([]);
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

  it('lists every utility for the docs, container variants included', () => {
    const list = JSON.parse(readFileSync(join(out, 'utilities.json'), 'utf8')) as { name: string; group: string }[];
    const classes = [...css.matchAll(/^\s*\.([a-z0-9-]+)\s*{/gm)].map((m) => m[1]);
    expect(list.map((u) => u.name).sort()).toEqual(classes.sort());
    expect(list.find((x) => x.name === 'nib-gap-md')).toEqual({
      name: 'nib-gap-md',
      group: 'spacing',
      decls: ['gap: var(--nib-space-md)'],
    });
  });
});

import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildIcons, MIRRORED, readIcons } from './build-icons.ts';

const NEEDED = [
  'arrow-next',
  'arrow-prev',
  'calendar',
  'check',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'close',
  'copy',
  'external',
  'info',
  'menu',
  'minus',
  'plus',
  'search',
  'warning',
];

let out: string;
const read = (file: string) => readFileSync(join(out, file), 'utf8');

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'nib-icons-'));
  buildIcons(out);
});

describe('buildIcons', () => {
  it('has every icon the components need, each within the drawing laws, and 60 to 80 in all', () => {
    const names = [...readIcons().keys()];
    expect(names).toEqual(expect.arrayContaining(NEEDED));
    expect(names.length).toBeGreaterThanOrEqual(60);
  });

  it('centres every mirrored icon on x = 8, the axis the RTL flip turns on', () => {
    const icons = readIcons();
    for (const name of MIRRORED) {
      // Every x a path passes through: the first of each M/L pair and every H; V keeps x.
      const xs = (icons.get(name)?.paths ?? []).flatMap(({ d }) =>
        [...d.matchAll(/([MLH])\s*(-?[\d.]+)/g)].map((m) => Number(m[2])),
      );
      expect([name, Math.min(...xs) + Math.max(...xs)]).toEqual([name, 16]);
    }
  });

  it('writes a sprite of currentColor symbols with square caps', () => {
    const sprite = read('sprite.svg');
    expect(sprite.match(/<symbol /g)).toHaveLength(readIcons().size);
    expect(sprite).toContain('<symbol id="nib-icon-close" viewBox="0 0 16 16" fill="none" stroke="currentColor"');
    expect(sprite).toContain('stroke-linecap="square"');
  });

  it('writes one ES module per icon and an index of camelCase names', async () => {
    expect(readdirSync(join(out, 'esm')).filter((f) => f.endsWith('.js'))).toHaveLength(readIcons().size + 1);
    const { default: close } = (await import(join(out, 'esm', 'close.js'))) as { default: string };
    expect(close).toMatch(/^<svg [^>]*width="16" height="16" aria-hidden="true" focusable="false">/);
    expect(read('esm/index.js')).toContain("export { default as chevronDown } from './chevron-down.js';");
  });

  it('writes a CSS mask class per icon in nib.utilities, mirroring prev and next under RTL', () => {
    const css = read('icons.css');
    expect(css.startsWith('@layer nib.theme, nib.base, nib.components, nib.utilities;')).toBe(true);
    expect(css).toContain('.nib-icon-search{--nib-icon:url("data:image/svg+xml,');
    expect(css).toContain('.nib-icon-arrow-prev:dir(rtl),.nib-icon-arrow-next:dir(rtl),.nib-icon-log-in:dir(rtl)');
    expect(css).not.toContain('.nib-icon-arrow-up:dir(rtl)');
  });

  it('draws nothing for a bare or misspelt nib-icon, never a filled square', () => {
    expect(read('icons.css')).toContain('mask-image:var(--nib-icon,linear-gradient(transparent,transparent))');
  });

  it('writes every file the package exports', async () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
      exports: Record<string, string | { types: string; default: string }>;
    };
    for (const [key, target] of Object.entries(pkg.exports)) {
      if (key === './package.json') continue;
      for (const file of typeof target === 'string' ? [target] : [target.types, target.default]) {
        const path = file.replace('./dist/', '').replace('*', 'close');
        expect(readdirSync(join(out, path, '..'))).toContain(path.split('/').pop());
      }
    }
  });

  it('refuses names that cannot be exported', () => {
    const src = mkdtempSync(join(tmpdir(), 'nib-icons-src-'));
    const ok = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2.5 7.5 H12.5"/></svg>';
    for (const name of ['delete', 'x-1', 'x1']) writeFileSync(join(src, `${name}.svg`), ok);
    expect(() => readIcons(src)).toThrow(
      /delete\.svg: "delete" is a reserved word[\s\S]*x1\.svg: exports as "x1", like x-1\.svg/,
    );
  });

  it('refuses to build when a source icon breaks the laws', () => {
    const src = mkdtempSync(join(tmpdir(), 'nib-icons-src-'));
    writeFileSync(
      join(src, 'bad.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle r="4"/></svg>',
    );
    expect(() => buildIcons(mkdtempSync(join(tmpdir(), 'nib-icons-out-')), src)).toThrow(
      'bad.svg: element <circle> (only <path>)',
    );
  });
});

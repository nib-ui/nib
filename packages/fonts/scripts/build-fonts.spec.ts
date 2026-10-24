import { existsSync, mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildFonts } from './build-fonts.ts';

let out: string;
let css: string;

beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), 'nib-fonts-'));
  await buildFonts(out);
  css = readFileSync(join(out, 'fonts.css'), 'utf8');
});

const faces = () => css.match(/@font-face\s*{[^}]*}/g) ?? [];

describe('buildFonts', () => {
  it('writes one variable face per family and subset: Latin, Latin Extended, Vietnamese', () => {
    expect(faces()).toHaveLength(6);
    for (const [family, weights] of [
      ['Inter', '100 900'],
      ['JetBrains Mono', '100 800'],
    ] as const) {
      const own = faces().filter((f) => f.includes(`font-family: '${family}'`));
      expect(own).toHaveLength(3);
      for (const f of own) {
        expect(f).toContain(`font-weight: ${weights};`);
        expect(f).toContain('font-display: swap');
        expect(f).toMatch(/unicode-range: U\+/);
      }
    }
    // Vietnamese needs the combining marks and the precomposed Latin Extended Additional block.
    expect(css).toContain('U+1EA0-1EF9');
  });

  it('serves every file from the package itself, never from Google Fonts', () => {
    const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1] ?? '');
    expect(urls).toHaveLength(6);
    for (const url of urls) {
      expect(url).toMatch(/^\.\/files\/[a-z-]+\.woff2$/);
      expect(statSync(join(out, url)).size).toBeGreaterThan(1000);
    }
    expect(css).not.toMatch(/googleapis|gstatic/);
  });

  it('ships both OFL licences', () => {
    for (const name of ['LICENSE-inter.txt', 'LICENSE-jetbrains-mono.txt']) {
      expect(existsSync(join(out, name))).toBe(true);
      expect(readFileSync(join(out, name), 'utf8')).toContain('SIL OPEN FONT LICENSE');
    }
  });
});

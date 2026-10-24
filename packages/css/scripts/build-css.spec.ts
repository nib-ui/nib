import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCss } from './build-css.ts';

describe('buildCss', () => {
  it('bundles the tokens into one file that starts with the layer order', async () => {
    const out = mkdtempSync(join(tmpdir(), 'nib-css-'));
    await buildCss(out);
    const css = readFileSync(join(out, 'nib.css'), 'utf8');
    expect(css.startsWith('@layer nib.theme,nib.base,nib.components,nib.utilities;')).toBe(true);
    expect(css).not.toContain('@import');
    expect(css).toContain('--nib-accent:');
  });

  it('also writes every component on its own, for pages that load only what they use', async () => {
    const src = mkdtempSync(join(tmpdir(), 'nib-css-src-'));
    mkdirSync(join(src, 'components'));
    writeFileSync(join(src, 'components', 'badge.css'), '@layer nib.components { .nib-badge { color: red } }');
    writeFileSync(join(src, 'nib.css'), "@import './components/badge.css';");
    const out = mkdtempSync(join(tmpdir(), 'nib-css-'));
    await buildCss(out, src);
    expect(readFileSync(join(out, 'components', 'badge.css'), 'utf8')).toBe(
      '@layer nib.theme,nib.base,nib.components,nib.utilities;@layer nib.components{.nib-badge{color:red}}',
    );
    expect(readFileSync(join(out, 'nib.css'), 'utf8')).toContain('.nib-badge');
  });
});

import { mkdtempSync, readFileSync } from 'node:fs';
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
});

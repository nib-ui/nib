import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { emitTokens } from '../scripts/emit-tokens.ts';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  exports: Record<string, string | Record<string, string>>;
};

describe('published files', () => {
  const out = mkdtempSync(join(tmpdir(), 'nib-tokens-'));
  emitTokens(out);

  it.each(['./tokens.css', './tailwind.css', './tokens.json'])('exports %s from a file the build writes', (entry) => {
    const target = pkg.exports[entry];
    expect(typeof target, entry).toBe('string');
    const file = join(out, (target as string).replace(/^\.\/dist\//, ''));
    expect(existsSync(file), file).toBe(true);
  });

  it('writes the built source, not an empty file', () => {
    expect(readFileSync(join(out, 'tokens.css'), 'utf8')).toContain('--nib-accent: light-dark(#02806c, #00967d);');
    expect(JSON.parse(readFileSync(join(out, 'tokens.json'), 'utf8')).color.light.accent).toBe('#02806c');
  });
});

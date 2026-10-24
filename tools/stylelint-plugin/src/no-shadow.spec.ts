import { describe, expect, it } from 'vitest';
import { lintCss } from '../test/lint-css.ts';

const lint = (css: string) => lintCss(css, { 'nib/no-shadow': true });

describe('nib/no-shadow', () => {
  it('accepts no shadow and filters without drop-shadow', async () => {
    expect(await lint('a { box-shadow: none; text-shadow: none; filter: grayscale(1); }')).toEqual([]);
  });

  it('rejects box, text and drop shadows', async () => {
    expect(
      await lint(
        'a { box-shadow: 0 1px 2px var(--x); text-shadow: 0 0 1px var(--x); filter: drop-shadow(0 0 2px var(--x)); }',
      ),
    ).toEqual([
      'nib/no-shadow: Unexpected box-shadow "0 1px 2px var(--x)": depth comes from surfaces and lines, not shadows (nib/no-shadow)',
      'nib/no-shadow: Unexpected text-shadow "0 0 1px var(--x)": depth comes from surfaces and lines, not shadows (nib/no-shadow)',
      'nib/no-shadow: Unexpected filter "drop-shadow(": depth comes from surfaces and lines, not shadows (nib/no-shadow)',
    ]);
  });

  it('rejects drop-shadow() however deeply its arguments nest', async () => {
    expect(await lint('a { filter: drop-shadow(0 0 calc(var(--a) + (1px * 2)) var(--c)); }')).toEqual([
      'nib/no-shadow: Unexpected filter "drop-shadow(": depth comes from surfaces and lines, not shadows (nib/no-shadow)',
    ]);
  });
});

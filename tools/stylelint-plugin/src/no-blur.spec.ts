import { describe, expect, it } from 'vitest';
import { lintCss } from '../test/lint-css.ts';

const lint = (css: string) => lintCss(css, { 'nib/no-blur': true });

describe('nib/no-blur', () => {
  it('accepts filters without blur and backdrop-filter: none', async () => {
    expect(await lint('a { filter: grayscale(1); backdrop-filter: none; }')).toEqual([]);
  });

  it('rejects blur() and any backdrop filter', async () => {
    expect(await lint('a { filter: blur(2px); backdrop-filter: saturate(2); }')).toEqual([
      'nib/no-blur: Unexpected filter "blur(": Nib is flat: no blur or frosted glass (nib/no-blur)',
      'nib/no-blur: Unexpected backdrop-filter "saturate(2)": Nib is flat: no blur or frosted glass (nib/no-blur)',
    ]);
  });

  it('rejects blur() however deeply its arguments nest', async () => {
    expect(await lint('a { filter: blur(calc((1px + 2px) * (3))); }')).toEqual([
      'nib/no-blur: Unexpected filter "blur(": Nib is flat: no blur or frosted glass (nib/no-blur)',
    ]);
  });
});

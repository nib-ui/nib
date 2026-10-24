import { describe, expect, it } from 'vitest';
import { lintCss } from '../test/lint-css.ts';

const lint = (css: string) => lintCss(css, { 'nib/no-radius': true });

describe('nib/no-radius', () => {
  it('accepts square corners', async () => {
    expect(await lint('a { border-radius: 0; border-start-end-radius: 0px; }')).toEqual([]);
  });

  it('rejects any rounded corner, physical or logical', async () => {
    expect(await lint('a { border-radius: 4px; border-top-left-radius: 50%; border-end-start-radius: 2px; }')).toEqual([
      'nib/no-radius: Unexpected border-radius "4px": corners are square in Nib (nib/no-radius)',
      'nib/no-radius: Unexpected border-top-left-radius "50%": corners are square in Nib (nib/no-radius)',
      'nib/no-radius: Unexpected border-end-start-radius "2px": corners are square in Nib (nib/no-radius)',
    ]);
  });

  it('rejects vendor-prefixed radius too', async () => {
    expect(await lint('a { -webkit-border-radius: 4px; }')).toEqual([
      'nib/no-radius: Unexpected -webkit-border-radius "4px": corners are square in Nib (nib/no-radius)',
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { lintCss } from '../test/lint-css.ts';

const lint = (css: string) => lintCss(css, { 'nib/no-gradient': true });

describe('nib/no-gradient', () => {
  it('accepts flat fills and images', async () => {
    expect(await lint('a { background: var(--nib-surface) url(x.png); }')).toEqual([]);
  });

  it('rejects every gradient function in any property', async () => {
    expect(
      await lint('a { background-image: linear-gradient(red, blue); mask-image: repeating-conic-gradient(var(--a) 0 1%); }'),
    ).toEqual([
      'nib/no-gradient: Unexpected background-image "linear-gradient(": Nib is flat: no gradients (nib/no-gradient)',
      'nib/no-gradient: Unexpected mask-image "repeating-conic-gradient(": Nib is flat: no gradients (nib/no-gradient)',
    ]);
  });

  it('rejects the legacy -webkit-gradient() syntax', async () => {
    expect(await lint('a { background: -webkit-gradient(linear, 0 0, 0 1, from(var(--a))); }')).toEqual([
      'nib/no-gradient: Unexpected background "-webkit-gradient(": Nib is flat: no gradients (nib/no-gradient)',
    ]);
  });
});

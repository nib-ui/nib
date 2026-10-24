import { describe, expect, it } from 'vitest';
import { lintCss } from '../test/lint-css.ts';

const lint = (css: string) => lintCss(css, { 'nib/color-tokens': true });
const REASON = 'colours come from Nib tokens, var(--nib-…) (nib/color-tokens)';

describe('nib/color-tokens', () => {
  it('accepts token references, mixes of them, keywords and system colours', async () => {
    const css = `a {
      color: var(--nib-on-surface);
      background: color-mix(in srgb, var(--nib-blue) 8%, transparent);
      fill: light-dark(var(--nib-surface), var(--nib-on-surface));
      --row-fill: var(--nib-hover);
      border-color: currentColor;
      outline: 2px solid Highlight;
      caret-color: inherit;
      animation-name: red-pulse;
      mask: url(#fade);
    }`;
    expect(await lint(css)).toEqual([]);
  });

  it('rejects hex, colour functions and named colours', async () => {
    const css = 'a { color: #fff; background: rgb(0 0 0 / 50%); --brand: oklch(0.5 0.1 170); border: 1px solid red; }';
    expect(await lint(css)).toEqual([
      `nib/color-tokens: Unexpected color "#fff": ${REASON}`,
      `nib/color-tokens: Unexpected background "rgb(": ${REASON}`,
      `nib/color-tokens: Unexpected --brand "oklch(": ${REASON}`,
      `nib/color-tokens: Unexpected border "red": ${REASON}`,
    ]);
  });

  it('ignores colour-looking text inside strings', async () => {
    expect(await lint('a { background: image-set("red.png" 1x); content: "#fff"; }')).toEqual([]);
  });

  it('checks the fallback of var() too', async () => {
    expect(await lint('a { color: var(--x, red); }')).toEqual([`nib/color-tokens: Unexpected color "red": ${REASON}`]);
  });
});

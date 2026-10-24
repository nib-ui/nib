import { describe, expect, it } from 'vitest';
import { lintCss } from '../test/lint-css.ts';

const lint = (css: string) => lintCss(css, { 'nib/no-physical-direction': true });
const REASON = 'use logical inline-start/inline-end so layouts mirror under dir="rtl" (nib/no-physical-direction)';

describe('nib/no-physical-direction', () => {
  it('accepts logical properties, start/end values and symmetric shorthands', async () => {
    const css = `a {
      margin-inline-start: 4px; inset-inline-end: 0; text-align: start; float: inline-end;
      padding: 4px 8px; margin: 0 8px 0 8px; top: 0; bottom: 0;
    }`;
    expect(await lint(css)).toEqual([]);
  });

  it('rejects left/right properties and values', async () => {
    expect(await lint('a { margin-left: 4px; right: 0; border-right-width: 1px; text-align: left; clear: right; }')).toEqual([
      `nib/no-physical-direction: Unexpected margin-left "4px": ${REASON}`,
      `nib/no-physical-direction: Unexpected right "0": ${REASON}`,
      `nib/no-physical-direction: Unexpected border-right-width "1px": ${REASON}`,
      `nib/no-physical-direction: Unexpected text-align "left": ${REASON}`,
      `nib/no-physical-direction: Unexpected clear "right": ${REASON}`,
    ]);
  });

  it('rejects a four-value shorthand whose right and left sides differ', async () => {
    expect(await lint('a { padding: 0 8px 0 16px; }')).toEqual([
      `nib/no-physical-direction: Unexpected padding "0 8px 0 16px": ${REASON}`,
    ]);
  });

  it('rejects prefixed and text-align-last direction values', async () => {
    expect(await lint('a { text-align: -webkit-right; text-align-last: right; }')).toHaveLength(2);
  });

  it('leaves corner radius to nib/no-radius, so a corner is reported once', async () => {
    expect(await lint('a { border-top-left-radius: 4px; }')).toEqual([]);
  });
});

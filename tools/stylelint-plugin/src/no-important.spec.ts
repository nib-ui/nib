import { describe, expect, it } from 'vitest';
import { lintCss } from '../test/lint-css.ts';

const lint = (css: string) => lintCss(css, { 'nib/no-important': true });
const REASON = 'only allowed inside prefers-reduced-motion, after a comment saying why (nib/no-important)';

describe('nib/no-important', () => {
  it('accepts !important inside prefers-reduced-motion when a comment explains it', async () => {
    const css = `@media (prefers-reduced-motion: reduce) {
      * {
        /* Beats inline and component transitions so nothing moves. */
        transition-duration: 0ms !important;
      }
    }`;
    expect(await lint(css)).toEqual([]);
  });

  it('rejects !important anywhere else', async () => {
    expect(await lint('a { color: var(--nib-ink) !important; }')).toEqual([
      `nib/no-important: Unexpected color "!important": ${REASON}`,
    ]);
  });

  it('rejects !important in reduced motion without an explaining comment', async () => {
    const css = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }';
    expect(await lint(css)).toEqual([`nib/no-important: Unexpected animation "!important": ${REASON}`]);
  });

  it('rejects !important under a negated reduced-motion query', async () => {
    const css = '@media not (prefers-reduced-motion: reduce) { a { /* why */ color: var(--x) !important; } }';
    expect(await lint(css)).toEqual([`nib/no-important: Unexpected color "!important": ${REASON}`]);
  });

  it('does not count an empty comment or a stylelint directive as an explanation', async () => {
    const css = `@media (prefers-reduced-motion: reduce) {
      a { /**/ animation: none !important; }
      b { /* stylelint-disable-next-line */ transition: none !important; }
    }`;
    expect(await lint(css)).toHaveLength(2);
  });
});

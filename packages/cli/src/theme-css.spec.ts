import { describe, expect, it } from 'vitest';
import { mergeTheme, readThemeCss } from './theme-css.ts';

const ROLES = ['accent', 'surface', 'red'];

describe('readThemeCss', () => {
  it('reads light-dark() pairs and single colours for the roles it knows, the last one winning', () => {
    const css = `
      /* --nib-accent: #000; a comment is not a declaration */
      :root { --nib-accent: light-dark(#02806C, #00967d); --nib-space-md: 12px; }
      [data-theme] { --nib-red: #F00; --nib-accent: light-dark(#036b5b, #0aa) }`;
    expect(readThemeCss(css, ROLES)).toEqual({
      colors: {
        light: { accent: '#036b5b', red: '#ff0000' },
        dark: { accent: '#00aaaa', red: '#ff0000' },
      },
      aliases: {},
      unreadable: [],
    });
  });

  it('reads past !important, and never inside strings, url() or a longer custom property', () => {
    const css = `:root {
      --nib-accent: #00967D !important;
      content: "--nib-red: #000000";
      background: url(x.css?--nib-red:#111111);
      --my-nib-red: #222222;
    }`;
    expect(readThemeCss(css, ROLES)).toMatchObject({
      colors: { light: { accent: '#00967d' }, dark: { accent: '#00967d' } },
      unreadable: [],
    });
  });

  it("follows an alias to another role's colour, after every override", () => {
    const over = readThemeCss(':root { --nib-red: var(--nib-accent); --nib-accent: #00967d; }', ROLES);
    expect(over.aliases).toEqual({ red: 'accent' });
    const base = { dark: { accent: '#111111', red: '#222222' }, light: { accent: '#333333', red: '#444444' } };
    expect(mergeTheme(base, over).light).toEqual({ accent: '#00967d', red: '#00967d' });
  });

  it('lists colours it cannot proof instead of skipping them', () => {
    const css = ':root { --nib-accent: oklch(60% 0.1 170); --nib-surface: var(--brand); --nib-red: rgb(1 2 3) }';
    expect(readThemeCss(css, ROLES).unreadable).toEqual([
      '--nib-accent: oklch(60% 0.1 170)',
      '--nib-surface: var(--brand)',
      '--nib-red: rgb(1 2 3)',
    ]);
  });
});

describe('mergeTheme', () => {
  it("lays the stylesheet's colours over the base palette, theme by theme", () => {
    const base = { dark: { accent: '#111111', red: '#222222' }, light: { accent: '#333333', red: '#444444' } };
    expect(mergeTheme(base, { colors: { dark: { accent: '#00aaaa' }, light: {} }, aliases: {} })).toEqual({
      dark: { accent: '#00aaaa', red: '#222222' },
      light: { accent: '#333333', red: '#444444' },
    });
  });
});

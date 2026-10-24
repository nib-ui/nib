/** The presets `nib init` offers, and the page defaults each one sets on `<html>`. */
export const PRESETS = {
  docs: { summary: 'docs: nav, article, outline; theme follows the OS', html: {} },
  dashboard: {
    summary: 'dashboard: ruled panes and a dock; dark and compact',
    html: { 'data-theme': 'dark', 'data-density': 'compact' },
  },
  blog: { summary: 'blog: articles and post lists; light', html: { 'data-theme': 'light' } },
  landing: { summary: 'landing: hero to footer; theme follows the OS', html: {} },
} as const satisfies Record<string, { summary: string; html: Record<string, string> }>;

export type Preset = keyof typeof PRESETS;
export type CssKind = 'plain' | 'tailwind';

export const isPreset = (value: string): value is Preset => Object.hasOwn(PRESETS, value);

/** The stylesheet the app imports once: Nib alone, or Tailwind with Nib's tokens as its theme. */
export function entryCss(css: CssKind, themeImport: string): string {
  const head = '/* Nib, set by `nib init`. Import this file once, before your own styles. */\n';
  const theme = `@import '${themeImport}';\n`;
  if (css === 'plain') return `${head}@import '@nib-ui/css/nib.css';\n${theme}`;
  return (
    `${head}` +
    "/* Tailwind's preflight first, then Nib's reset and components; Tailwind utilities still win. */\n" +
    '@layer theme, base, nib, components, utilities;\n' +
    "@import 'tailwindcss';\n" +
    "@import '@nib-ui/tokens/tailwind.css';\n" +
    "@import '@nib-ui/css/nib.css';\n" +
    theme
  );
}

/** The theme file `nib theme check` reads: empty overrides, with the open tokens written out. */
export const THEME_CSS = `/* Your theme. Only the open tokens belong here: the accent, the three free hues (blue, cyan,
   magenta), font families and density. Run \`nib theme check\` after any change. */
:root {
  /* --nib-accent: light-dark(#02806c, #00967d); */
  /* --nib-accent-text: light-dark(#007561, #009e84); */
}
`;

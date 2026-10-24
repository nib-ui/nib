export type Theme = 'dark' | 'light';

/** Colours of both themes resolved to hex, as in `@nib-ui/tokens/tokens.json` under `color`. */
export interface ThemeColors {
  dark: Record<string, string>;
  light: Record<string, string>;
}

/** One finding. Errors fail CI and `nib theme check`; warnings are printed only. */
export interface ProofMark {
  severity: 'error' | 'warning';
  theme: Theme;
  message: string;
}

const STORY: Record<Theme, string> = { dark: 'ink', light: 'paper' };

/** `surface-raised` in light reads "paper-raised"; other backgrounds keep their name plus the theme. */
export const themeTag = (theme: Theme) => `(${STORY[theme]})`;

export const placeName = (name: string, theme: Theme) =>
  name.startsWith('surface') ? name.replace('surface', STORY[theme]) : `${name} ${themeTag(theme)}`;

/** Rounds down, so a ratio of 2.96 never prints as "3.0:1, needs 3:1". */
export const floor1 = (n: number) => (Math.floor(n * 10) / 10).toFixed(1);

/** A colour of one theme; `checkTheme` has already verified every name a rule reads exists. */
export function colour(colors: Record<string, string>, name: string): string {
  const hex = colors[name];
  if (hex === undefined) throw new Error(`Missing colour ${name}`);
  return hex;
}

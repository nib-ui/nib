import { checkTheme, type ProofMark, type ThemeColors } from '@nib-ui/color-engine';

export const HUES = ['blue', 'cyan', 'green', 'magenta', 'yellow', 'red'] as const;
export type Hue = (typeof HUES)[number];
type Theme = 'light' | 'dark';

/** What the controls set: the accent pair for each theme, and which hue plays "error". */
export interface Choices {
  accent: Record<Theme, string>;
  accentText: Record<Theme, string>;
  errorHue: Hue;
}

/** The choices the shipped tokens make, read back from their colours. */
export function defaults(colors: ThemeColors): Choices {
  const errorHue = HUES.find((h) => colors.light[h] === colors.light['error']) ?? 'red';
  return {
    accent: { light: colors.light['accent'] ?? '', dark: colors.dark['accent'] ?? '' },
    accentText: { light: colors.light['accent-text'] ?? '', dark: colors.dark['accent-text'] ?? '' },
    errorHue,
  };
}

/** The palette with the choices applied, for the colour checks. */
export function applyChoices(colors: ThemeColors, choices: Choices): ThemeColors {
  const theme = (t: Theme) => ({
    ...colors[t],
    accent: choices.accent[t],
    'accent-text': choices.accentText[t],
    error: colors[t][choices.errorHue] ?? colors[t]['error'] ?? '',
  });
  return { light: theme('light'), dark: theme('dark') };
}

/** Every contrast and colour-vision problem the choices cause, for both themes. */
export function proofMarks(colors: ThemeColors, choices: Choices): ProofMark[] {
  return checkTheme(applyChoices(colors, choices));
}

/** The custom properties that carry the choices; both themes switch through light-dark(). */
export function customProperties(choices: Choices): Record<string, string> {
  return {
    '--nib-accent': `light-dark(${choices.accent.light}, ${choices.accent.dark})`,
    '--nib-accent-text': `light-dark(${choices.accentText.light}, ${choices.accentText.dark})`,
    '--nib-error': `var(--nib-${choices.errorHue})`,
  };
}

/** The choices as a stylesheet to paste after nib.css. */
export function exportCss(choices: Choices): string {
  const lines = Object.entries(customProperties(choices)).map(([name, value]) => `  ${name}: ${value};`);
  return `@layer nib.theme {\n  :root {\n${lines.join('\n')}\n  }\n}\n`;
}

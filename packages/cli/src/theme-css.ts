import type { ThemeColors } from '@nib-ui/color-engine';

/** What a stylesheet sets for Nib's colour roles, and what could not be read as a colour. */
export interface ThemeOverrides {
  colors: { dark: Record<string, string>; light: Record<string, string> };
  unreadable: string[];
}

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** `#abc` and `#abcd` grow to six and eight digits; the colour engine reads the long forms. */
function hex(value: string): string | null {
  const v = value.trim();
  if (!HEX.test(v)) return null;
  const digits = v.slice(1).toLowerCase();
  return `#${digits.length > 4 ? digits : [...digits].map((d) => d + d).join('')}`;
}

/** `light-dark(light, dark)` or one colour for both themes, as `@nib-ui/tokens` writes them. */
function themesOf(value: string): { light: string; dark: string } | null {
  const pair = /^light-dark\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)$/i.exec(value.trim());
  const light = hex(pair ? (pair[1] ?? '') : value);
  const dark = hex(pair ? (pair[2] ?? '') : value);
  return light && dark ? { light, dark } : null;
}

/**
 * Reads every `--nib-<role>: …` declaration for a colour role in `roles` from CSS text. A later
 * declaration wins, as in the cascade; selectors are not weighed, so a theme meant for one region
 * is checked as if it applied everywhere.
 */
export function readThemeCss(css: string, roles: readonly string[]): ThemeOverrides {
  const known = new Set(roles);
  const out: ThemeOverrides = { colors: { dark: {}, light: {} }, unreadable: [] };
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, role = '', value = ''] of text.matchAll(/--nib-([a-z0-9-]+)\s*:\s*([^;}]+)/gi)) {
    if (!known.has(role)) continue;
    const themes = themesOf(value);
    if (!themes) {
      out.unreadable.push(`--nib-${role}: ${value.trim()}`);
      continue;
    }
    out.colors.light[role] = themes.light;
    out.colors.dark[role] = themes.dark;
  }
  return out;
}

/** Nib's palette with a stylesheet's colours laid over it. */
export function mergeTheme(base: ThemeColors, over: ThemeOverrides['colors']): ThemeColors {
  return { dark: { ...base.dark, ...over.dark }, light: { ...base.light, ...over.light } };
}

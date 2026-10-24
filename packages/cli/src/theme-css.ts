import type { ThemeColors } from '@nib-ui/color-engine';

/** What a stylesheet sets for Nib's colour roles, and what could not be read as a colour. */
export interface ThemeOverrides {
  colors: { dark: Record<string, string>; light: Record<string, string> };
  /** Roles set to another role (`var(--nib-surface)`), resolved once the palette is known. */
  aliases: Record<string, string>;
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
  const pair = /^light-dark\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)$/i.exec(value);
  const light = hex(pair ? (pair[1] ?? '') : value);
  const dark = hex(pair ? (pair[2] ?? '') : value);
  return light && dark ? { light, dark } : null;
}

/**
 * Comments, strings and `url()` emptied out, keeping their length, so a declaration is only ever
 * found where CSS would read one.
 */
const blank = (css: string) =>
  css.replace(/\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|url\(\s*[^)]*\)/gi, (m) => ' '.repeat(m.length));

/**
 * Reads every `--nib-<role>: …` declaration for a colour role in `roles` from CSS text. A later
 * declaration wins, as in the cascade; selectors are not weighed, so a theme meant for one region
 * is checked as if it applied everywhere.
 */
export function readThemeCss(css: string, roles: readonly string[]): ThemeOverrides {
  const known = new Set(roles);
  const out: ThemeOverrides = { colors: { dark: {}, light: {} }, aliases: {}, unreadable: [] };
  for (const [, role = '', raw = ''] of blank(css).matchAll(/(?<![\w-])--nib-([a-z0-9-]+)\s*:\s*([^;{}]+)/gi)) {
    if (!known.has(role)) continue;
    const value = raw.replace(/\s*!important\s*$/i, '').trim();
    const alias = /^var\(\s*--nib-([a-z0-9-]+)\s*\)$/i.exec(value)?.[1];
    const themes = themesOf(value);
    delete out.aliases[role];
    if (alias && known.has(alias)) out.aliases[role] = alias;
    else if (themes) {
      out.colors.light[role] = themes.light;
      out.colors.dark[role] = themes.dark;
    } else out.unreadable.push(`--nib-${role}: ${value}`);
  }
  return out;
}

/** Nib's palette with a stylesheet's colours laid over it. */
export function mergeTheme(base: ThemeColors, over: Pick<ThemeOverrides, 'colors' | 'aliases'>): ThemeColors {
  const merged = { dark: { ...base.dark, ...over.colors.dark }, light: { ...base.light, ...over.colors.light } };
  // An alias reads the role it names after every override, as var() does in the cascade.
  for (const theme of ['dark', 'light'] as const) {
    for (const [role, target] of Object.entries(over.aliases)) {
      const value = merged[theme][target];
      if (value !== undefined) merged[theme][role] = value;
    }
  }
  return merged;
}

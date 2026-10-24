import { colorCss, plainValue } from './css-values.ts';
import type { DtcgColorValue, DtcgGroup, DtcgToken } from './dtcg.ts';
import { flatten, Registry, subgroups } from './token-tree.ts';
import type { TokenSource } from './build-tokens.ts';

/** One custom property in `tokens.css`, with where it came from. */
export interface TokenVar {
  group: 'color' | 'font' | 'typography' | 'spacing' | 'motion' | 'density';
  /** CSS name without `--nib-` and group prefix, e.g. `blue-soft`, `label-md-font-size`. */
  name: string;
  /** DTCG path inside its group, e.g. `label-md.font-size`. */
  path: string;
  cssName: string;
  /** Right-hand side of the declaration. */
  value: string;
  type: string | undefined;
  /** Set for density variables: the density whose rule holds this value. */
  density?: string;
}

// Variable prefix per group: `font.mono` → `--nib-font-mono`, `spacing.lg` → `--nib-space-lg`,
// `typography.label-md.font-size` → `--nib-label-md-font-size`, `motion.duration.hover` →
// `--nib-duration-hover`.
const PREFIX = { font: 'font-', typography: '', spacing: 'space-', motion: '' } as const;

// The six semantic hues are fixed by the spec; each gets a -soft fill and a -border outline,
// mixed from the hue with these percentages (light, dark).
const HUES = ['blue', 'cyan', 'green', 'magenta', 'yellow', 'red'];
/** Percent of the hue in its derived variants, mixed with transparent: `[light, dark]`. */
export const HUE_MIX = { soft: [8, 11], border: [35, 36] } as const;

const lightDark = (light: string, dark: string) => `light-dark(${light}, ${dark})`;
const mix = (name: string, pct: number) => `color-mix(in srgb, var(--nib-${name}) ${pct}%, transparent)`;

function assertSameNames(dark: Map<string, unknown>, light: Map<string, unknown>) {
  for (const [a, b, aName, bName] of [
    [dark, light, 'dark', 'light'],
    [light, dark, 'light', 'dark'],
  ] as const) {
    for (const name of a.keys()) {
      if (!b.has(name)) throw new Error(`Colour "${name}" is defined for ${aName} but not for ${bName}`);
    }
  }
}

/** Resolves every token of the source to a CSS variable, aliases included. */
export function tokenVars(source: TokenSource): TokenVar[] {
  const registry = new Registry();
  const byName = (group: DtcgGroup) => new Map(flatten(group).map(([n, t]) => [n, t]));
  const dark = byName(source.color.dark);
  const light = byName(source.color.light);
  assertSameNames(dark, light);

  const plain = Object.entries(PREFIX).flatMap(([group, prefix]) =>
    flatten(source[group as keyof typeof PREFIX] ?? {}).map(([name, token, path]) => ({
      group: group as TokenVar['group'],
      name,
      path,
      cssName: `--nib-${prefix}${name}`,
      token,
    })),
  );
  for (const [name, , path] of flatten(source.color.dark)) registry.add(`color.${path}`, `--nib-${name}`);
  for (const v of plain) registry.add(`${v.group}.${v.path}`, v.cssName);

  const colorValue = (name: string, t: DtcgToken) =>
    registry.alias(name, t.$value) ?? colorCss(t.$value as DtcgColorValue);
  const colors = flatten(source.color.dark).flatMap(([name, darkToken, path]): TokenVar[] => {
    // assertSameNames guarantees the light token exists.
    const lightToken = light.get(name) as DtcgToken;
    const alias = registry.alias(name, darkToken.$value);
    // An alias resolves to a variable that already switches theme, so it needs no light-dark().
    const value =
      alias && alias === registry.alias(name, lightToken.$value)
        ? alias
        : lightDark(colorValue(name, lightToken), colorValue(name, darkToken));
    const base = { group: 'color' as const, type: 'color' };
    const vars: TokenVar[] = [{ ...base, name, path, cssName: `--nib-${name}`, value }];
    if (HUES.includes(name)) {
      for (const [suffix, [l, d]] of Object.entries(HUE_MIX)) {
        vars.push({
          ...base,
          name: `${name}-${suffix}`,
          path: `${path}-${suffix}`,
          cssName: `--nib-${name}-${suffix}`,
          value: lightDark(mix(name, l), mix(name, d)),
        });
      }
    }
    return vars;
  });

  const plainVars = plain.map(({ token, ...v }): TokenVar => ({
    ...v,
    type: token.$type,
    value: registry.alias(v.cssName, token.$value) ?? plainValue(v.cssName, token),
  }));

  const modes = subgroups(source.density);
  assertDensities(modes);
  const density = modes.flatMap(([mode, group]) =>
    flatten(group).map(([name, token, path]): TokenVar => ({
      group: 'density',
      name,
      path,
      cssName: `--nib-density-${name}`,
      value: plainValue(name, token),
      type: token.$type,
      density: mode,
    })),
  );
  const all = [...colors, ...plainVars, ...density];
  assertUniqueNames(all);
  return all;
}

/** The density that also applies at the root. */
export const DEFAULT_DENSITY = 'comfortable';

/** Every density defines the same names, and the default exists so the root always has values. */
function assertDensities(modes: [string, DtcgGroup][]) {
  if (modes.length === 0) return;
  if (!modes.some(([mode]) => mode === DEFAULT_DENSITY)) {
    throw new Error(`Density needs a "${DEFAULT_DENSITY}" group: it is the default at the root`);
  }
  const names = modes.map(([mode, group]) => [mode, new Set(flatten(group).map(([n]) => n))] as const);
  const every = new Set(names.flatMap(([, n]) => [...n]));
  for (const [mode, own] of names) {
    for (const name of every) if (!own.has(name)) throw new Error(`Density "${mode}" lacks "${name}"`);
  }
}

/** Two tokens must never write the same custom property; the later one would silently win. */
function assertUniqueNames(vars: TokenVar[]) {
  const seen = new Set<string>();
  for (const v of vars) {
    const key = `${v.cssName}@${v.density ?? ''}`;
    if (seen.has(key)) throw new Error(`Two tokens compile to ${v.cssName}`);
    seen.add(key);
  }
}

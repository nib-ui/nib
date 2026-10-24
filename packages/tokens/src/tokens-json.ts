import { colorCss } from './css-values.ts';
import type { DtcgColorValue, DtcgGroup, DtcgToken } from './dtcg.ts';
import { flatten } from './token-tree.ts';
import type { TokenVar } from './token-vars.ts';

const ALIAS = /^\{color\.([^}]+)\}$/;

/** Hex per colour name for one theme, following aliases (`{color.red}`) inside that theme. */
function resolvedColors(group: DtcgGroup): Record<string, string> {
  const tokens = new Map(flatten(group).map(([name, token, path]) => [path, { name, token }]));
  const resolve = (token: DtcgToken, seen: Set<string>): string => {
    const ref = typeof token.$value === 'string' ? ALIAS.exec(token.$value)?.[1] : undefined;
    if (!ref) return colorCss(token.$value as DtcgColorValue);
    if (seen.has(ref)) throw new Error(`Colour alias cycle through {color.${ref}}`);
    const target = tokens.get(ref);
    if (!target) throw new Error(`Colour alias {color.${ref}} does not exist`);
    return resolve(target.token, new Set(seen).add(ref));
  };
  return Object.fromEntries([...tokens.values()].map(({ name, token }) => [name, resolve(token, new Set())]));
}

/**
 * `tokens.json` for tools: colours resolved per theme (what contrast checks need), every root
 * custom property with its CSS value, and the values of each density.
 */
export function tokensJson(color: { dark: DtcgGroup; light: DtcgGroup }, vars: TokenVar[]): string {
  const density: Record<string, Record<string, string>> = {};
  for (const v of vars) if (v.density) (density[v.density] ??= {})[v.cssName] = v.value;
  const root = vars.filter((v) => !v.density).map((v) => [v.cssName, v.value]);
  const json = {
    color: { dark: resolvedColors(color.dark), light: resolvedColors(color.light) },
    vars: Object.fromEntries(root),
    density,
  };
  return `${JSON.stringify(json, null, 2)}\n`;
}

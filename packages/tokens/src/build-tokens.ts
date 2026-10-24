import type { DtcgGroup } from './dtcg.ts';
import { tailwindTheme } from './tailwind-theme.ts';
import { DEFAULT_DENSITY, tokenVars, type TokenVar } from './token-vars.ts';
import { tokensJson } from './tokens-json.ts';

/** Every DTCG file of the token source, already parsed. */
export interface TokenSource {
  /** Colour tokens per theme; both groups must have exactly the same names. */
  color: { dark: DtcgGroup; light: DtcgGroup };
  font?: DtcgGroup;
  typography?: DtcgGroup;
  spacing?: DtcgGroup;
  motion?: DtcgGroup;
  /** One group per density (`comfortable`, `compact`) with the same names in each. */
  density?: DtcgGroup;
}

export interface TokenOutputs {
  /** CSS custom properties for the plain entry, in `@layer nib.theme`. */
  css: string;
  /** `@theme inline` aliases for the Tailwind v4 entry. */
  tailwindCss: string;
  /** Resolved values for tools such as `nib theme check`. */
  json: string;
}

const LAYERS = '@layer nib.theme, nib.base, nib.components, nib.utilities;';

const rule = (selector: string, decls: string[]) => `  ${selector} {\n${decls.map((d) => `    ${d}`).join('\n')}\n  }`;
const indent = (text: string) => text.replace(/^/gm, '  ');
const decl = (v: TokenVar) => `${v.cssName}: ${v.value};`;

function densityRules(vars: TokenVar[]): string[] {
  const modes = [...new Set(vars.flatMap((v) => v.density ?? []))];
  return modes.map((mode) =>
    rule(
      `${mode === DEFAULT_DENSITY ? ':root, ' : ''}[data-density="${mode}"]`,
      vars.filter((v) => v.density === mode).map(decl),
    ),
  );
}

/** Pure: turns the token source into every published file's text. */
export function buildTokens(source: TokenSource): TokenOutputs {
  const vars = tokenVars(source);
  const rootVars = vars.filter((v) => v.group !== 'density');
  // Durations go to zero rather than shortening, so no motion is left to trigger vestibular symptoms.
  const still = rootVars.filter((v) => v.type === 'duration').map((v) => `${v.cssName}: 0ms;`);
  const css = [
    LAYERS,
    '',
    '@layer nib.theme {',
    rule(':root', ['color-scheme: light dark;', ...rootVars.map(decl)]),
    // light-dark() resolves where a variable is used, so a region's color-scheme picks its theme.
    rule('[data-theme="light"]', ['color-scheme: light;']),
    rule('[data-theme="dark"]', ['color-scheme: dark;']),
    ...densityRules(vars),
    ...(still.length ? ['  @media (prefers-reduced-motion: reduce) {', indent(rule(':root', still)), '  }'] : []),
    '}',
    '',
  ].join('\n');
  return { css, tailwindCss: tailwindTheme(vars), json: tokensJson(source.color, vars) };
}

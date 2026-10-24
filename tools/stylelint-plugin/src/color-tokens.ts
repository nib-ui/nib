import { withoutStrings } from './css-text.ts';
import { declarationRule } from './declaration-rule.ts';
import { NAMED_COLORS } from './named-colors.ts';

const HEX = /#[0-9a-f]{3,8}\b/i;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const URL = /\burl\([^)]*\)/gi;
// Properties whose words can be colours; elsewhere `red` may be an animation or grid-area name.
const COLOR_PROP =
  /color$|^(?:background|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|outline|fill|stroke|text-decoration|text-emphasis|column-rule|box-shadow|text-shadow)$/i;

export default declarationRule({
  name: 'color-tokens',
  reason: 'colours come from Nib tokens, var(--nib-…)',
  check: ({ prop, value }) => {
    // url(#fade) holds a fragment and strings hold file names or content, not colours.
    const text = withoutStrings(value).replace(URL, '');
    const literal = HEX.exec(text)?.[0] ?? COLOR_FUNCTION.exec(text)?.[0];
    if (literal) return literal;
    if (!COLOR_PROP.test(prop)) return undefined;
    // Variable names and color-mix() colour spaces are not colour words; a var() fallback is.
    const words =
      text
        .replace(/var\(\s*--[\w-]+/gi, '')
        .replace(/\bin\s+[a-z-]+/gi, '')
        .match(/[a-z]+/gi) ?? [];
    return words.find((w: string) => NAMED_COLORS.has(w.toLowerCase()));
  },
});

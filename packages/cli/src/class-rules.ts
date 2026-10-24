/** A Nib law a utility class breaks, named after the Stylelint rule for the same law. */
export interface ClassProblem {
  rule: string;
  message: string;
}

// Tailwind's default palette. Nib's own colours are `nib-*` (`bg-nib-red`), so a palette colour
// with a shade, or black and white, never comes from the tokens.
const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|mauve|olive|mist|taupe';
const COLOR_UTILITY =
  'bg|text|border(?:-[xytblrse])?|ring|ring-offset|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow|inset-shadow|drop-shadow|text-shadow';
const OFF_TOKEN = new RegExp(`^(?:${COLOR_UTILITY})-(?:(?:${PALETTE})-\\d{2,3}|black|white)(?:/[\\w.]+)?$`);
// An arbitrary value holding a colour: `bg-[#f00]`, `text-[rgb(0_0_0)]`, `border-[color:red]`,
// or a named colour on a colour utility (`text-[red]`); `transparent` and `currentColor` are fine.
const ARBITRARY_COLOR = /-\[(?:color:)?(?:#[0-9a-f]{3,8}|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(.*)\]$/i;
const NAMED_COLOR = new RegExp(
  `^(?:${COLOR_UTILITY})-\\[(?:color:)?(?!transparent\\]|currentcolor\\]|inherit\\])[a-z]+\\]$`,
  'i',
);

/** Utility stems of each law; `<stem>-none` (and `-0` for radius) keeps to the law. */
const LAWS: { rule: string; stem: RegExp; law: string }[] = [
  { rule: 'nib/no-radius', stem: /^rounded(?:-[a-z]{1,2})?(?:-|$)/, law: 'corners stay square' },
  {
    rule: 'nib/no-shadow',
    stem: /^(?:shadow|inset-shadow|drop-shadow|text-shadow)(?:-|$)/,
    law: 'nothing casts a shadow',
  },
  { rule: 'nib/no-gradient', stem: /^bg-(?:gradient-|linear-|radial|conic)/, law: 'fills are flat' },
  { rule: 'nib/no-blur', stem: /^(?:backdrop-)?blur(?:-|$)/, law: 'nothing is blurred' },
];

/** The bare utility: variants (`md:`, `hover:`), the important mark and a negative sign removed. */
export function utilityOf(name: string): string {
  // Variants end at the last colon outside an arbitrary value's brackets.
  let depth = 0;
  let cut = 0;
  for (let i = 0; i < name.length; i++) {
    if (name[i] === '[') depth++;
    else if (name[i] === ']') depth--;
    else if (name[i] === ':' && depth === 0) cut = i + 1;
  }
  return name.slice(cut).replace(/^!|!$/g, '').replace(/^-/, '');
}

const KEEPS_LAW = /-(?:none|0|\[0(?:px)?\])$/;

/** The law a class breaks, or null. */
export function classProblem(name: string): ClassProblem | null {
  const utility = utilityOf(name);
  for (const { rule, stem, law } of LAWS) {
    if (!stem.test(utility) || KEEPS_LAW.test(utility)) continue;
    // A shadow's colour (`shadow-nib-line`) still draws a shadow; only `-none` is allowed.
    return { rule, message: `${name}: ${law}.` };
  }
  if (OFF_TOKEN.test(utility) || ARBITRARY_COLOR.test(utility) || NAMED_COLOR.test(utility))
    return { rule: 'nib/color-tokens', message: `${name}: colours come from the tokens (nib-*).` };
  return null;
}

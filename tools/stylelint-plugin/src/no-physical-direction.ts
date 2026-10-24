import { declarationRule } from './declaration-rule.ts';

const PHYSICAL_PROP = /(^|-)(left|right)(-|$)/i;
const DIRECTION_VALUE_PROPS = new Set(['text-align', 'text-align-last', 'float', 'clear']);
const RADIUS = /-radius$/i;
// Box shorthands whose fourth value is the left side and second the right.
const BOX_SHORTHANDS = new Set([
  'margin',
  'padding',
  'inset',
  'border-width',
  'border-style',
  'border-color',
  'scroll-margin',
  'scroll-padding',
]);

export default declarationRule({
  name: 'no-physical-direction',
  reason: 'use logical inline-start/inline-end so layouts mirror under dir="rtl"',
  check: ({ prop, value }) => {
    const p = prop.toLowerCase();
    // Corners belong to nib/no-radius: any radius but 0 is already banned, and 0 is symmetric.
    if (p.startsWith('--') || RADIUS.test(p)) return undefined;
    if (PHYSICAL_PROP.test(p)) return value.trim();
    const v = value
      .trim()
      .toLowerCase()
      .replace(/^-[a-z]+-/, '');
    if (DIRECTION_VALUE_PROPS.has(p) && (v === 'left' || v === 'right')) return value.trim();
    if (BOX_SHORTHANDS.has(p)) {
      const sides = value.trim().split(/\s+/);
      if (sides.length === 4 && sides[1] !== sides[3]) return value.trim();
    }
    return undefined;
  },
});

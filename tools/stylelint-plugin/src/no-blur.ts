import { callOf, isNone } from './css-text.ts';
import { declarationRule } from './declaration-rule.ts';

const BLUR = callOf('blur');

export default declarationRule({
  name: 'no-blur',
  reason: 'Nib is flat: no blur or frosted glass',
  check: ({ prop, value }) => {
    const p = prop.toLowerCase();
    // Every backdrop filter tints or blurs what lies behind an overlay; overlays use a solid surface.
    if (p === 'backdrop-filter' || p === '-webkit-backdrop-filter') return isNone(value) ? undefined : value;
    if (p === 'filter') return BLUR.exec(value)?.[0];
    return undefined;
  },
});

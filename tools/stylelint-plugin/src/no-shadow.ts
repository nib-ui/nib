import { callOf, isNone } from './css-text.ts';
import { declarationRule } from './declaration-rule.ts';

const DROP_SHADOW = callOf('drop-shadow');

export default declarationRule({
  name: 'no-shadow',
  reason: 'depth comes from surfaces and lines, not shadows',
  check: ({ prop, value }) => {
    const p = prop.toLowerCase();
    if (p === 'box-shadow' || p === 'text-shadow') return isNone(value) ? undefined : value;
    if (p === 'filter') return DROP_SHADOW.exec(value)?.[0];
    return undefined;
  },
});

import { declarationRule } from './declaration-rule.ts';

const RADIUS = /^(?:-[a-z]+-)?border(-[a-z]+)*-radius$/i;
const ZERO = /^0(\.0+)?([a-z]+|%)?$/i;

export default declarationRule({
  name: 'no-radius',
  reason: 'corners are square in Nib',
  check: (decl) => {
    if (!RADIUS.test(decl.prop)) return undefined;
    return decl.value.split(/[\s/]+/).every((part: string) => ZERO.test(part)) ? undefined : decl.value;
  },
});

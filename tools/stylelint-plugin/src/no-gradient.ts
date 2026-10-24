import { declarationRule } from './declaration-rule.ts';

// Also the legacy `-webkit-gradient(linear, …)` syntax.
const GRADIENT = /(?:\b(?:repeating-)?(?:linear|radial|conic)-gradient|-webkit-gradient)\(/i;

export default declarationRule({
  name: 'no-gradient',
  reason: 'Nib is flat: no gradients',
  check: ({ value }) => GRADIENT.exec(value)?.[0],
});

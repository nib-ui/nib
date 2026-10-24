import stylelint, { type Rule } from 'stylelint';
import type { Declaration } from 'postcss';

const { createPlugin, utils } = stylelint;

export interface DeclarationCheck {
  /** Rule name without the namespace, e.g. `no-radius`. */
  name: string;
  /** Why the law exists, appended to every message: "corners are square in Nib". */
  reason: string;
  /** Returns the offending part of the declaration, or `undefined` when it obeys the law. */
  check: (decl: Declaration) => string | undefined;
}

/** A plugin as `createPlugin` builds it; Stylelint's own `Plugin` type also allows a module wrapper. */
export interface NibPlugin {
  ruleName: string;
  rule: Rule;
}

/**
 * Builds a plugin that inspects every declaration. Every Nib law is a statement about
 * declarations, so one shape covers them all and keeps messages uniform.
 */
export function declarationRule({ name, reason, check }: DeclarationCheck): NibPlugin {
  const ruleName = `nib/${name}`;
  const messages = utils.ruleMessages(ruleName, {
    rejected: (prop: string, value: string) => `Unexpected ${prop} "${value}": ${reason}`,
  });
  const rule: Rule = (primary) => (root, result) => {
    if (!utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;
    root.walkDecls((decl) => {
      const offending = check(decl);
      if (offending === undefined) return;
      utils.report({ result, ruleName, node: decl, word: offending, message: messages.rejected(decl.prop, offending) });
    });
  };
  rule.ruleName = ruleName;
  rule.messages = messages;
  rule.meta = { url: `https://github.com/nib-ui/nib/tree/main/tools/stylelint-plugin#${name}` };
  return createPlugin(ruleName, rule) as NibPlugin;
}

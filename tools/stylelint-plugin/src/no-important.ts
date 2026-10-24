import type { AtRule, Comment, Declaration, Node } from 'postcss';
import { declarationRule } from './declaration-rule.ts';

const REDUCED_MOTION = /prefers-reduced-motion\s*:\s*reduce/i;
const NEGATED = /\bnot\b/i;
const DIRECTIVE = /^\s*stylelint-/;

const inReducedMotion = (decl: Declaration) => {
  for (let node: Node | undefined = decl.parent as Node | undefined; node; node = node.parent as Node | undefined) {
    if (node.type !== 'atrule') continue;
    const { name, params } = node as AtRule;
    if (name.toLowerCase() === 'media' && REDUCED_MOTION.test(params) && !NEGATED.test(params)) return true;
  }
  return false;
};

export default declarationRule({
  name: 'no-important',
  reason: 'only allowed inside prefers-reduced-motion, after a comment saying why',
  check: (decl) => {
    if (!decl.important) return undefined;
    const before = decl.prev();
    const note = before?.type === 'comment' ? (before as Comment).text : '';
    const explained = note.trim() !== '' && !DIRECTIVE.test(note);
    return inReducedMotion(decl) && explained ? undefined : '!important';
  },
});

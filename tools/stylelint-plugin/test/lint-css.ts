import stylelint from 'stylelint';
import plugins from '../src/index.ts';

/** Lints CSS with the Nib plugins and only the given rules on; returns `rule: text` per warning. */
export async function lintCss(code: string, rules: Record<string, unknown>): Promise<string[]> {
  const { results } = await stylelint.lint({ code, config: { plugins, rules } });
  return (results[0]?.warnings ?? []).map((w) => `${w.rule}: ${w.text}`);
}

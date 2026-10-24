import type { Config } from 'stylelint';
import plugins from './index.ts';

/** Shared config: every Nib law on. Extend it, or list `@nib-ui/stylelint-plugin/config` in `extends`. */
const config: Config = {
  plugins,
  rules: Object.fromEntries(plugins.map((p) => [p.ruleName, true])),
};

export default config;

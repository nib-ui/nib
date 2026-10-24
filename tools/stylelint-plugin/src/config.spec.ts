import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';
import config from './config.ts';

const ruleNames = async (code: string) => {
  const { results } = await stylelint.lint({ code, config });
  return [...new Set((results[0]?.warnings ?? []).map((w) => w.rule))].sort();
};

describe('the shared config', () => {
  it('passes CSS written to the laws', async () => {
    const css = `@layer nib.components {
      .nib-button { border: 2px solid var(--nib-on-surface); padding-inline: var(--nib-space-sm); }
    }`;
    expect(await ruleNames(css)).toEqual([]);
  });

  it('turns every law on', async () => {
    const css = `a {
      border-radius: 4px; box-shadow: 0 0 1px var(--x); background: linear-gradient(var(--a), var(--b));
      backdrop-filter: blur(4px); color: #fff !important; margin-left: 0;
    }`;
    expect(await ruleNames(css)).toEqual([
      'nib/color-tokens',
      'nib/no-blur',
      'nib/no-gradient',
      'nib/no-important',
      'nib/no-physical-direction',
      'nib/no-radius',
      'nib/no-shadow',
    ]);
  });
});

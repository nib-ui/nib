import type { ConformanceCase, ConformanceTable } from '../testing/conformance.ts';

const ITEMS = [{ key: 'html' }, { key: 'react' }, { key: 'vue', disabled: true }, { key: 'svelte' }];

const selected = (key: string) => ({ part: 'tab', key, attrs: { 'aria-selected': 'true', tabindex: '0' } });
const shows = (key: string) => ({ part: 'panel', key, attrs: { hidden: null } });

const row = (
  name: string,
  from: string,
  keys: ConformanceCase['keys'],
  to: string,
  expectAttrs: ConformanceCase['expect']['attrs'],
  options: Record<string, unknown> = {},
): ConformanceCase => ({
  name,
  options: { id: 'tb', items: ITEMS, ...options },
  target: { part: 'tab', key: from },
  keys,
  expect: { attrs: expectAttrs, intents: [{ type: 'focus', ref: `tb-tab-${to}` }] },
});

/**
 * The APG keyboard behaviour of tabs, as data. Core runs it in its spec; the Playwright keyboard
 * spec runs the same rows against every binding.
 */
export const tabsApg: ConformanceTable = {
  pattern: 'tabs',
  cases: [
    row('ArrowRight selects and focuses the next tab', 'html', ['ArrowRight'], 'react', [
      selected('react'),
      shows('react'),
      { part: 'tab', key: 'html', attrs: { 'aria-selected': 'false', tabindex: '-1' } },
      { part: 'panel', key: 'html', attrs: { hidden: 'true' } },
    ]),
    row('ArrowRight skips a disabled tab', 'react', ['ArrowRight'], 'svelte', [selected('svelte')], {
      defaultValue: 'react',
    }),
    row('ArrowRight on the last tab wraps to the first', 'svelte', ['ArrowRight'], 'html', [selected('html')], {
      defaultValue: 'svelte',
    }),
    row('ArrowLeft on the first tab wraps to the last', 'html', ['ArrowLeft'], 'svelte', [selected('svelte')]),
    row('End selects the last tab', 'html', ['End'], 'svelte', [selected('svelte')]),
    row('Home selects the first tab', 'svelte', ['Home'], 'html', [selected('html')], { defaultValue: 'svelte' }),
    row('in right-to-left, ArrowLeft moves to the next tab', 'html', ['ArrowLeft'], 'react', [selected('react')], {
      dir: 'rtl',
    }),
    row(
      'manual activation: arrows move focus but keep the selection',
      'html',
      ['ArrowRight'],
      'react',
      [selected('html'), { part: 'tab', key: 'react', attrs: { 'aria-selected': 'false' } }],
      { activation: 'manual' },
    ),
    row('vertical: ArrowDown moves to the next tab', 'html', ['ArrowDown'], 'react', [selected('react')], {
      orientation: 'vertical',
    }),
  ],
};

import type { ConformanceCase, ConformanceTable } from '../testing/conformance.ts';

const ITEMS = [
  { key: 'copy', label: 'Copy' },
  { key: 'cut', label: 'Cut', disabled: true },
  { key: 'paste', label: 'Paste' },
  { key: 'delete', label: 'Delete' },
];
const OPTIONS = { id: 'mn', items: ITEMS };
const current = (key: string) => ({ part: 'menu', attrs: { 'aria-activedescendant': `mn-item-${key}` } });

const row = (name: string, keys: ConformanceCase['keys'], expect: ConformanceCase['expect']): ConformanceCase => ({
  name,
  options: OPTIONS,
  target: { part: 'menu' },
  keys,
  expect,
});

/**
 * The APG keyboard behaviour of the menu, as data. Both runners open the menu first, which lands
 * on the first item; core runs it in its spec, Playwright against every binding.
 */
export const menuApg: ConformanceTable = {
  pattern: 'menu',
  cases: [
    row('opening lands on the first item', [], {
      attrs: [current('copy'), { part: 'item', key: 'copy', attrs: { 'data-current': 'true' } }],
    }),
    row('ArrowDown moves to the next item, skipping disabled ones', ['ArrowDown'], { attrs: [current('paste')] }),
    row('ArrowUp on the first item wraps to the last', ['ArrowUp'], { attrs: [current('delete')] }),
    row('End moves to the last item, Home to the first', ['End', 'Home'], { attrs: [current('copy')] }),
    row('typing a letter moves to the item that starts with it', ['d'], { attrs: [current('delete')] }),
    row('Enter chooses the current item, closes the menu and returns focus to the button', ['Enter'], {
      intents: [
        { type: 'popover', ref: 'mn-menu', open: false },
        { type: 'focus', ref: 'mn-button' },
      ],
    }),
  ],
};

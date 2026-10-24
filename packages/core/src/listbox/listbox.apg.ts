import type { ConformanceCase, ConformanceTable } from '../testing/conformance.ts';

/**
 * The APG listbox behaviour as data. Core runs it in its spec; the Playwright keyboard spec runs
 * the same rows against every binding, where focusing the list comes first, as here.
 */
const items = [
  { key: 'en', label: 'English' },
  { key: 'fr', label: 'Français', disabled: true },
  { key: 'vi', label: 'Tiếng Việt' },
  { key: 'ar', label: 'العربية' },
];
const options = { id: 'lb', locale: 'vi', items };
const current = (key: string) => ({ part: 'list', attrs: { 'aria-activedescendant': `lb-option-${key}` } });
const scroll = (key: string) => ({
  type: 'scroll-into-view' as const,
  ref: `lb-option-${key}`,
  block: 'nearest' as const,
});
const row = (name: string, keys: ConformanceCase['keys'], expect: ConformanceCase['expect'], extra = {}) => ({
  name,
  options: { ...options, ...extra },
  target: { part: 'list' },
  keys,
  expect,
});

export const listboxApg: ConformanceTable = {
  pattern: 'listbox',
  cases: [
    row('focus makes the first enabled option current', [], { attrs: [current('en')], intents: [scroll('en')] }),
    row('focus makes the chosen option current', [], { attrs: [current('vi')] }, { defaultValue: 'vi' }),
    row('ArrowDown skips a disabled option', ['ArrowDown'], {
      attrs: [current('vi'), { part: 'option', key: 'fr', attrs: { 'aria-disabled': 'true', 'data-current': null } }],
      intents: [scroll('en'), scroll('vi')],
    }),
    row('ArrowUp stops at the first option', ['ArrowUp'], { attrs: [current('en')] }),
    row('End and Home jump to the last and first options', ['End'], { attrs: [current('ar')] }),
    row('Home after End returns to the first option', ['End', 'Home'], { attrs: [current('en')] }),
    row('Enter chooses the current option', ['ArrowDown', 'Enter'], {
      attrs: [
        { part: 'option', key: 'vi', attrs: { 'aria-selected': 'true' } },
        { part: 'option', key: 'en', attrs: { 'aria-selected': 'false' } },
      ],
    }),
    row('Space chooses the current option', [' '], {
      attrs: [{ part: 'option', key: 'en', attrs: { 'aria-selected': 'true' } }],
    }),
    row('typing a letter moves to the first option that starts with it', ['t'], { attrs: [current('vi')] }),
    row('typeahead ignores diacritics: "tie" finds "Tiếng Việt"', ['t', 'i', 'e'], { attrs: [current('vi')] }),
    row(
      'Space during a search is part of it: "tieng v" finds "Tiếng Việt" without choosing it',
      ['t', 'i', 'e', 'n', 'g', ' ', 'v'],
      { attrs: [current('vi'), { part: 'option', key: 'vi', attrs: { 'aria-selected': 'false' } }] },
    ),
    row('typing again after a pause starts a new search', ['t', { key: 'e', wait: 600 }], { attrs: [current('en')] }),
    row(
      'multiple: Space checks the current row with aria-checked, never aria-selected',
      ['ArrowDown', ' '],
      {
        attrs: [
          { part: 'list', attrs: { 'aria-multiselectable': 'true' } },
          {
            part: 'option',
            key: 'vi',
            attrs: { 'aria-checked': 'true', 'data-checked': 'true', 'aria-selected': null },
          },
          { part: 'option', key: 'en', attrs: { 'aria-checked': 'false', 'data-checked': null } },
        ],
      },
      { multiple: true },
    ),
  ],
};

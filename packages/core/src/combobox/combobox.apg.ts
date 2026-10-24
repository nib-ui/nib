import type { ConformanceCase, ConformanceTable } from '../testing/conformance.ts';

const ITEMS = [
  { key: 'hn', label: 'Hà Nội' },
  { key: 'hue', label: 'Huế', disabled: true },
  { key: 'dn', label: 'Đà Nẵng' },
];
const input = (attrs: Record<string, string | null>) => ({ part: 'input', attrs });

const row = (
  name: string,
  keys: ConformanceCase['keys'],
  attrs: ConformanceCase['expect']['attrs'],
): ConformanceCase => ({
  name,
  options: { id: 'cb', locale: 'vi', items: ITEMS },
  target: { part: 'input' },
  keys,
  expect: { attrs },
});

/**
 * The APG keyboard behaviour of the combobox, as data. Core runs it in its spec; the Playwright
 * keyboard spec runs the same rows against every binding. Typing is covered by each binding's spec.
 */
export const comboboxApg: ConformanceTable = {
  pattern: 'combobox',
  cases: [
    row(
      'ArrowDown opens the list on the first option',
      ['ArrowDown'],
      [input({ 'aria-expanded': 'true', 'aria-activedescendant': 'cb-option-hn' })],
    ),
    row(
      'ArrowDown again moves on, skipping disabled options',
      ['ArrowDown', 'ArrowDown'],
      [input({ 'aria-activedescendant': 'cb-option-dn' })],
    ),
    row('ArrowUp opens the list on the last option', ['ArrowUp'], [input({ 'aria-activedescendant': 'cb-option-dn' })]),
    row(
      'Enter chooses the current option and closes the list',
      ['ArrowDown', 'Enter'],
      [
        { part: 'option', key: 'hn', attrs: { 'aria-selected': 'true' } },
        input({ 'aria-expanded': 'false', 'aria-activedescendant': null }),
      ],
    ),
    row('Escape closes the list', ['ArrowDown', 'Escape'], [input({ 'aria-expanded': 'false' })]),
  ],
};

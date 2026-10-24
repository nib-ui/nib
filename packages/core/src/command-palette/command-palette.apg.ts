import type { ConformanceCase, ConformanceTable } from '../testing/conformance.ts';

const COMMANDS = [
  { key: 'new', label: 'New file', hotkey: 'mod+n' },
  { key: 'open', label: 'Open file', hotkey: 'mod+o', disabled: true },
  { key: 'save', label: 'Save', hotkey: 'mod+s' },
];
const input = (attrs: Record<string, string | null>) => ({ part: 'input', attrs });

const row = (
  name: string,
  keys: ConformanceCase['keys'],
  attrs: ConformanceCase['expect']['attrs'],
): ConformanceCase => ({
  name,
  options: { id: 'cp', locale: 'en', commands: COMMANDS, apple: true },
  target: { part: 'input' },
  keys,
  expect: { attrs },
});

/**
 * The keyboard behaviour of the command palette's field (APG combobox, list always shown), as
 * data. Core runs it in its spec; the Playwright keyboard spec runs the same rows, the palette
 * open, against every binding. Opening, Escape and running are covered by each binding's spec.
 */
export const commandPaletteApg: ConformanceTable = {
  pattern: 'combobox',
  cases: [
    row(
      'The first command is current, so Enter runs it',
      [],
      [input({ 'aria-expanded': 'true', 'aria-activedescendant': 'cp-option-new' })],
    ),
    row(
      'ArrowDown moves on, skipping disabled commands',
      ['ArrowDown'],
      [
        input({ 'aria-activedescendant': 'cp-option-save' }),
        { part: 'option', key: 'save', attrs: { 'data-current': 'true' } },
      ],
    ),
    row(
      'ArrowDown wraps from the last command',
      ['ArrowDown', 'ArrowDown'],
      [input({ 'aria-activedescendant': 'cp-option-new' })],
    ),
    row('ArrowUp wraps from the first command', ['ArrowUp'], [input({ 'aria-activedescendant': 'cp-option-save' })]),
  ],
};

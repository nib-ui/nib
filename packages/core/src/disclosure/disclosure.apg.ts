import type { ConformanceCase, ConformanceTable } from '../testing/conformance.ts';

// Rows run against createAccordion; the disclosure's only keys are the native button's.
const ITEMS = [{ key: 'ship' }, { key: 'returns', disabled: true }, { key: 'care' }];
const OPTIONS = { id: 'ac', items: ITEMS };

const row = (name: string, from: string, keys: ConformanceCase['keys'], to: string): ConformanceCase => ({
  name,
  options: OPTIONS,
  target: { part: 'trigger', key: from },
  keys,
  expect: { intents: to === from ? [] : [{ type: 'focus', ref: `ac-trigger-${to}` }] },
});

/**
 * The APG keyboard behaviour of the accordion, as data. Core runs it in its spec; the Playwright
 * keyboard spec runs the same rows against every binding.
 */
export const disclosureApg: ConformanceTable = {
  pattern: 'accordion',
  cases: [
    row('ArrowDown moves focus to the next header, skipping disabled ones', 'ship', ['ArrowDown'], 'care'),
    row('ArrowDown on the last header wraps to the first', 'care', ['ArrowDown'], 'ship'),
    row('ArrowUp on the first header wraps to the last', 'ship', ['ArrowUp'], 'care'),
    row('End moves focus to the last header', 'ship', ['End'], 'care'),
    row('Home moves focus to the first header', 'care', ['Home'], 'ship'),
  ],
};

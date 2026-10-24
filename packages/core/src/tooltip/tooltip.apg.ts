import type { ConformanceTable } from '../testing/conformance.ts';

/**
 * The APG keyboard behaviour of the tooltip, as data: focus shows it (the runner focuses the
 * target first) and Escape hides it.
 */
export const tooltipApg: ConformanceTable = {
  pattern: 'tooltip',
  cases: [
    {
      name: 'focus shows the tooltip',
      options: { id: 'tt' },
      target: { part: 'trigger' },
      keys: [],
      expect: { attrs: [{ part: 'tooltip', attrs: { hidden: null, role: 'tooltip' } }] },
    },
    {
      name: 'Escape hides it',
      options: { id: 'tt' },
      target: { part: 'trigger' },
      keys: ['Escape'],
      expect: { attrs: [{ part: 'tooltip', attrs: { hidden: 'true' } }] },
    },
  ],
};

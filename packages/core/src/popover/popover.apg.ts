import type { ConformanceTable } from '../testing/conformance.ts';

/**
 * The popover's keys (Escape closes, focus returns to the trigger) are the browser's own, from the
 * native `popover` attribute; the Playwright keyboard spec checks them in every engine. No rows.
 */
export const popoverApg: ConformanceTable = {
  pattern: 'popover',
  cases: [],
};

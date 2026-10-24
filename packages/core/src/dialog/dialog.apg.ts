import type { ConformanceTable } from '../testing/conformance.ts';

/**
 * The dialog's keys (Escape closes, Tab stays inside a modal one, focus returns to the opener) are
 * the browser's own, from the native <dialog>; the Playwright keyboard spec checks them in every
 * engine. No rows.
 */
export const dialogApg: ConformanceTable = {
  pattern: 'dialog',
  cases: [],
};

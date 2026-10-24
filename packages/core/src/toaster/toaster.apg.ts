import type { ConformanceTable } from '../testing/conformance.ts';

/** Toasts have no keys of their own: their buttons are native and the region is reached by Tab. */
export const toasterApg: ConformanceTable = {
  pattern: 'toaster',
  cases: [],
};

/** Last number handed out per base, so two ids made before either renders still differ. */
const counters = new Map<string, number>();

/**
 * An id root no element of `doc` uses: neither as its own id nor as the prefix of a part id
 * (`<root>-trigger`), so it cannot collide with server-rendered markup. For vanilla JS, where no
 * framework supplies ids.
 */
export function uniqueId(base = 'nib-id', doc: Document = document): string {
  for (;;) {
    const n = (counters.get(base) ?? 0) + 1;
    counters.set(base, n);
    const id = `${base}-${n}`;
    if (!doc.getElementById(id) && !doc.querySelector(`[id^="${CSS.escape(id)}-"]`)) return id;
  }
}

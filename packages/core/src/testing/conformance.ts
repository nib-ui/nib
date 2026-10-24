import type { Host } from '../host.ts';
import type { Instance } from '../kernel/create-instance.ts';
import type { AttrValue, Intent } from '../types.ts';
import { createTestHost } from './test-host.ts';

/** Expected attributes of one rendered part; `null` means the attribute must be absent. */
export interface ExpectedPart {
  part: string;
  key?: string;
  attrs: Record<string, string | number | boolean | null>;
}

/** A key press; `wait` advances the clock (ms) before it, e.g. past the typeahead reset. */
export type ConformanceKey =
  string | { key: string; shiftKey?: boolean; ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean; wait?: number };

/**
 * One APG behaviour: press `keys` on `target`, then check attributes and every intent returned.
 * Plain JSON, so the same table runs against core here and against each binding in Playwright.
 */
export interface ConformanceCase {
  name: string;
  options: Record<string, unknown>;
  target: { part: string; key?: string };
  keys: ConformanceKey[];
  expect: { attrs?: ExpectedPart[]; intents?: Intent[] };
}

export interface ConformanceTable {
  /** The APG pattern the table covers, e.g. "listbox". */
  pattern: string;
  cases: ConformanceCase[];
}

export interface ConformanceResult {
  name: string;
  /** Empty when the case passes. */
  failures: string[];
}

type AnyInstance = Instance<unknown, unknown, string, Record<string, unknown>>;

const show = (value: AttrValue | null) => (value === undefined || value === null ? 'absent' : JSON.stringify(value));

// Compared as the DOM stores them: as strings, so a table written from Playwright ("true") and
// core's boolean true agree.
const sameAttr = (want: string | number | boolean | null, got: AttrValue) =>
  want === null ? got === undefined : got !== undefined && String(got) === String(want);

/** JSON with sorted keys, so two intents with the same content compare equal in any key order. */
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );

function runCase(c: ConformanceCase, create: (options: Record<string, unknown>, host: Host) => unknown): string[] {
  const t = createTestHost();
  const instance = create(c.options, t.host) as AnyInstance;
  try {
    // A browser focuses the element before any key reaches it; a focus handler runs first here too.
    const target = instance.part(c.target.part, c.target.key);
    if (target.on['focus']) t.fire(target, 'focus');
    for (const press of c.keys) {
      const { wait = 0, ...init } = typeof press === 'string' ? { key: press } : press;
      t.clock.advance(wait);
      t.fire(instance.part(c.target.part, c.target.key), 'keydown', init);
    }
    const failures: string[] = [];
    for (const expected of c.expect.attrs ?? []) {
      const actual = instance.part(expected.part, expected.key).attrs;
      const label = expected.key === undefined ? expected.part : `${expected.part}[${expected.key}]`;
      for (const [name, want] of Object.entries(expected.attrs)) {
        const got = actual[name];
        if (!sameAttr(want, got)) failures.push(`${label} ${name}: expected ${show(want)}, got ${show(got)}`);
      }
    }
    if (c.expect.intents && canonical(t.intents) !== canonical(c.expect.intents)) {
      failures.push(`intents: expected ${JSON.stringify(c.expect.intents)}, got ${JSON.stringify(t.intents)}`);
    }
    return failures;
  } finally {
    instance.destroy();
  }
}

/** Runs every case against a controller factory and lists what differs; a case that throws fails alone. */
export function runConformance(
  table: ConformanceTable,
  create: (options: Record<string, unknown>, host: Host) => unknown,
): ConformanceResult[] {
  return table.cases.map((c) => {
    try {
      return { name: c.name, failures: runCase(c, create) };
    } catch (error) {
      return { name: c.name, failures: [`threw: ${error instanceof Error ? error.message : String(error)}`] };
    }
  });
}

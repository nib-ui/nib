import type { ConformanceCase } from '@nib-ui/core/testing';
import type { Page } from '@playwright/test';

// The element of a part, by the id convention every controller follows: `<id>-<part>[-<key>]`.
const selector = (id: string, part: string, key?: string) =>
  `[id="${id}-${part}${key === undefined ? '' : `-${key}`}"]`;

/**
 * Plays one APG row against a rendered component: focus the target, press the keys (waiting where
 * the row says), then compare the attributes the row expects and, for a row whose last intent
 * moves focus, where focus ended up. Returns what differs; the other intents are checked in core.
 */
export async function runApgCase(page: Page, row: ConformanceCase): Promise<string[]> {
  const id = String(row.options['id']);
  const target = page.locator(selector(id, row.target.part, row.target.key));
  await target.waitFor();
  await target.focus();
  for (const press of row.keys) {
    const { key, wait = 0, ...mods } = typeof press === 'string' ? { key: press } : press;
    if (wait) await page.waitForTimeout(wait);
    const prefix = [mods.ctrlKey && 'Control', mods.altKey && 'Alt', mods.metaKey && 'Meta', mods.shiftKey && 'Shift'];
    await page.keyboard.press([...prefix.filter(Boolean), key === ' ' ? 'Space' : key].join('+'));
  }
  const failures: string[] = [];
  for (const expected of row.expect.attrs ?? []) {
    const el = page.locator(selector(id, expected.part, expected.key));
    for (const [name, want] of Object.entries(expected.attrs)) {
      const got = await el.getAttribute(name);
      const ok = want === null ? got === null : got === String(want);
      if (!ok)
        failures.push(
          `${expected.part}${expected.key ? `[${expected.key}]` : ''} ${name}: expected ${want}, got ${got}`,
        );
    }
  }
  const focus = [...(row.expect.intents ?? [])].reverse().find((i) => i.type === 'focus');
  if (focus?.type === 'focus') {
    const active = await page.evaluate(() => document.activeElement?.id ?? null);
    if (active !== focus.ref) failures.push(`focus: expected #${focus.ref}, got #${active}`);
  }
  return failures;
}

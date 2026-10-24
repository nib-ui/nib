import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

// WCAG 2.2 A and AA, the level Nib commits to.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Fails the test on any axe violation; the message lists rule ids and the offending targets. */
export async function expectAccessible(page: Page, include?: string): Promise<void> {
  const builder = new AxeBuilder({ page }).withTags(TAGS);
  const { violations } = await (include ? builder.include(include) : builder).analyze();
  const summary = violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id} at ${n.target.join(' ')}: ${(n.failureSummary ?? '').replace(/\s+/g, ' ').trim()}`),
  );
  expect(summary, 'axe violations').toEqual([]);
}

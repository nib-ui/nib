import { expect, test } from '@playwright/test';

const PAGE = '/components/content/';
const INK = 'rgb(20, 20, 19)';
const ACCENT = 'rgb(2, 128, 108)';

test.describe('content', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(PAGE);
  });

  test('a tile is a ruled cell with 16px padding and the hover fill; the whole tile links', async ({ page }) => {
    const tile = page.getByRole('link', { name: /Kenya Nyeri/ });
    await expect(tile).toHaveCSS('padding-top', '16px');
    await tile.hover();
    await expect(tile).toHaveCSS('background-color', 'rgba(20, 20, 19, 0.05)');
    await expect(tile.locator('del')).toHaveCSS('color', 'rgb(101, 100, 94)');
  });

  test('the recommended plan gets a 2px accent top rule, not a bigger box', async ({ page }) => {
    const plan = page.locator('.nib-tile--recommended');
    await expect(plan).toHaveCSS('border-top-width', '2px');
    await expect(plan).toHaveCSS('border-top-color', ACCENT);
    // The rule's two pixels come out of the padding, so the content starts where the others' does.
    await expect(plan).toHaveCSS('padding-top', '14px');
  });

  test('a chosen row is the cursor block; flagged and new rows tint with a word', async ({ page }) => {
    const chosen = page.getByRole('option', { selected: true });
    await expect(chosen).toContainText('#1042');
    await expect(chosen).toHaveCSS('background-color', INK);
    await expect(chosen.locator('.nib-row__meta')).toHaveCSS('color', 'rgb(250, 249, 245)');
    const flagged = page.locator('.nib-row--flagged');
    await expect(flagged).not.toHaveCSS('background-color', 'rgb(241, 239, 232)');
    await expect(flagged).toContainText('Stale');
    await expect(page.locator('.nib-row--ghost')).toHaveCSS('border-top-style', 'dashed');
  });

  test('a changed pane is tinted with a 2px top rule in its hue; stats are tabular', async ({ page }) => {
    const changed = page.locator('.nib-pane--changed');
    await expect(changed).toHaveCSS('border-top-width', '2px');
    await expect(changed).toHaveCSS('border-top-color', 'rgb(122, 93, 0)');
    await expect(page.locator('.nib-stat__value').first()).toHaveCSS('font-variant-numeric', 'tabular-nums');
    const up = page.locator('[data-trend="up"]');
    expect(await up.evaluate((el) => getComputedStyle(el, '::before').content)).toMatch(/^"▲ " \/ ""$/);
  });

  test('a chosen row that is also checked stays the cursor block, its [x] in the inverted ink', async ({ page }) => {
    await page.evaluate(() => {
      const row = document.querySelector('.nib-row[aria-selected="true"]');
      row?.insertAdjacentHTML(
        'afterbegin',
        '<label class="nib-choice"><input type="checkbox" checked aria-label="x" /></label>',
      );
    });
    const chosen = page.locator('.nib-row[aria-selected="true"]');
    await expect(chosen).toHaveCSS('background-color', INK);
    expect(await chosen.locator('.nib-choice').evaluate((el) => getComputedStyle(el, '::before').color)).toBe(
      'rgb(250, 249, 245)',
    );
  });

  test('a pane keeps room for the changed rule, so a change does not shift it', async ({ page }) => {
    const [still, changed] = [page.locator('.nib-pane').first(), page.locator('.nib-pane--changed')];
    await expect(still).toHaveCSS('border-top-width', '2px');
    const [a, b] = [
      await still.locator('.nib-pane-header').boundingBox(),
      await changed.locator('.nib-pane-header').boundingBox(),
    ];
    expect(a?.y).toBe(b?.y);
  });

  test('the hero is left-aligned with one primary and one outline action', async ({ page }) => {
    const hero = page.locator('.nib-hero');
    await expect(hero.locator('.nib-text-hero')).toHaveCSS('text-align', 'start');
    await expect(hero.locator('.nib-button--primary')).toHaveCount(1);
    await expect(hero.locator('.nib-button--outline')).toHaveCount(1);
  });

  test('the table: mono header, numbers end-aligned, checked rows tinted, sort arrow', async ({ page }) => {
    const total = page.getByRole('columnheader', { name: 'Total' });
    await expect(total).toHaveCSS('text-align', 'end');
    await expect(total).toHaveCSS('text-transform', 'uppercase');
    const checked = page.getByRole('row', { name: /#1042/ });
    await expect(checked).toHaveCSS('background-color', 'rgba(20, 20, 19, 0.05)');
    const order = page.getByRole('columnheader', { name: 'Order' });
    expect(await order.evaluate((el) => getComputedStyle(el, '::after').content)).toMatch(/↓/);
    await expect(page.getByRole('status')).toContainText('1 selected');
  });
});

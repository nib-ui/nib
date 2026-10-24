import { expect, test } from '@playwright/test';

const PAGE = '/components/icons/';

test.describe('icons', () => {
  test('a mask icon is 16px, painted in the text colour, and hidden from assistive tech', async ({ page }) => {
    await page.goto(PAGE);
    const icon = page.locator('.nib-icon-copy').first();
    await expect(icon).toHaveCSS('width', '16px');
    await expect(icon).toHaveCSS('height', '16px');
    const color = await icon.evaluate((el) => getComputedStyle(el).color);
    await expect(icon).toHaveCSS('background-color', color);
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  test('prev and next flip under right-to-left; chevrons do not', async ({ page }) => {
    await page.goto(PAGE);
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    await expect(page.locator('.nib-icon-arrow-next')).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
    await expect(page.locator('.nib-icon-chevron-right')).toHaveCSS('transform', 'none');
  });

  test('in forced colours an icon is painted in CanvasText', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto(PAGE);
    const icon = page.locator('.nib-icon-copy').first();
    const text = await page
      .locator('.nib-icon-copy + span')
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    await expect(icon).toHaveCSS('background-color', text);
  });
});

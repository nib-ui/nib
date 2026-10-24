import { expect, test } from '@playwright/test';

const PAGE = '/components/page-chrome/';
const ACCENT = 'rgb(2, 128, 108)';

test.describe('page chrome', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(PAGE);
  });

  test('the header is 48px, sticky, with a 1px line under it', async ({ page }) => {
    const header = page.locator('.nib-header');
    await expect(header).toHaveCSS('position', 'sticky');
    await expect(header).toHaveCSS('border-bottom-width', '1px');
    expect((await page.locator('.nib-header__bar').boundingBox())?.height).toBe(48);
  });

  test('the current nav word is on-surface with a 2px accent underline; others are on-surface 2', async ({ page }) => {
    const nav = page.getByRole('list', { name: 'Main' });
    const shop = nav.getByRole('link', { name: 'Shop' });
    await expect(shop).toHaveCSS('border-bottom-color', ACCENT);
    await expect(shop).toHaveCSS('border-bottom-width', '2px');
    await expect(nav.getByRole('link', { name: 'Journal' })).toHaveCSS('color', 'rgb(76, 75, 69)');
    await expect(shop).toHaveCSS('text-transform', 'uppercase');
  });

  test('a narrow header folds the nav behind MENU, which opens it without JavaScript', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const nav = page.getByRole('list', { name: 'Main' });
    await expect(nav).toBeHidden();
    await page.getByRole('link', { name: 'Menu' }).click();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Journal' })).toBeVisible();
  });

  test('the current side nav item has a 2px accent rule on its inline-start edge', async ({ page }) => {
    const current = page.getByRole('navigation', { name: 'Shop' }).getByRole('link', { name: 'Single origin' });
    await expect(current).toHaveCSS('border-left-color', ACCENT);
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    await expect(current).toHaveCSS('border-right-color', ACCENT);
  });

  test('the footer has a line above, mono column heads and a meta row', async ({ page }) => {
    await expect(page.locator('.nib-footer__columns')).toHaveCSS('border-top-width', '1px');
    await expect(page.locator('.nib-footer')).toHaveCSS('border-top-width', '0px');
    await expect(page.locator('.nib-footer__head').first()).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(page.locator('.nib-footer__meta')).toHaveCSS('text-transform', 'uppercase');
  });
});

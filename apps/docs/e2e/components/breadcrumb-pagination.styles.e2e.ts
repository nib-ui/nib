import { expect, test, type Locator } from '@playwright/test';

const PAGE = '/components/breadcrumb-pagination/';
const glyph = async (el: Locator, which: '::before' | '::after') =>
  /^"([^"]*)"/.exec(await el.evaluate((node, w) => getComputedStyle(node, w).content, which))?.[1];

test.describe('breadcrumb and pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(PAGE);
  });

  test('the breadcrumb is mono meta, as typed, slashes unread, the current segment in ink', async ({ page }) => {
    const trail = page.getByRole('navigation', { name: 'Breadcrumb' });
    const shop = trail.getByRole('link', { name: 'shop' });
    await expect(shop).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(shop).toHaveCSS('text-transform', 'none');
    await expect(shop).toHaveCSS('color', 'rgb(101, 100, 94)');
    await expect(trail.getByRole('link', { name: 'coffee' })).toHaveCSS('color', 'rgb(20, 20, 19)');
    expect(await glyph(trail.locator('li').nth(1), '::before')).toBe('/');
    await expect(trail.getByRole('listitem').nth(1)).toHaveAccessibleName('');
  });

  test('pagination reads PREV · 2 / 9 · NEXT with arrows that follow the reading way', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Pagination', exact: true });
    const prev = nav.getByRole('link', { name: 'Prev', exact: true });
    await expect(prev).toHaveCSS('text-transform', 'uppercase');
    expect(await glyph(prev, '::before')).toBe('←');
    expect((await prev.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await expect(nav.getByText('Page 2 of 9')).toHaveCount(1);
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    expect(await glyph(prev, '::before')).toBe('→');
    await expect(nav.locator('.nib-pagination__status')).toHaveCSS('direction', 'ltr');
  });

  test('a missing step keeps its place, quieter and disabled', async ({ page }) => {
    const first = page.getByRole('navigation', { name: 'Pagination, first page' });
    const prev = first.locator('.nib-pagination__prev');
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    await expect(prev).toHaveCSS('color', 'rgb(101, 100, 94)');
    await expect(first.getByRole('link')).toHaveCount(1);
  });
});

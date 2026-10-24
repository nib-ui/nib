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
    // Read as three links, with no slashes.
    await expect(trail).toMatchAriaSnapshot(`
      - navigation "Breadcrumb":
        - list:
          - listitem:
            - link "home"
          - listitem:
            - link "shop"
          - listitem:
            - link "coffee"
    `);
    expect((await shop.boundingBox())?.height).toBeGreaterThanOrEqual(24);
  });

  test('pagination reads PREV · 2 / 9 · NEXT with arrows that follow the reading way', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Pagination', exact: true });
    const prev = nav.getByRole('link', { name: 'Prev', exact: true });
    const next = nav.getByRole('link', { name: 'Next', exact: true });
    await expect(prev).toHaveCSS('text-transform', 'uppercase');
    expect(await glyph(prev, '::before')).toBe('←');
    expect((await prev.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    // The short form is hidden; the words are read.
    await expect(nav).toMatchAriaSnapshot(`
      - navigation "Pagination":
        - link "Prev"
        - text: Page 2 of 9
        - link "Next"
    `);
    expect((await nav.getByText('Page 2 of 9').boundingBox())?.width).toBe(1);
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    expect(await glyph(prev, '::before')).toBe('→');
    expect(await glyph(next, '::after')).toBe('←');
    await expect(nav.locator('.nib-pagination__status')).toHaveCSS('direction', 'ltr');
  });

  test('a missing step keeps its place as a dimmed, disabled link', async ({ page, browserName }) => {
    const first = page.getByRole('navigation', { name: 'Pagination on the first page' });
    const prev = first.getByRole('link', { name: 'Prev', exact: true });
    await expect(prev).toBeDisabled();
    await expect(prev).toHaveCSS('color', 'rgb(101, 100, 94)');
    if (browserName === 'chromium') {
      await page.emulateMedia({ forcedColors: 'active' });
      await expect(prev).not.toHaveCSS(
        'color',
        await first.getByRole('link', { name: 'Next', exact: true }).evaluate((el) => getComputedStyle(el).color),
      );
    }
  });

  test('in forced colours breadcrumb links are underlined and the current one more heavily', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await page.emulateMedia({ forcedColors: 'active' });
    const trail = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(trail.getByRole('link', { name: 'shop' })).toHaveCSS('text-decoration-line', 'underline');
    await expect(trail.getByRole('link', { name: 'coffee' })).toHaveCSS('text-decoration-thickness', '2px');
  });
});

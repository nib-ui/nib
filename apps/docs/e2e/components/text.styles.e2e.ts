import { expect, test } from '@playwright/test';

const PAGE = '/components/text/';

test.describe('text', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(PAGE);
  });

  test('a link is ink with a line underline 3px below, accent text on hover', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Read the roast schedule' });
    await expect(link).toHaveCSS('color', 'rgb(20, 20, 19)');
    await expect(link).toHaveCSS('text-underline-offset', '3px');
    await link.hover();
    await expect(link).toHaveCSS('color', 'rgb(0, 117, 97)');
  });

  test('tags are mono caps in their hue; filled tags sit on the soft fill with a hue border', async ({ page }) => {
    const sale = page.locator('.nib-tag--red');
    await expect(sale).toHaveCSS('text-transform', 'uppercase');
    await expect(sale).toHaveCSS('color', 'rgb(160, 69, 69)');
    const low = page.locator('.nib-tag--filled');
    await expect(low).toHaveCSS('border-top-width', '1px');
    await expect(low).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  });

  test('a callout has a 2px hue rule and its glyph, kept out of what is read', async ({ page }) => {
    const error = page.getByRole('alert').filter({ hasText: 'declined' });
    await expect(error).toHaveCSS('border-left-width', '2px');
    await expect(error).toHaveCSS('border-left-color', 'rgb(160, 69, 69)');
    const label = error.locator('.nib-callout__label');
    expect(await label.evaluate((el) => getComputedStyle(el, '::before').content)).toMatch(/^"⚠.*" \/ ""$/);
    const note = page.locator('.nib-callout--note .nib-callout__label');
    expect(await note.evaluate((el) => getComputedStyle(el, '::before').content)).toMatch(/^"※ " \/ ""$/);
  });

  test('COPY copies the block, reads Copied ✓ and announces it', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions can be granted in Chromium only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const copy = page.getByRole('button', { name: 'Copy' });
    await copy.click();
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
    await expect(page.locator('[data-nib-live="polite"]')).toHaveText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'pnpm add @nib-ui/css "@nib-ui/js" # --save-exact',
    );
  });

  test('a code block keeps ligatures off and scrolls by keyboard', async ({ page }) => {
    const pre = page.locator('.nib-code pre');
    await expect(pre).toHaveCSS('font-variant-ligatures', 'none');
    await expect(pre).toHaveAttribute('tabindex', '0');
  });

  test('in forced colours a callout keeps its rule as a real border', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(page.locator('.nib-callout--note')).toHaveCSS('border-left-width', '2px');
    await expect(page.locator('.nib-callout--note')).toHaveCSS('border-top-width', '1px');
  });
});

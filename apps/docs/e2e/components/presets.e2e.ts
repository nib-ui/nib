import { applyCell, expectAccessible, matrix } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

// The presets page: every matrix cell, like any component page.
for (const cell of matrix()) {
  test(`presets ${cell.name}`, async ({ page, browserName }) => {
    test.skip(cell.forcedColors && browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await applyCell(page, cell);
    await page.goto('/components/presets/');
    await expectAccessible(page);
    await expect(page.getByRole('region', { name: 'Example' })).toHaveScreenshot(`${cell.name}.png`);
  });
}

// Each sample page is a whole site: both themes, Latin and right-to-left, phone and desktop, and
// forced colours. Density and Vietnamese are covered by the components the pages are made of.
const PAGES = ['docs', 'dashboard', 'blog', 'landing'];
// What each preset puts on <html>: [data-theme, data-density]; nothing means it follows the OS.
const DEFAULTS: Record<string, (string | undefined)[]> = {
  docs: [undefined, undefined],
  dashboard: ['dark', 'compact'],
  blog: ['light', undefined],
  landing: [undefined, undefined],
};
const cells = matrix().filter((c) => c.forcedColors || (c.density === 'comfortable' && c.lang !== 'vi'));

for (const preset of PAGES) {
  test(`${preset} preset sets its page defaults`, async ({ page }) => {
    await page.goto(`/presets/${preset}/`);
    const attrs = await page.locator('html').evaluate((el) => [el.dataset['theme'], el.dataset['density']]);
    expect(attrs).toEqual(DEFAULTS[preset]);
  });

  for (const cell of cells) {
    test(`${preset} preset ${cell.name}`, async ({ page, browserName }) => {
      test.skip(cell.forcedColors && browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
      await applyCell(page, cell);
      await page.goto(`/presets/${preset}/`);
      // Forced colours paint system colours, but axe reads the page's own: on a page that sets
      // data-theme="dark" it compares dark-theme text with the forced white canvas. The screenshot
      // shows what is painted.
      await expectAccessible(page, undefined, cell.forcedColors ? ['color-contrast'] : []);
      await expect(page).toHaveScreenshot(`${preset}-${cell.name}.png`);
    });
  }
}

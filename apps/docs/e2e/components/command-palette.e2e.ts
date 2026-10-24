import { applyCell, expectAccessible, matrix } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

// Every cell of the theme × density × language × viewport matrix: axe, then a screenshot of the
// live example and of the open palette. New baselines come from the Docker image: `pnpm update-snapshots`.
const PAGE = '/components/command-palette/';

for (const cell of matrix()) {
  test(`command palette ${cell.name}`, async ({ page, browserName }) => {
    test.skip(cell.forcedColors && browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await applyCell(page, cell);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PAGE);
    await expectAccessible(page);
    await expect(page.getByRole('region', { name: 'Example' })).toHaveScreenshot(`${cell.name}.png`);
    await page.getByRole('button', { name: /Commands/ }).click();
    const palette = page.getByRole('dialog', { name: 'Commands' });
    await expect(palette).toBeVisible();
    await page.keyboard.type('or');
    await expectAccessible(page);
    await expect(palette).toHaveScreenshot(`${cell.name}-open.png`);
  });
}

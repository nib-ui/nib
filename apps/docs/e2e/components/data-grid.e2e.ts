import { applyCell, expectAccessible, matrix } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

// Every cell of the theme × density × language × viewport matrix: axe, then a screenshot of the
// live example with a row checked. New baselines come from the Docker image: `pnpm update-snapshots`.
const PAGE = '/components/data-grid/';

for (const cell of matrix()) {
  test(`data grid ${cell.name}`, async ({ page, browserName }) => {
    test.skip(cell.forcedColors && browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await applyCell(page, cell);
    await page.goto(PAGE);
    await page.getByRole('gridcell', { name: 'Select' }).nth(1).click();
    await expectAccessible(page);
    await expect(page.getByRole('region', { name: 'Example' })).toHaveScreenshot(`${cell.name}.png`);
  });
}

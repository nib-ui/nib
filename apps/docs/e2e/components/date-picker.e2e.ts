import { applyCell, expectAccessible, matrix } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

// Every cell of the theme × density × language × viewport matrix: axe, then a screenshot of the
// live example, on a fixed today. New baselines come from the Docker image: `pnpm update-snapshots`.
const PAGE = '/components/date-picker/';

for (const cell of matrix()) {
  test(`date picker ${cell.name}`, async ({ page, browserName }) => {
    test.skip(cell.forcedColors && browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await page.clock.setFixedTime(new Date(2026, 9, 24, 10));
    await applyCell(page, cell);
    await page.goto(PAGE);
    await expectAccessible(page);
    await expect(page.getByRole('region', { name: 'Example' })).toHaveScreenshot(`${cell.name}.png`);
  });
}

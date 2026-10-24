import { datePickerApg } from '@nib-ui/core/date-picker/apg';
import { expect, test } from '@playwright/test';
import { runApgCase } from '../apg.ts';

for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test.describe(`date picker · ${binding}`, () => {
    datePickerApg.cases.forEach((row, index) => {
      test(row.name, async ({ page }) => {
        await page.goto(`/test/date-picker/${binding}/?case=${index}`);
        expect(await runApgCase(page, row)).toEqual([]);
      });
    });

    test('paging months announces the new month; a click chooses a day', async ({ page }) => {
      await page.goto(`/test/date-picker/${binding}/?case=0`);
      const grid = page.getByRole('grid', { name: 'October 2026' });
      await expect(grid).toBeVisible();
      await page.getByRole('button', { name: 'Previous month' }).click();
      await expect(page.getByRole('grid', { name: 'September 2026' })).toBeVisible();
      // Engines punctuate the full date differently ("Tuesday, 15 September 2026").
      const day = page.getByRole('gridcell', { name: /15 September 2026/ });
      await day.click();
      await expect(day).toHaveAttribute('aria-selected', 'true');
      await expect(day).toBeFocused();
    });
  });
}

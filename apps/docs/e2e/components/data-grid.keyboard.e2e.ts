import { dataGridApg } from '@nib-ui/core/data-grid/apg';
import { expect, test } from '@playwright/test';
import { runApgCase } from '../apg.ts';

for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test.describe(`data grid · ${binding}`, () => {
    dataGridApg.cases.forEach((row, index) => {
      test(row.name, async ({ page }) => {
        await page.goto(`/test/data-grid/${binding}/?case=${index}`);
        expect(await runApgCase(page, row)).toEqual([]);
      });
    });

    test('Enter edits a cell, Enter saves it and focus returns; a header click sorts', async ({ page }) => {
      await page.goto(`/test/data-grid/${binding}/?case=0`);
      const grid = page.getByRole('grid', { name: 'Orders' });
      await grid.getByRole('gridcell', { name: 'Decaf' }).click();
      await page.keyboard.press('Enter');
      const editor = grid.getByRole('textbox', { name: 'Item' });
      await expect(editor).toBeFocused();
      await editor.fill('Decaf Colombia');
      await page.keyboard.press('Enter');
      const cell = grid.getByRole('gridcell', { name: 'Decaf Colombia' });
      await expect(cell).toBeFocused();
      await grid.getByRole('columnheader', { name: 'Total' }).click();
      await expect(grid.getByRole('row').nth(1)).toContainText('#1041');
    });
  });
}

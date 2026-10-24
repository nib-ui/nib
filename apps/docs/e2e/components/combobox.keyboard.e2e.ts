import { comboboxApg } from '@nib-ui/core/combobox/apg';
import { expectAccessible } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';
import { runApgCase } from '../apg.ts';

for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test.describe(`combobox · ${binding}`, () => {
    comboboxApg.cases.forEach((row, index) => {
      test(row.name, async ({ page }) => {
        await page.goto(`/test/combobox/${binding}/?case=${index}`);
        expect(await runApgCase(page, row)).toEqual([]);
      });
    });

    test('typing filters ignoring diacritics, and Enter writes the choice into the field', async ({ page }) => {
      await page.goto(`/test/combobox/${binding}/?case=0`);
      const field = page.getByRole('combobox', { name: 'City' });
      await field.pressSequentially('da n');
      const list = page.getByRole('listbox');
      await expect(list).toBeVisible();
      await expect(list.getByRole('option')).toHaveText(['Đà Nẵng']);
      await expectAccessible(page);
      await page.keyboard.press('Enter');
      await expect(field).toHaveValue('Đà Nẵng');
      await expect(list).toBeHidden();
      await expect(field).toBeFocused();
    });
  });
}

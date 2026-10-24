import { commandPaletteApg } from '@nib-ui/core/command-palette/apg';
import { expect, test } from '@playwright/test';
import { runApgCase } from '../apg.ts';

for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test.describe(`command palette · ${binding}`, () => {
    commandPaletteApg.cases.forEach((row, index) => {
      test(row.name, async ({ page }) => {
        await page.goto(`/test/command-palette/${binding}/?case=${index}`);
        expect(await runApgCase(page, row)).toEqual([]);
      });
    });

    test('the shortcut opens it from anywhere; typing filters, Enter runs and closes, focus returns', async ({
      page,
    }) => {
      await page.goto(`/test/command-palette/${binding}/?case=0`);
      const trigger = page.getByRole('button', { name: /Commands/ });
      await trigger.focus();
      const field = page.getByRole('combobox');
      // A framework adds the page-wide listener after its first paint: press again until it is there.
      await expect(async () => {
        await page.keyboard.press('ControlOrMeta+k');
        await expect(field).toBeFocused({ timeout: 500 });
      }).toPass();
      await field.pressSequentially('sav');
      await expect(page.getByRole('option').filter({ visible: true })).toHaveCount(1);
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(page.getByText('Ran: save')).toBeVisible();
      await expect(trigger).toBeFocused();
      // The next opening starts afresh; Escape closes it.
      await page.keyboard.press('ControlOrMeta+k');
      await expect(field).toHaveValue('');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
    });

    test('a click runs a command; nothing matching shows the empty line', async ({ page }) => {
      await page.goto(`/test/command-palette/${binding}/?case=0`);
      await page.getByRole('button', { name: /Commands/ }).click();
      await page.getByRole('combobox').pressSequentially('zzz');
      await expect(page.getByText('No matching commands')).toBeVisible();
      await page.getByRole('combobox').fill('');
      await page.getByRole('option', { name: /New file/ }).click();
      await expect(page.getByText('Ran: new')).toBeVisible();
    });
  });
}

import { menuApg } from '@nib-ui/core/menu/apg';
import { expect, test } from '@playwright/test';
import { runApgCase } from '../apg.ts';

// Every row of the menu APG table, through each binding, with real keys in a real browser.
for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test.describe(`menu · ${binding}`, () => {
    menuApg.cases.forEach((row, index) => {
      test(row.name, async ({ page }) => {
        await page.goto(`/test/menu/${binding}/?case=${index}`);
        expect(await runApgCase(page, row)).toEqual([]);
      });
    });

    test('ArrowDown on the button opens the menu on the first item; Escape closes it back to the button', async ({
      page,
    }) => {
      await page.goto(`/test/menu/${binding}/?case=0`);
      const button = page.getByRole('button', { name: 'Edit' });
      await button.focus();
      await page.keyboard.press('ArrowDown');
      const menu = page.getByRole('menu');
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute('aria-activedescendant', 'mn-item-copy');
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(button).toBeFocused();
    });
  });
}

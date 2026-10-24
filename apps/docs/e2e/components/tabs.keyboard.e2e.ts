import { tabsApg } from '@nib-ui/core/tabs/apg';
import { expect, test } from '@playwright/test';
import { runApgCase } from '../apg.ts';

// Every row of the tabs APG table, through each binding, with real keys in a real browser.
for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test.describe(`tabs · ${binding}`, () => {
    tabsApg.cases.forEach((row, index) => {
      test(row.name, async ({ page }) => {
        await page.goto(`/test/tabs/${binding}/?case=${index}`);
        expect(await runApgCase(page, row)).toEqual([]);
      });
    });
  });
}

test('manual tabs select with Enter after the arrows moved focus', async ({ page }) => {
  await page.goto('/components/tabs/');
  const tablist = page.getByRole('tablist', { name: 'Grind settings' });
  await tablist.getByRole('tab', { name: 'Fine' }).focus();
  await page.keyboard.press('ArrowDown');
  const medium = tablist.getByRole('tab', { name: 'Medium' });
  await expect(medium).toBeFocused();
  await expect(medium).toHaveAttribute('aria-selected', 'false');
  await page.keyboard.press('Enter');
  await expect(medium).toHaveAttribute('aria-selected', 'true');
});

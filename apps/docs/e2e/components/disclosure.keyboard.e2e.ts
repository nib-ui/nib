import { disclosureApg } from '@nib-ui/core/disclosure/apg';
import { expect, test } from '@playwright/test';
import { runApgCase } from '../apg.ts';

// Every row of the accordion APG table, through each binding, with real keys in a real browser.
for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test.describe(`accordion · ${binding}`, () => {
    disclosureApg.cases.forEach((row, index) => {
      test(row.name, async ({ page }) => {
        await page.goto(`/test/disclosure/${binding}/?case=${index}`);
        expect(await runApgCase(page, row)).toEqual([]);
      });
    });
  });
}

test('the docs disclosure shows its panel with Enter and Space, and says so', async ({ page }) => {
  await page.goto('/components/disclosure/');
  const button = page.getByRole('button', { name: 'Shipping and returns' });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.getByRole('region', { name: 'Example' }).getByText('Orders ship the day after roasting.'),
  ).toBeVisible();
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});

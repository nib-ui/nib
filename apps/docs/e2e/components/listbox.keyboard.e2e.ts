import { listboxApg } from '@nib-ui/core/listbox/apg';
import { expect, test } from '@playwright/test';
import { runApgCase } from '../apg.ts';

// Every row of the listbox APG table, through each binding, with real keys in a real browser.
for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test.describe(`listbox · ${binding}`, () => {
    listboxApg.cases.forEach((row, index) => {
      test(row.name, async ({ page }) => {
        await page.goto(`/test/listbox/${binding}/?case=${index}`);
        expect(await runApgCase(page, row)).toEqual([]);
      });
    });
  });
}

test('the docs example announces a change of value with nib:change', async ({ page }) => {
  await page.goto('/components/listbox/');
  const list = page.getByRole('listbox', { name: 'LANGUAGE' });
  // Listen before any key, then read what arrived.
  await list.evaluate((el) =>
    el.addEventListener(
      'nib:change',
      (e) => ((window as unknown as { seen: unknown }).seen = (e as CustomEvent).detail),
    ),
  );
  await list.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => (window as unknown as { seen: unknown }).seen)).toEqual({ value: 'en' });
});

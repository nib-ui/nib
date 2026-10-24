import { tooltipApg } from '@nib-ui/core/tooltip/apg';
import { expect, test } from '@playwright/test';
import { runApgCase } from '../apg.ts';

for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test.describe(`tooltip · ${binding}`, () => {
    tooltipApg.cases.forEach((row) => {
      test(row.name, async ({ page }) => {
        await page.goto(`/test/tooltip/${binding}/`);
        expect(await runApgCase(page, row)).toEqual([]);
      });
    });

    test('hover shows it above the trigger after the delay; leaving hides it', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/test/tooltip/${binding}/`);
      const trigger = page.getByRole('button', { name: 'Copy' });
      await expect(trigger).toHaveAccessibleDescription('Copies the order id');
      // Headless pointers start nowhere: a first move gives the browser a position to leave from.
      await page.mouse.move(400, 400);
      await trigger.hover();
      const tip = page.getByRole('tooltip');
      await expect(tip).toBeVisible();
      await expect(tip).toHaveAttribute('data-side', /top|bottom/);
      await page.mouse.move(400, 400, { steps: 5 });
      await expect(tip).toBeHidden();
    });
  });
}

import { expectAccessible } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test(`toaster · ${binding}: a toast shows, is announced, and its buttons close it`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/test/toaster/${binding}/`);
    await page.getByRole('button', { name: 'Notify' }).click();
    const region = page.getByRole('region', { name: 'Notifications' });
    await expect(region.getByText('Added to cart')).toBeVisible();
    await expect(page.locator('[data-nib-live="polite"]')).toHaveText('Added to cart. Kenya Nyeri ×2');
    await expectAccessible(page);
    await region.getByRole('button', { name: 'Undo' }).click();
    await expect(region.getByText('Added to cart')).toHaveCount(0);
    await page.getByRole('button', { name: 'Notify' }).click();
    await region.getByRole('button', { name: 'Close' }).click();
    await expect(region.getByText('Added to cart')).toHaveCount(0);
  });

  test(`toaster · ${binding}: a toast waits while the pointer is on it`, async ({ page }) => {
    await page.clock.install();
    await page.goto(`/test/toaster/${binding}/`);
    await page.getByRole('button', { name: 'Notify' }).click();
    const region = page.getByRole('region', { name: 'Notifications' });
    await region.getByText('Added to cart').hover();
    await page.clock.runFor(8000);
    await expect(region.getByText('Added to cart')).toBeVisible();
    await page.mouse.move(5, 5, { steps: 5 });
    await page.clock.runFor(5100);
    await expect(region.getByText('Added to cart')).toHaveCount(0);
  });
}

test('a toast in the corner looks right', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/test/toaster/js/');
  await page.getByRole('button', { name: 'Notify' }).click();
  await expect(page.locator('.nib-toast')).toHaveScreenshot('toast.png');
});

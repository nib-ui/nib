import { expectAccessible } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test(`dialog · ${binding}: opens modally named by its title, keeps Tab inside, Escape returns focus`, async ({
    page,
  }) => {
    await page.goto(`/test/dialog/${binding}/`);
    const trigger = page.getByRole('button', { name: 'Archive' }).first();
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Archive order #1042?' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription('You can restore it from the archive later.');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // The page behind is inert: Tab cycles the dialog (and the browser's own toolbar), never the page.
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      const where = await dialog.evaluate((el) =>
        el.contains(document.activeElement) ? 'dialog' : document.activeElement === document.body ? 'body' : 'page',
      );
      expect(where).not.toBe('page');
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
}

test('the open dialog looks right and has no axe violations', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/test/dialog/js/');
  await page.getByRole('button', { name: 'Archive' }).first().click();
  await expectAccessible(page);
  await expect(page).toHaveScreenshot('dialog-open.png');
});

test('on a phone the dialog is a bottom sheet', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 360, height: 700 });
  await page.goto('/test/dialog/js/');
  await page.getByRole('button', { name: 'Archive' }).first().click();
  const box = await page.getByRole('dialog').boundingBox();
  expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(700);
  expect(Math.round(box?.width ?? 0)).toBe(360);
});

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

test('type-to-confirm deletes only on the exact name, and starts empty when opened again', async ({ page }) => {
  await page.goto('/components/dialog/');
  await page.getByRole('button', { name: 'Delete project' }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete beans-prod?' });
  const field = dialog.getByRole('textbox');
  await expect(field).toBeFocused();
  const remove = dialog.getByRole('button', { name: 'Delete project' });
  // Playwright will not click an aria-disabled button; a user can, so the click is sent as is.
  await remove.dispatchEvent('click');
  await expect(dialog).toBeVisible();
  await field.fill('beans-prod');
  await expect(remove).toHaveAttribute('aria-disabled', 'false');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Delete project' }).click();
  await expect(field).toHaveValue('');
  await expect(remove).toHaveAttribute('aria-disabled', 'true');
});

for (const [name, setup] of [
  ['dark right-to-left drawer', { colorScheme: 'dark' as const, dir: 'rtl' }],
  ['forced colours drawer', { forcedColors: 'active' as const, dir: 'ltr' }],
] as const) {
  test(`the open ${name} looks right`, async ({ page, browserName }) => {
    test.skip(
      'forcedColors' in setup && browserName !== 'chromium',
      'Playwright emulates forced colours in Chromium only',
    );
    const { dir, ...media } = setup;
    await page.emulateMedia({ ...media, reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/components/dialog/');
    await page.evaluate((d) => document.documentElement.setAttribute('dir', d), dir);
    await page.getByRole('button', { name: 'Filters' }).click();
    await expectAccessible(page);
    await expect(page.getByRole('dialog')).toHaveScreenshot(`drawer-${name.replace(/ /g, '-')}.png`);
  });
}

test('the page behind an open modal does not scroll', async ({ page }) => {
  await page.goto('/components/dialog/');
  await page.getByRole('button', { name: 'Archive order' }).click();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
});

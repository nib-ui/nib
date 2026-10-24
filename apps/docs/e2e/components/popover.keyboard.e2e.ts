import { expect, test } from '@playwright/test';

// The popover's keys are the browser's own (native popover); each binding must wire it the same way.
for (const binding of ['js', 'react', 'vue', 'svelte']) {
  test(`popover · ${binding}: opens below its trigger, Escape closes it and focus goes back`, async ({ page }) => {
    // Still, so the 4px reveal does not move the box while it is measured.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/test/popover/${binding}/`);
    const trigger = page.getByRole('button', { name: 'Filters' });
    const content = page.locator('#pp-content');
    await trigger.click();
    await expect(content).toBeVisible();
    await expect(content).toHaveAttribute('data-side', 'bottom');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const [t, c] = [await trigger.boundingBox(), await content.boundingBox()];
    // 4px below the trigger, to within a pixel of sub-pixel layout.
    expect(Math.abs((c?.y ?? 0) - ((t?.y ?? 0) + (t?.height ?? 0) + 4))).toBeLessThanOrEqual(1);
    await content.getByRole('button', { name: 'Apply' }).focus();
    await page.keyboard.press('Escape');
    await expect(content).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test(`popover · ${binding}: a click outside closes it`, async ({ page }) => {
    await page.goto(`/test/popover/${binding}/`);
    await page.getByRole('button', { name: 'Filters' }).click();
    await expect(page.locator('#pp-content')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.locator('#pp-content')).toBeHidden();
  });
}

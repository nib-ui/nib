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

  test(`popover · ${binding}: in right-to-left it lines up with the trigger's right edge`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/test/popover/${binding}/`);
    // Away from the edge, so the viewport padding does not shift the box (once the island mounted).
    await page.getByRole('button', { name: 'Filters' }).waitFor();
    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
      document.querySelector<HTMLElement>('.fixture-popover')?.style.setProperty('margin-inline', '200px');
    });
    const trigger = page.getByRole('button', { name: 'Filters' });
    await trigger.click();
    const content = page.locator('#pp-content');
    await expect(content).toHaveAttribute('data-side', 'bottom');
    const [t, c] = [await trigger.boundingBox(), await content.boundingBox()];
    const right = (b: typeof t) => (b?.x ?? 0) + (b?.width ?? 0);
    expect(Math.abs(right(c) - right(t))).toBeLessThanOrEqual(1);
  });
}

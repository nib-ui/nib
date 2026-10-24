import { expectAccessible } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

const TEMPLATE = '/guides/component-page/';

test.describe('docs shell', () => {
  test('SKIP TO CONTENT is the first stop and moves focus to the main region', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'SKIP TO CONTENT' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('follows the OS theme until the toggle picks one, and remembers it', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).not.toHaveAttribute('data-theme');
    const toggle = page.getByRole('button', { name: /LIGHT/ });
    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('button', { name: /DARK/ })).toBeVisible();
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
    // The printed hotkey works too.
    await page.keyboard.press('t');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('the component page template has a live example, code tabs and an Accessibility section', async ({ page }) => {
    await page.goto(TEMPLATE);
    await expect(page.getByRole('region', { name: 'Example' })).toBeVisible();
    const tabs = page.getByRole('tablist', { name: 'Code' }).getByRole('tab');
    await expect(tabs).toHaveText(['HTML', 'REACT', 'VUE', 'SVELTE']);
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('@nib-ui/react');
    await page.keyboard.press('End');
    await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'Accessibility', level: 2 })).toBeVisible();
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`has no axe violations in the ${theme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      for (const path of ['/', TEMPLATE]) {
        await page.goto(path);
        await expectAccessible(page);
      }
    });
  }
});

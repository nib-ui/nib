import { expectAccessible } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

const PAGE = '/play/';

test.describe('proof press', () => {
  test('starts from the shipped tokens with every pair passing', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.getByRole('status')).toHaveText('Every pair passes');
    await expect(page.locator('.press__css')).toContainText('--nib-accent: light-dark(#02806c, #00967d);');
  });

  test('a token change updates the components at once and lists the failing pair', async ({ page }) => {
    await page.goto(PAGE);
    await page.getByLabel('Accent text · light').fill('#9fe8d8');
    await expect(page.getByRole('status')).toHaveText(/pairs? fail/);
    await expect(page.locator('.press__mark--error').first()).toContainText(
      /accent-text on paper.* is \d\.\d:1, needs 4\.5:1/,
    );
    const preview = page.getByRole('region', { name: 'Preview' });
    await expect(preview.locator('.nib-tag--accent').first()).toHaveCSS('color', 'rgb(159, 232, 216)');
    await expect(page.locator('.press__css')).toContainText('#9fe8d8');
  });

  test('theme, density and the error hue apply to the preview', async ({ page }) => {
    await page.goto(PAGE);
    const preview = page.getByRole('region', { name: 'Preview' });
    await page.getByLabel('Dark (Ink)').check();
    await page.getByLabel('Compact').check();
    await expect(preview).toHaveAttribute('data-theme', 'dark');
    await expect(preview).toHaveAttribute('data-density', 'compact');
    await page.getByLabel('Error hue').selectOption('magenta');
    await expect(page.locator('.press__css')).toContainText('--nib-error: var(--nib-magenta);');
  });

  test('has no axe violations', async ({ page }) => {
    await page.goto(PAGE);
    await expectAccessible(page);
  });
});

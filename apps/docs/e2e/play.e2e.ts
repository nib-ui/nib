import { expectAccessible } from '@nib-ui/test-harness';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const tokens = JSON.parse(
  readFileSync(new URL('../../../packages/tokens/dist/tokens.json', import.meta.url), 'utf8'),
) as { color: Record<'light' | 'dark', Record<string, string>> };
const { light, dark } = tokens.color;

const PAGE = '/play/';

test.describe('proof press', () => {
  test('starts from the shipped tokens with every pair passing', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.getByRole('status')).toHaveText(/^Every pair passes/);
    await expect(page.locator('.press__css')).toContainText(
      `--nib-accent: light-dark(${light['accent']}, ${dark['accent']});`,
    );
  });

  test('a token change updates the components at once and lists the failing pair', async ({ page }) => {
    await page.goto(PAGE);
    await page.getByLabel('Accent text · light').fill('#9fe8d8');
    await expect(page.getByRole('status')).toHaveText(/^\d+ pairs? fails?/);
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
    // Every error state follows the role, not the red hue.
    const magenta = await preview
      .locator('.nib-tag--accent')
      .first()
      .evaluate((el) => {
        const probe = el.ownerDocument.createElement('span');
        probe.style.color = 'var(--nib-magenta)';
        el.append(probe);
        const c = getComputedStyle(probe).color;
        probe.remove();
        return c;
      });
    await expect(preview.locator('.nib-field__error')).toHaveCSS('color', magenta);
    await expect(preview.locator('.nib-callout--error')).toHaveCSS('border-left-color', magenta);
  });

  test('a dark pair that fails is marked for the dark theme, and reset puts everything back', async ({ page }) => {
    await page.goto(PAGE);
    await page.getByLabel('Accent text · dark').fill('#103030');
    await expect(page.locator('.press__mark--error').first()).toContainText(/^dark · /);
    await expectAccessible(page);
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByLabel('Accent text · dark')).toHaveValue(dark['accent-text'] ?? '');
    await expect(page.getByRole('status')).toHaveText(/^Every pair passes/);
  });

  test('has no axe violations', async ({ page }) => {
    await page.goto(PAGE);
    await expectAccessible(page);
  });
});

import { readdirSync } from 'node:fs';
import { expectAccessible } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

// Every guide in the build, from the source folder; the component-page template is not one.
const GUIDES = readdirSync(new URL('../src/pages/guides/', import.meta.url))
  .filter((f) => f.endsWith('.astro') && f !== 'component-page.astro')
  .map((f) => `/guides/${f.replace('.astro', '')}/`);

test.describe('guides', () => {
  for (const path of [...GUIDES, '/']) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${path} passes axe in the ${theme} theme`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(path);
        await expectAccessible(page);
      });
    }
  }

  test('every guide is in the side navigation, and the header marks the Guides section', async ({ page }) => {
    await page.goto(GUIDES[0] ?? '/');
    const side = page.getByRole('navigation', { name: 'Docs' });
    for (const path of GUIDES) await expect(side.locator(`a[href="${path}"]`)).toHaveCount(1);
    const guides = page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Guides' });
    await page.goto('/guides/react/');
    await expect(guides).toHaveAttribute('aria-current', 'true');
    await page.goto('/guides/install/');
    await expect(guides).toHaveAttribute('aria-current', 'page');
  });

  test('the components index lists components only', async ({ page }) => {
    await page.goto('/components/');
    await expect(page.getByRole('main').locator('a[href^="/guides/"]')).toHaveCount(0);
  });
});

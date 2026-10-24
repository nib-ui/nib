import { readdirSync } from 'node:fs';
import { expectAccessible } from '@nib-ui/test-harness';
import { expect, test } from '@playwright/test';

// Every component page in the build, from the source folder.
const PAGES = readdirSync(new URL('../src/pages/components/', import.meta.url))
  .filter((f) => f.endsWith('.astro') && f !== 'index.astro')
  .map((f) => `/components/${f.replace('.astro', '')}/`);

test.describe('docs navigation', () => {
  test('every component page is in the side navigation and the index, and the current one is marked', async ({
    page,
  }) => {
    await page.goto('/components/');
    const side = page.getByRole('navigation', { name: 'Docs' });
    for (const path of PAGES) {
      await expect(side.locator(`a[href="${path}"]`)).toHaveCount(1);
      await expect(page.getByRole('main').locator(`a[href="${path}"]`)).toHaveCount(1);
    }
    await page.goto(PAGES[0] ?? '/');
    await expect(side.locator(`a[href="${PAGES[0]}"]`)).toHaveAttribute('aria-current', 'page');
    // On a page inside the section, the section link says "current section", not "current page".
    await expect(
      page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Components' }),
    ).toHaveAttribute('aria-current', 'true');
  });

  test('"On this page" lists the h2 headings and marks the one being read', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto('/components/base/');
    const outline = page.getByRole('navigation', { name: 'On this page' });
    await expect(outline.getByRole('link')).toHaveText(['Usage', 'Accessibility']);
    await expect(outline.getByRole('link', { name: 'Usage' })).toHaveAttribute('aria-current', 'location');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect(outline.getByRole('link', { name: 'Accessibility' })).toHaveAttribute('aria-current', 'location');
    await expect(outline.getByRole('link', { name: 'Usage' })).not.toHaveAttribute('aria-current');
  });

  test('the density toggle switches compact and comfortable and remembers it', async ({ page }) => {
    await page.goto('/components/base/');
    const html = page.locator('html');
    await page.getByRole('button', { name: 'Switch to compact density' }).click();
    await expect(html).toHaveAttribute('data-density', 'compact');
    await page.reload();
    await expect(html).toHaveAttribute('data-density', 'compact');
    await expect(page.getByRole('button', { name: 'Switch to comfortable density' })).toBeVisible();
  });

  test('on a phone the page takes the full width, the contents fold above it, and nothing scrolls sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/components/base/');
    const side = page.getByRole('navigation', { name: 'Docs' });
    await expect(side).toBeHidden();
    const main = await page.getByRole('main').boundingBox();
    const column = await page.locator('.docs-side').boundingBox();
    expect(main?.width).toBeGreaterThan(300);
    expect(column?.y ?? 0).toBeLessThan(main?.y ?? 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    await page.locator('.docs-contents > summary').click();
    await expect(side).toBeVisible();
    // Widening the window brings the navigation back beside the page.
    await page.locator('.docs-contents > summary').click();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(side).toBeVisible();
  });

  for (const width of [360, 1280]) {
    test(`the shell at ${width}px looks right`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/components/base/');
      await expect(page).toHaveScreenshot(`shell-${width}.png`);
    });
  }

  for (const theme of ['light', 'dark'] as const) {
    test(`the shell pages have no axe violations in the ${theme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      for (const path of ['/', '/components/', '/components/base/']) {
        await page.goto(path);
        await expectAccessible(page);
      }
    });
  }

  test('the component index looks right', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components/');
    await expect(page.getByRole('main')).toHaveScreenshot('component-index.png');
  });
});

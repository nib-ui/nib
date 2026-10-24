import { expect, test } from '@playwright/test';

const PAGE = '/components/utilities/';

test.describe('utilities', () => {
  test('lists every utility, grouped', async ({ page }) => {
    await page.goto(PAGE);
    for (const group of ['layout', 'spacing', 'typography', 'colour']) {
      await expect(page.getByRole('region', { name: `${group} utilities` }).getByRole('row')).not.toHaveCount(0);
    }
    await expect(page.getByRole('cell', { name: 'nib-gap-md', exact: true })).toBeVisible();
  });

  test('utilities apply, and the layout ones follow their container', async ({ page }) => {
    await page.goto(PAGE);
    const grid = page.getByRole('region', { name: 'Example' }).getByRole('list');
    await expect(grid).toHaveCSS('row-gap', '8px');
    await expect(grid).toHaveCSS('grid-template-columns', /^\S+ \S+ \S+$/);
    await page.setViewportSize({ width: 360, height: 800 });
    await expect(grid).toHaveCSS('grid-template-columns', /^\S+$/);
  });
});

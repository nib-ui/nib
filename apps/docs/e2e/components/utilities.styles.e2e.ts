import { expect, test } from '@playwright/test';

const PAGE = '/components/utilities/';

test.describe('utilities', () => {
  test('lists every utility, grouped', async ({ page }) => {
    await page.goto(PAGE);
    for (const group of ['Layout', 'Spacing', 'Typography', 'Colour', 'Container variants']) {
      await expect(page.getByRole('region', { name: `${group} utilities` }).getByRole('row')).not.toHaveCount(0);
    }
    await expect(page.getByRole('cell', { name: 'nib-gap-md', exact: true })).toBeVisible();
  });

  test('layout variants follow the nearest nib-cq container, not the viewport or another container', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const grid = page.getByRole('region', { name: 'Example' }).getByRole('list');
    await expect(grid).toHaveCSS('row-gap', '8px');
    const cq = page.locator('.nib-cq').first();
    const columns = () => grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    // A wide viewport throughout: only the container's width may decide.
    await cq.evaluate((el) => (el.style.inlineSize = '600px'));
    expect(await columns()).toBe(3);
    await cq.evaluate((el) => (el.style.inlineSize = '300px'));
    expect(await columns()).toBe(1);
    // An unnamed container in between must not answer the query.
    await cq.evaluate((el) => {
      el.style.inlineSize = '600px';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'container-type: inline-size; inline-size: 300px';
      el.replaceChildren(wrap);
      wrap.innerHTML = '<ul class="nib-display-grid nib-columns-1 nib-at-sm-columns-3" id="inner"></ul>';
    });
    expect(
      await page.locator('#inner').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length),
    ).toBe(3);
  });
});

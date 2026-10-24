import { expect, test, type Page } from '@playwright/test';

// The base rules from spec/DESIGN.md, read from computed styles on the docs page.
const PAGE = '/components/base/';
const INK = 'rgb(20, 20, 19)';
const PAPER = 'rgb(250, 249, 245)';
const ACCENT = 'rgb(2, 128, 108)';

const add = (page: Page, html: string) =>
  page.evaluate((markup) => document.querySelector('main')?.insertAdjacentHTML('beforeend', markup), html);

test.describe('base', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(PAGE);
  });

  test('type roles: sans headlines in sentence case, mono labels in caps', async ({ page }) => {
    const title = page.getByRole('heading', { level: 1 });
    await expect(title).toHaveCSS('font-size', '32px');
    await expect(title).toHaveCSS('font-weight', '500');
    const kicker = page.locator('.nib-kicker').first();
    await expect(kicker).toHaveCSS('text-transform', 'uppercase');
    await expect(kicker).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(kicker).toHaveCSS('font-variant-ligatures', 'none');
    await expect(page.locator('.nib-num').first()).toHaveCSS('font-variant-numeric', 'tabular-nums');
  });

  test('scripts without case turn caps and tracking off; a cased language inside turns them back on', async ({
    page,
  }) => {
    await add(
      page,
      '<div lang="ja"><p class="nib-kicker" id="ja">ジャーナル</p><p lang="en" class="nib-kicker" id="en">x</p></div>',
    );
    await expect(page.locator('#ja')).toHaveCSS('text-transform', 'none');
    expect(await page.locator('#ja').evaluate((el) => parseFloat(getComputedStyle(el).letterSpacing) || 0)).toBe(0);
    await expect(page.locator('#en')).toHaveCSS('text-transform', 'uppercase');
  });

  test('prose sits at the 68ch reading width with line-coloured underlines', async ({ page }) => {
    const prose = page.locator('.nib-prose').first();
    const width = await prose.evaluate((el) => {
      const probe = el.appendChild(document.createElement('span'));
      probe.style.cssText = 'display:inline-block;inline-size:68ch';
      const w = probe.getBoundingClientRect().width;
      probe.remove();
      return [w, parseFloat(getComputedStyle(el).maxWidth)];
    });
    expect(width[1]).toBeCloseTo(width[0] ?? 0, 0);
    await expect(prose.locator('a')).toHaveCSS('text-underline-offset', '3px');
  });

  test('the ruled grid paints each 1px rule once and leaves no ground in a short last row', async ({ page }) => {
    const grid = page.locator('.nib-grid').first();
    await expect(grid).toHaveCSS('column-gap', 'normal');
    await expect(grid).toHaveCSS('border-top-width', '1px');
    await expect(grid).toHaveCSS('border-left-width', '1px');
    await expect(grid).toHaveCSS('border-right-width', '0px');
    await expect(grid).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    const cell = grid.locator('> *').first();
    await expect(cell).toHaveCSS('border-right-width', '1px');
    await expect(cell).toHaveCSS('border-bottom-width', '1px');
    await expect(cell).toHaveCSS('border-left-width', '0px');
    // Right to left, the rules move to the mirrored edges.
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    await expect(grid).toHaveCSS('border-right-width', '1px');
    await expect(cell).toHaveCSS('border-left-width', '1px');
  });

  test('the side column sits beside the main column, and wraps above it when space runs out', async ({ page }) => {
    const side = page.locator('.nib-with-side > *').first();
    const main = page.locator('.nib-with-side__main').first();
    const [s, m] = [await side.boundingBox(), await main.boundingBox()];
    expect(s?.y).toBe(m?.y);
    await page.setViewportSize({ width: 360, height: 800 });
    const [s2, m2] = [await side.boundingBox(), await main.boundingBox()];
    expect((s2?.y ?? 0) < (m2?.y ?? 0)).toBe(true);
  });

  test('focus is one square 2px accent ring, 2px away', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveCSS('outline-width', '2px');
    await expect(skip).toHaveCSS('outline-offset', '2px');
    await expect(skip).toHaveCSS('outline-color', ACCENT);
  });

  test('a region can switch theme and density on its own', async ({ page }) => {
    await add(page, '<div data-theme="dark" data-density="compact" id="region">x</div>');
    const region = page.locator('#region');
    await expect(region).toHaveCSS('background-color', INK);
    await expect(region).toHaveCSS('color', PAPER);
    expect(await region.evaluate((el) => getComputedStyle(el).getPropertyValue('--nib-density-cell-padding'))).toBe(
      '12px',
    );
  });

  test('forced colours keep the grid rules and give focus a CanvasText ring', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(page.locator('.nib-grid > *').first()).toHaveCSS('border-bottom-style', 'solid');
    await page.keyboard.press('Tab');
    const canvasText = await page.evaluate(() => {
      const probe = document.body.appendChild(document.createElement('span'));
      probe.style.color = 'CanvasText';
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    });
    await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveCSS('outline-color', canvasText);
  });
});

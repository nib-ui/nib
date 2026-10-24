import { expect, test, type Locator } from '@playwright/test';

// The form rules from spec/DESIGN.md (Forms), read from computed styles on the docs example.
const PAGE = '/components/forms/';
const pseudo = (el: Locator, which: '::before' | '::after', prop: string) =>
  el.evaluate((node, [w, p]) => getComputedStyle(node, w).getPropertyValue(p ?? ''), [which, prop]);
// The glyph itself, whatever way an engine serialises `content: "x" / ""`.
const glyph = async (el: Locator, which: '::before' | '::after' = '::before') =>
  /^"([^"]*)"/.exec(await pseudo(el, which, 'content'))?.[1];

test.describe('forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(PAGE);
  });

  test('an input is a raised, square, 36px field with a 1px line border and mono text', async ({ page }) => {
    const company = page.getByRole('textbox', { name: 'Company' });
    await expect(company).toHaveCSS('min-height', '36px');
    await expect(company).toHaveCSS('border-top-width', '1px');
    await expect(company).toHaveCSS('border-top-left-radius', '0px');
    await expect(company).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(company).toHaveCSS('background-color', 'rgb(241, 239, 232)');
  });

  test('an invalid field has a red border and a red mono error with a warning glyph', async ({ page }) => {
    const email = page.getByRole('textbox', { name: 'Email' });
    await expect(email).toHaveCSS('border-top-color', 'rgb(160, 69, 69)');
    await expect(email).toHaveAccessibleDescription('Enter a valid email');
    const error = page.locator('#f-email-error');
    await expect(error).toHaveCSS('text-transform', 'uppercase');
    expect(await glyph(error)).toMatch(/^⚠/);
  });

  test('labels are mono caps; only optional fields are marked', async ({ page }) => {
    const label = page.locator('label[for="f-email"]');
    await expect(label).toHaveCSS('text-transform', 'uppercase');
    await expect(label).toHaveCSS('font-family', /JetBrains Mono/);
    await expect(page.locator('.nib-field__optional')).toHaveCount(1);
  });

  test('checkboxes and radios print [x] and (•) with empty alt text; the whole row toggles', async ({ page }) => {
    const row = page.locator('.nib-choice', { hasText: 'New roasts' });
    const box = page.getByRole('checkbox', { name: 'New roasts' });
    expect(await glyph(row)).toBe('[ ]');
    await row.getByText('New roasts').click();
    await expect(box).toBeChecked();
    expect(await glyph(row)).toBe('[x]');
    await page.keyboard.press('Space');
    await expect(box).not.toBeChecked();
    const radio = page.locator('.nib-choice', { hasText: 'Standard' });
    expect(await glyph(radio)).toBe('(•)');
    // The glyphs stay out of the accessible name.
    await expect(box).toHaveAccessibleName('New roasts');
  });

  test('a switch prints ON in weight 500 and OFF in weight 400, and reads as a switch', async ({ page }) => {
    const sw = page.getByRole('switch', { name: 'Dark roast only' });
    const row = page.locator('.nib-switch');
    expect(await glyph(row, '::after')).toBe('ON');
    expect(await pseudo(row, '::after', 'font-weight')).toBe('500');
    await sw.click();
    await expect(sw).not.toBeChecked();
    expect(await glyph(row, '::after')).toBe('OFF');
    expect(await pseudo(row, '::after', 'font-weight')).toBe('400');
  });

  test('focus rings the whole row of a choice or switch: 2px accent, 2px away', async ({ page }) => {
    const box = page.getByRole('checkbox', { name: 'Order status' });
    await box.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(box).toBeFocused();
    await expect(box).toHaveCSS('outline-width', '2px');
    await expect(box).toHaveCSS('outline-offset', '2px');
    const [input, row] = [
      await box.boundingBox(),
      await page.locator('.nib-choice', { hasText: 'Order status' }).boundingBox(),
    ];
    expect(input?.width).toBe(row?.width);
  });

  test('a link in a choice label opens the link instead of toggling', async ({ page }) => {
    const terms = page.getByRole('checkbox', { name: /I accept the terms/ });
    await page.evaluate(() => {
      const row = document.querySelector('#f-terms')?.parentElement;
      row?.append(' (', Object.assign(document.createElement('a'), { href: '#terms', textContent: 'read them' }), ')');
    });
    await page.getByRole('link', { name: 'read them' }).click();
    await expect(page).toHaveURL(/#terms$/);
    await expect(terms).not.toBeChecked();
  });

  test('a radio group with nothing chosen shows every option the same way', async ({ page }) => {
    await page.evaluate(() => {
      for (const r of document.querySelectorAll<HTMLInputElement>('input[name="delivery"]')) r.checked = false;
    });
    const [a, b] = ['Standard', 'Express'].map((t) => page.locator('.nib-choice', { hasText: t }));
    expect(await pseudo(a!, '::before', 'color')).toBe(await pseudo(b!, '::before', 'color'));
  });

  test('the error summary is an alert linking to each field', async ({ page }) => {
    const summary = page.getByRole('alert');
    await expect(summary).toHaveCSS('border-left-width', '2px');
    await summary.getByRole('link', { name: 'Enter a valid email' }).click();
    await expect(page).toHaveURL(/#f-email$/);
  });

  test('type-to-confirm enables delete only on the exact name', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /to delete it/ });
    const button = page.getByRole('button', { name: 'Delete beans-prod' });
    await expect(button).toBeDisabled();
    await input.fill('beans');
    await expect(button).toBeDisabled();
    await input.fill('beans-prod');
    await expect(button).toBeEnabled();
    // The name in the label is shown as typed, not in caps.
    await expect(page.locator('label[for="f-confirm"] code')).toHaveCSS('text-transform', 'none');
  });

  test('in forced colours an invalid field gets a 2px border', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveCSS('border-top-width', '2px');
  });
});

test('on touch screens rows and fields are at least 44px tall', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(PAGE);
  for (const el of [page.locator('.nib-choice').first(), page.locator('.nib-switch'), page.locator('#f-company')]) {
    expect((await el.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  await context.close();
});

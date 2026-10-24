import { expect, test, type Locator } from '@playwright/test';

// The listbox rules from spec/DESIGN.md, read from computed styles on the docs example.
const PAGE = '/components/listbox/';
const style = (el: Locator, prop: string) => el.evaluate((node, p) => getComputedStyle(node).getPropertyValue(p), prop);
const INK = 'rgb(20, 20, 19)';
const ACCENT = 'rgb(2, 128, 108)';

test.describe('listbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(PAGE);
  });

  test('sits on the overlay surface with a 1px line border, options as item text', async ({ page }) => {
    const list = page.getByRole('listbox', { name: 'LANGUAGE' });
    expect(await style(list, 'background-color')).toBe('rgb(236, 233, 224)');
    expect(await style(list, 'border-top-width')).toBe('1px');
    expect(await style(list, 'border-top-left-radius')).toBe('0px');
    const option = page.getByRole('option', { name: 'English' });
    expect(await style(option, 'font-family')).toContain('Inter');
  });

  test('the chosen option is a cursor block with a check', async ({ page }) => {
    const chosen = page.getByRole('option', { name: 'Tiếng Việt' });
    await expect(chosen).toHaveAttribute('aria-selected', 'true');
    expect(await style(chosen, 'background-color')).toBe(INK);
    expect(await style(chosen, 'color')).toBe('rgb(250, 249, 245)');
    expect(await chosen.evaluate((el) => getComputedStyle(el, '::after').content)).toBe('"✓"');
  });

  test('the current option gets a 2px accent rule on its inline-start edge and the hover fill', async ({ page }) => {
    await page.getByRole('listbox', { name: 'LANGUAGE' }).focus();
    await page.keyboard.press('Home');
    const current = page.getByRole('option', { name: 'English' });
    await expect(current).toHaveAttribute('data-current', 'true');
    expect(await style(current, 'border-left-width')).toBe('2px');
    expect(await style(current, 'border-left-color')).toBe(ACCENT);
    expect(await style(current, 'background-color')).toBe('rgba(20, 20, 19, 0.05)');
    // On the chosen block the rule stays.
    await page.keyboard.press('ArrowDown');
    const both = page.getByRole('option', { name: 'Tiếng Việt' });
    expect(await style(both, 'border-left-color')).toBe(ACCENT);
    expect(await style(both, 'background-color')).toBe(INK);
  });

  test('a chosen value that is also disabled keeps readable block text', async ({ page }) => {
    const chosen = page.getByRole('option', { name: 'Tiếng Việt' });
    await chosen.evaluate((el) => el.setAttribute('aria-disabled', 'true'));
    expect(await style(chosen, 'background-color')).toBe(INK);
    expect(await style(chosen, 'color')).toBe('rgb(250, 249, 245)');
  });

  test('disabled options are quieter; checked rows are [x], never a block', async ({ page }) => {
    expect(await style(page.getByRole('option', { name: 'Français' }), 'color')).toBe('rgb(101, 100, 94)');
    const list = page.getByRole('listbox', { name: 'TOPICS' });
    await list.focus();
    await page.keyboard.press(' ');
    const checked = page.getByRole('option', { name: /CSS/ });
    await expect(checked).toHaveAttribute('aria-checked', 'true');
    expect(await checked.evaluate((el) => getComputedStyle(el, '::before').content)).toBe('"[x]"');
    expect(
      await page
        .getByRole('option', { name: /Accessibility/ })
        .evaluate((el) => getComputedStyle(el, '::before').content),
    ).toBe('"[ ]"');
    expect(await style(checked, 'background-color')).not.toBe(INK);
  });

  test('mirrors in right-to-left: the rule moves to the right edge', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    await page.getByRole('listbox', { name: 'LANGUAGE' }).focus();
    await page.keyboard.press('Home');
    const current = page.getByRole('option', { name: 'English' });
    expect(await style(current, 'border-right-width')).toBe('2px');
    expect(await style(current, 'border-right-color')).toBe(ACCENT);
  });

  test('uses system colours in forced colours', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await page.emulateMedia({ forcedColors: 'active' });
    expect(await style(page.getByRole('option', { name: 'Tiếng Việt' }), 'forced-color-adjust')).toBe('none');
    // Forced colours paint transparent borders, so only the current option may show the rule.
    const plain = page.getByRole('option', { name: 'English' });
    const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(await style(plain, 'border-left-color')).toBe(canvas);
  });
});

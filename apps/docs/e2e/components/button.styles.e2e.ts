import { expect, test, type Locator } from '@playwright/test';

// The button rules from spec/DESIGN.md, read from computed styles on the docs example.
const PAGE = '/components/button/';
const style = (el: Locator, prop: string) => el.evaluate((node, p) => getComputedStyle(node).getPropertyValue(p), prop);

test.describe('button', () => {
  test.beforeEach(async ({ page }) => {
    // Reduced motion zeroes the durations, so styles are read at their end state.
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(PAGE);
  });

  test('is a 28px mono label word; ghost keeps its 1px border transparent so every kind is the same size', async ({
    page,
  }) => {
    const ghost = page.getByRole('button', { name: 'DISCARD' });
    expect(await style(ghost, 'height')).toBe('28px');
    expect(await style(ghost, 'font-family')).toContain('JetBrains Mono');
    expect(await style(ghost, 'text-transform')).toBe('uppercase');
    expect(await style(ghost, 'border-top-color')).toBe('rgba(0, 0, 0, 0)');
    const outline = page.getByRole('button', { name: 'PREVIEW' });
    expect(await style(outline, 'border-top-width')).toBe('1px');
    expect(await style(outline, 'border-top-color')).toBe('rgba(20, 20, 19, 0.22)');
  });

  test('primary is a 2px ink frame on a transparent ground, the same size as the others', async ({ page }) => {
    const primary = page.getByRole('button', { name: 'SAVE' });
    expect(await style(primary, 'border-top-width')).toBe('2px');
    expect(await style(primary, 'border-top-color')).toBe('rgb(20, 20, 19)');
    expect(await style(primary, 'background-color')).toBe('rgba(0, 0, 0, 0)');
    expect(await style(primary, 'height')).toBe('28px');
    // The printed hotkey is quieter than the word.
    const cancel = page.getByRole('button', { name: 'CANCEL' });
    expect(await style(cancel.locator('.nib-button__key'), 'color')).toBe('rgb(101, 100, 94)');
  });

  test('hover adds the hover fill, never a lift or shadow', async ({ page }) => {
    const outline = page.getByRole('button', { name: 'PREVIEW' });
    await outline.hover();
    expect(await style(outline, 'background-color')).toBe('rgba(20, 20, 19, 0.05)');
    expect(await style(outline, 'box-shadow')).toBe('none');
    expect(await style(outline, 'transform')).toBe('none');
  });

  test('a pressed toggle is a cursor block; disabled is 45% opacity', async ({ page }) => {
    const pressed = page.getByRole('button', { name: 'GRID', pressed: true });
    expect(await style(pressed, 'background-color')).toBe('rgb(20, 20, 19)');
    expect(await style(pressed, 'color')).toBe('rgb(250, 249, 245)');
    expect(await style(page.getByRole('button', { name: 'ARCHIVE' }), 'opacity')).toBe('0.45');
  });

  test('destructive is red text with a 1px red border', async ({ page }) => {
    const destructive = page.getByRole('button', { name: 'DELETE' });
    expect(await style(destructive, 'color')).toBe('rgb(160, 69, 69)');
    expect(await style(destructive, 'border-top-color')).toBe('rgb(160, 69, 69)');
    expect(await style(destructive, 'border-top-width')).toBe('1px');
  });

  test('keeps a 2px primary frame and system colours in forced colours', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await page.emulateMedia({ forcedColors: 'active' });
    const primary = page.getByRole('button', { name: 'SAVE' });
    expect(await style(primary, 'border-top-width')).toBe('2px');
    expect(await style(primary, 'border-top-style')).toBe('solid');
    const pressed = page.getByRole('button', { name: 'GRID', pressed: true });
    expect(await style(pressed, 'forced-color-adjust')).toBe('none');
  });

  test('lays out with logical properties, so right-to-left mirrors it', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    const key = page.getByRole('button', { name: 'CANCEL' }).locator('.nib-button__key');
    const word = page.getByRole('button', { name: 'CANCEL' }).locator('.nib-button__word');
    // The printed key comes before the word in reading order: to its right in RTL.
    expect((await key.boundingBox())!.x).toBeGreaterThan((await word.boundingBox())!.x);
    // The shortcut itself still reads as written, never mirrored.
    expect(await style(key, 'unicode-bidi')).toBe('isolate');
    expect(await style(key, 'direction')).toBe('ltr');
  });

  test('combinations: destructive primary is a 2px red frame, lg is 36px, a disabled pressed toggle keeps its block', async ({
    page,
  }) => {
    // Rendered apart from the example, which keeps one primary per view.
    await page.evaluate(() => {
      document.body.insertAdjacentHTML(
        'beforeend',
        `<div id="combos">
          <button class="nib-button nib-button--destructive nib-button--primary">DELETE PROJECT</button>
          <button class="nib-button nib-button--lg nib-button--primary">START</button>
          <button class="nib-button nib-button--outline" aria-pressed="true" disabled>LOCKED</button>
        </div>`,
      );
    });
    const confirm = page.getByRole('button', { name: 'DELETE PROJECT' });
    expect(await style(confirm, 'border-top-width')).toBe('2px');
    expect(await style(confirm, 'border-top-color')).toBe('rgb(160, 69, 69)');
    expect(await style(page.getByRole('button', { name: 'START' }), 'height')).toBe('36px');
    const locked = page.getByRole('button', { name: 'LOCKED' });
    await locked.hover({ force: true });
    expect(await style(locked, 'background-color')).toBe('rgb(20, 20, 19)');
  });

  test('on touch screens buttons are 44px and the primary 48px', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(PAGE);
    expect(await style(page.getByRole('button', { name: 'PREVIEW' }), 'height')).toBe('44px');
    expect(await style(page.getByRole('button', { name: 'SAVE' }), 'height')).toBe('48px');
    await context.close();
  });
});

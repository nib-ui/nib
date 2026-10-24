import { expect, test } from '@playwright/test';

const PAGE = '/components/empty-loading/';

test.describe('empty state and loading', () => {
  test('ghosts are dashed and unread; the empty state has one label, one sentence, one action', async ({ page }) => {
    await page.goto(PAGE);
    const empty = page.locator('.nib-empty');
    await expect(empty.locator('.nib-ghost').first()).toHaveCSS('border-top-style', 'dashed');
    await expect(empty.locator('.nib-empty__ghosts')).toHaveAttribute('aria-hidden', 'true');
    await expect(empty.locator('.nib-empty__label')).toHaveCSS('text-transform', 'uppercase');
    await expect(empty.getByRole('link')).toHaveCount(1);
  });

  test('the spinner steps through frames 110ms apart, and stands still under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(PAGE);
    const spinner = page.locator('.nib-spinner');
    const animation = await spinner.evaluate((el) => {
      const s = getComputedStyle(el, '::before');
      return [s.animationName, s.animationDuration, s.animationTimingFunction];
    });
    expect(animation.slice(0, 2)).toEqual(['nib-spinner', '0.66s']);
    expect(animation[2]).toMatch(/^steps\(1(, end)?\)$/);
    // The frames really change: two samples 330ms apart (three frames) show different glyphs.
    const frame = () => spinner.evaluate((el) => getComputedStyle(el, '::before').content);
    const first = await frame();
    await page.waitForTimeout(330);
    expect(await frame()).not.toBe(first);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await spinner.evaluate((el) => getComputedStyle(el, '::before').animationName)).toBe('none');
    await expect(page.getByRole('status')).toHaveText('Loading products…');
  });

  test('a progress bar is a 2px rule; a media placeholder keeps its aspect ratio', async ({ page }) => {
    await page.goto(PAGE);
    expect((await page.getByRole('progressbar', { name: 'Upload' }).boundingBox())?.height).toBeCloseTo(2, 0);
    const media = page.getByRole('img', { name: 'Photo loading' });
    const box = await media.boundingBox();
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(16 / 9, 2);
    await expect(media).toHaveCSS('font-family', /JetBrains Mono/);
  });

  test('a busy region shows the progress cursor', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('[aria-busy="true"]')).toHaveCSS('cursor', 'progress');
  });
});

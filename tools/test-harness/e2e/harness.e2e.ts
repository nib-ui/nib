import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';
import { applyCell, expectAccessible, matrix } from '../src/index.ts';

// The harness tests itself on a small page built only from the published tokens.
const tokensCss = readFileSync(createRequire(import.meta.url).resolve('@nib-ui/tokens/tokens.css'), 'utf8');
const fixture = `<!doctype html><html><head><meta charset="utf-8"><title>Harness fixture</title>
<style>${tokensCss}
body { margin: 0; background: var(--nib-surface); color: var(--nib-on-surface); font: 14px/22px system-ui; }
main { padding: var(--nib-density-cell-padding); }
.current { border-block-end: 2px solid var(--nib-accent); }
.cursor { background: var(--nib-cursor); color: var(--nib-on-cursor); padding-inline: 4px; }
@media (forced-colors: active) { .cursor { background: Highlight; color: HighlightText; } }
</style></head><body><main>
<h1>Nib harness · Tiếng Việt · العربية</h1>
<p><span class="current">Current</span> and <span class="cursor">chosen</span> marks.</p>
</main></body></html>`;

const SURFACE = { light: 'rgb(250, 249, 245)', dark: 'rgb(20, 20, 19)' };

for (const cell of matrix()) {
  test(cell.name, async ({ page, browserName }) => {
    test.skip(cell.forcedColors && browserName !== 'chromium', 'Playwright emulates forced colours in Chromium only');
    await applyCell(page, cell);
    await page.route('https://harness.test/', (route) => route.fulfill({ contentType: 'text/html', body: fixture }));
    await page.goto('https://harness.test/');

    const state = await page.evaluate(() => ({
      background: getComputedStyle(document.body).backgroundColor,
      dir: document.documentElement.dir,
      lang: document.documentElement.lang,
      padding: getComputedStyle(document.querySelector('main') as HTMLElement).paddingInlineStart,
      forced: matchMedia('(forced-colors: active)').matches,
    }));
    expect(state.dir).toBe(cell.dir);
    expect(state.lang).toBe(cell.lang);
    expect(state.forced).toBe(cell.forcedColors);
    if (!cell.forcedColors) {
      expect(state.background).toBe(SURFACE[cell.theme]);
      expect(state.padding).toBe(cell.density === 'compact' ? '12px' : '16px');
    }

    await expectAccessible(page);
    await expect(page).toHaveScreenshot(`fixture-${cell.name}.png`, { fullPage: true });
  });
}

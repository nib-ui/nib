import type { Page } from '@playwright/test';
import type { Cell } from './matrix.ts';

/**
 * Puts a page into one matrix cell before it navigates: viewport, colour scheme or forced colours,
 * and `lang`, `dir`, `data-theme`, `data-density` on the root element of every document it loads.
 * Call it before `page.goto()`. The attributes land as soon as `<html>` exists, before styles and
 * scripts run; a custom element that reads them in its constructor during parsing may still be
 * created first, so such tests should assert after load.
 */
export interface ApplyCellOptions {
  /** Defaults to `reduce`; pass `no-preference` in tests of motion itself (transitionend and the like). */
  reducedMotion?: 'reduce' | 'no-preference';
}

export async function applyCell(page: Page, cell: Cell, { reducedMotion = 'reduce' }: ApplyCellOptions = {}): Promise<void> {
  await page.setViewportSize(cell.viewport);
  await page.emulateMedia({
    colorScheme: cell.theme,
    forcedColors: cell.forcedColors ? 'active' : 'none',
    reducedMotion,
  });
  const attrs: Record<string, string> = cell.forcedColors
    ? { lang: cell.lang, dir: cell.dir }
    : { lang: cell.lang, dir: cell.dir, 'data-theme': cell.theme, 'data-density': cell.density };
  await page.addInitScript((a: Record<string, string>) => {
    const set = () => Object.entries(a).forEach(([k, v]) => document.documentElement.setAttribute(k, v));
    // Init scripts can run before the parser creates <html>; set the attributes once it exists.
    if (document.documentElement) set();
    else new MutationObserver((_, observer) => document.documentElement && (set(), observer.disconnect())).observe(document, { childList: true });
  }, attrs);
}

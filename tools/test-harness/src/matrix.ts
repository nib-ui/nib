export type Theme = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';
export type Lang = 'en' | 'vi' | 'ar';

/** One combination a component is rendered and screenshotted in. */
export interface Cell {
  /** Stable, unique and file-name safe, e.g. `dark-compact-vi-360`; used in snapshot names. */
  name: string;
  theme: Theme;
  density: Density;
  lang: Lang;
  dir: 'ltr' | 'rtl';
  viewport: { width: number; height: number };
  /** Windows High Contrast style emulation; theme and density are left at their defaults. */
  forcedColors: boolean;
}

const THEMES: Theme[] = ['light', 'dark'];
const DENSITIES: Density[] = ['comfortable', 'compact'];
const LANGS: Lang[] = ['en', 'vi', 'ar'];
// 360px is the narrowest phone Nib supports; desktop is a common laptop size.
const VIEWPORTS = { '360': { width: 360, height: 780 }, desktop: { width: 1280, height: 800 } };

/**
 * Every theme × density × language × viewport, plus one forced-colours cell per viewport.
 * Languages cover Latin (en), Latin with stacked diacritics (vi) and right-to-left (ar).
 */
export function matrix(): Cell[] {
  const cells: Cell[] = [];
  for (const [size, viewport] of Object.entries(VIEWPORTS)) {
    for (const theme of THEMES) {
      for (const density of DENSITIES) {
        for (const lang of LANGS) {
          const dir = lang === 'ar' ? 'rtl' : 'ltr';
          cells.push({
            name: `${theme}-${density}-${lang}-${size}`,
            theme,
            density,
            lang,
            dir,
            viewport,
            forcedColors: false,
          });
        }
      }
    }
  }
  for (const [size, viewport] of Object.entries(VIEWPORTS)) {
    cells.push({
      name: `forced-colors-${size}`,
      theme: 'light',
      density: 'comfortable',
      lang: 'en',
      dir: 'ltr',
      viewport,
      forcedColors: true,
    });
  }
  return cells;
}

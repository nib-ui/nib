/** Every string the site chrome prints, per locale. Page content lives in the pages themselves. */
export const ui = {
  en: {
    skip: 'Skip to content',
    themeDark: 'DARK',
    themeLight: 'LIGHT',
    /** Visually hidden around the word, so the button says what it does: "Switch to dark theme". */
    themeBefore: 'Switch to',
    themeAfter: 'theme',
    home: 'Nib',
    components: 'Components',
    siteNav: 'Site',
    docsNav: 'Docs',
    menu: 'Menu',
    search: 'Search · soon',
    onThisPage: 'On this page',
    contents: 'Contents',
    densityCompact: 'Compact',
    densityComfortable: 'Comfortable',
    /** Visually hidden around the word: "Switch to compact density". */
    densityBefore: 'Switch to',
    densityAfter: 'density',
    example: 'Example',
    code: 'Code',
    accessibility: 'Accessibility',
  },
} as const;

export type Locale = keyof typeof ui;

export const strings = (locale: string | undefined) => ui[(locale ?? 'en') as Locale] ?? ui.en;

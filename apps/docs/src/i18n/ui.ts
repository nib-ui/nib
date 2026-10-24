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
    example: 'Example',
    code: 'Code',
    accessibility: 'Accessibility',
  },
} as const;

export type Locale = keyof typeof ui;

export const strings = (locale: string | undefined) => ui[(locale ?? 'en') as Locale] ?? ui.en;

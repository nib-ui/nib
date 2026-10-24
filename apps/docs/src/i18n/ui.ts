/** Every string the site chrome prints, per locale. Page content lives in the pages themselves. */
export const ui = {
  en: {
    skip: 'SKIP TO CONTENT',
    themeDark: 'DARK',
    themeLight: 'LIGHT',
    home: 'Nib',
    example: 'Example',
    code: 'Code',
    accessibility: 'Accessibility',
  },
} as const;

export type Locale = keyof typeof ui;

export const strings = (locale: string | undefined) => ui[(locale ?? 'en') as Locale] ?? ui.en;

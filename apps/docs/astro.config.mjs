import { defineConfig } from 'astro/config';

// Static output, the way Vercel serves it. English only for 1.0, but every page and string already
// goes through the locale config, so another language is a new folder and a new string table.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  i18n: { locales: ['en'], defaultLocale: 'en' },
});

import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// Static output, the way Vercel serves it. English only for 1.0, but every page and string already
// goes through the locale config, so another language is a new folder and a new string table.
// The framework integrations render the binding fixtures the keyboard specs drive (src/fixtures).
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  i18n: { locales: ['en'], defaultLocale: 'en' },
  integrations: [react(), vue(), svelte()],
});

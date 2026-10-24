import { playwright } from '@vitest/browser-playwright';
import type { TestProjectInlineConfiguration } from 'vitest/config';

/**
 * A Vitest project that runs `*.browser.spec.ts` in headless Chromium, for tests that need a
 * real DOM (mount → unmount → mount). Add it next to a node project in `test.projects`.
 */
export function defineBrowserTestConfig(include = ['src/**/*.browser.spec.ts']): TestProjectInlineConfiguration {
  return {
    test: {
      name: 'browser',
      include,
      browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] },
    },
  };
}

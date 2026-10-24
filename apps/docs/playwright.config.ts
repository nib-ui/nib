import { definePlaywrightConfig } from '@nib-ui/test-harness';

// Runs against the built site, served the way Vercel serves it (static files).
export default definePlaywrightConfig({
  testDir: './e2e',
  use: { locale: 'en-US', timezoneId: 'UTC', baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'node e2e/serve-dist.ts',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env['CI'],
  },
});

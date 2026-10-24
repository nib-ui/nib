import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';

/**
 * Playwright config shared by every package with browser tests: the three engines, and snapshot
 * paths per spec file and engine, without the OS, so baselines made in the Playwright Docker image match CI exactly.
 */
export function definePlaywrightConfig(overrides: PlaywrightTestConfig = {}) {
  return defineConfig({
    testMatch: '**/*.e2e.ts',
    fullyParallel: true,
    forbidOnly: !!process.env['CI'],
    retries: 0,
    reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
    snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{projectName}/{arg}{ext}',
    // A fixed locale and time zone keep number and date formatting identical in every container.
    use: { locale: 'en-US', timezoneId: 'UTC' },
    // Zero tolerance: no pixel may differ, by any amount of colour (threshold defaults to 0.2).
    expect: { toHaveScreenshot: { animations: 'disabled', caret: 'hide', threshold: 0, maxDiffPixels: 0 } },
    projects: [
      { name: 'chromium', use: { ...devices['Desktop Chrome'], locale: 'en-US' } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'], locale: 'en-US' } },
      { name: 'webkit', use: { ...devices['Desktop Safari'], locale: 'en-US' } },
    ],
    ...overrides,
  });
}

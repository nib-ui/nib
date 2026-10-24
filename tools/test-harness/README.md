# @nib-ui/test-harness

Private. The test infrastructure every component reuses (ADR 7).

| Export | Use |
|---|---|
| `matrix()` | The 26 cells: theme × density × en/vi/ar × 360px/desktop, plus forced colours per viewport |
| `applyCell(page, cell)` | Call before `page.goto()`: viewport, colour scheme or forced colours, `lang`/`dir`/`data-theme`/`data-density` on `<html>` |
| `expectAccessible(page, include?)` | axe with WCAG 2.2 A/AA; fails with each rule, target and reason |
| `definePlaywrightConfig()` | Chromium, Firefox, WebKit; `*.e2e.ts`; OS-free snapshot paths |
| `defineBrowserTestConfig()` | Vitest project running `*.browser.spec.ts` in headless Chromium |
| `mountTwice(host, mount)` | Mount → unmount → mount; throws on leftovers or a different second render |
| `BUDGETS` | Size budgets from `size-budgets.json` at the workspace root |

## Running

Playwright runs only in Docker, so screenshots match CI:

```bash
pnpm e2e
```

```bash
pnpm update-snapshots
```

Both use `scripts/playwright-docker.sh` (linux/arm64). Vitest browser tests run on the host and need
Chromium once: `pnpm exec playwright install chromium`.

Notes:
- Bumping the Playwright image or version changes rendering: run `pnpm update-snapshots` and commit the
  new baselines in the same pull request. A workflow-only change does not make `nx affected` run e2e.
- After `pnpm update-snapshots`, check `git status`: baselines of removed tests are not deleted.

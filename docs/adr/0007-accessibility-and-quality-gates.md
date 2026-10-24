# 7. Accessibility target and quality gates

Date: 2026-10-24 · Status: accepted (amended 2026-10-24: visual regression platform)

## Decision

- Target WCAG 2.2 AA; every interactive component follows its WAI-ARIA APG pattern. Checkbox,
  radio and switch are native inputs (`appearance: none`, glyph drawn by CSS, switch has
  `role="switch"`).
- Every docs page has an Accessibility section: keyboard map, roles, and what the author must
  supply (labels, names).
- CI gates:
  - axe-core on every component page;
  - Playwright keyboard tests;
  - Playwright visual regression across theme (dark/light) × density × language (en, vi, ar) ×
    360px / desktop × Chromium, Firefox, WebKit, plus forced-colors;
  - Vitest browser mode for behaviour, including mount → unmount → mount idempotence;
  - a Stylelint plugin that blocks radius ≠ 0, box-shadow, gradients, blur, `!important` and
    physical left/right properties;
  - contrast checks for every token pair, sharing the engine with `nib theme check`.
- Manual VoiceOver and NVDA checklist before every minor release.
- Forced colors: every component has a `forced-colors: active` treatment. RTL is structural:
  logical properties everywhere, directional glyphs mirror under `:dir(rtl)`.

## Amendment: where visual regression runs (2026-10-24)

- Screenshots are made and compared only inside the official Playwright image
  (`mcr.microsoft.com/playwright:v1.64.1-noble`) on **linux/arm64**: locally through
  `scripts/playwright-docker.sh` (`pnpm e2e`, `pnpm update-snapshots`), in CI on
  `ubuntu-24.04-arm` runners in the same container. Baselines are committed next to each spec
  under `__screenshots__/<engine>/` with no OS in the path, and compared with zero tolerance.
- Why arm64: under QEMU amd64 emulation on Apple silicon, Chromium returned NaN contrast ratios to
  axe (`#141413` on `#faf9f5` reported as "contrast of null") while Firefox and WebKit passed; on
  native arm64 every check passes. amd64 baselines therefore could not be made on the machines most
  contributors use, and the arm64 path is also about five times faster locally.
- Contributors on x86 machines cannot make matching baselines locally; they push and let CI report
  the diff (an upload-artifact report on failure).
- Forced colors are emulated in Chromium only (a Playwright limit); Firefox and WebKit run the 24
  ordinary cells.
- Pull requests run the full matrix for affected projects; `nightly.yml` runs everything on `main`.


# 7. Accessibility target and quality gates

Date: 2026-10-24 · Status: accepted

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

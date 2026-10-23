# 5. Browser support: last two versions, modern CSS without fallbacks

Date: 2026-10-24 · Status: accepted

## Context

Nib wants to use current CSS and HTML directly. Data from web-features / Baseline (Oct 2026) is in
`plans/reports/researcher-251023-browser-support-floor.md`.

## Decision

- Floor: the last two versions of Chrome, Firefox and Safari (≈ 155 / 157 / 26.6 today). A feature
  is used only when all three engines in the floor support it; there are no fallbacks.
- Each minor release pins a `browserslist` snapshot in its changelog under "Browser support".
  Patches never raise the floor; newly available features land in the next minor.
- Currently excluded: container scroll-state queries, `dialog closedby`, `popover="hint"`,
  `interpolate-size` / `calc-size()`, customizable `<select>`, `text-wrap: pretty`, scroll-driven
  animations, `if()`, typed `attr()`, `@function`, and anchor positioning (partial in Safari 26).
- Electron is supported at the Chromium matching the snapshot's minimum Chrome. Tauri and other
  OS WebViews are not officially supported.

## Consequences

- Roughly 55% global usage coverage today; acceptable for a developer-facing audience, and it
  rises as the floor moves.
- Native `<select>` stays limited until customizable select is in all engines; the listbox
  component covers custom needs.

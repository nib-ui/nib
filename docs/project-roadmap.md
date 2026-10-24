# Nib 1.0 roadmap

Living document. Settled by grilling on 2026-10-24 (decision log: `plans/251023-grilling-decisions/decisions.md`). Order and gates only, no dates. Each milestone ends with a prerelease on dist-tag `next`; 1.0 is the single public launch.

## Rules

- **One issue = one vertical slice = one PR**, with `Blocked by` at the top of the body and as a native GitHub dependency. No epics, no project board; milestones M0–M4 group the issues.
- **Labels:** `ready-for-agent` (fully specified), `ready-for-human` (owner action, release, or visual judgement), `needs-triage` (skeleton, specified when its milestone starts), `blocker` (must be fixed before the next gate).
- **Definition of done, every component:** CSS with forced-colors and RTL; docs page with an Accessibility section; axe; visual regression over theme × density × en/vi/ar × 360px/desktop × Chromium/Firefox/WebKit plus forced-colors; size-limit. Interactive components add the core controller, all four bindings in the same issue, APG conformance rows and a Playwright keyboard spec.
- **Visual regression:** baselines committed, generated in the Playwright Docker image; pull requests run the full matrix for affected components, `main` runs everything nightly.
- **Docs and playground** exist from M0/M1 (docs on Vercel with PR previews, playground under `/play`); they are test infrastructure, not a final task.
- **Out of 1.0 (1.x):** slider, `shop` and `portfolio` presets, `nib add`, the ESLint plugin.

## Components in 1.0 (30)

- **CSS-only (18):** typography (kicker, article), link, tag, callout, code block, button, form fields, list row, tile, pane/ruled grid, static table, header/nav, side column, footer, breadcrumb, pagination, empty state, loading. Section and hero ship with the content blocks.
- **Interactive (12):** disclosure/accordion, tabs, dialog/drawer/sheet, menu, popover, tooltip, toast, listbox, combobox, command palette, date picker, data grid.
- **Presets (4):** `docs` (Galley), `dashboard` (Ledger), `blog` (Broadsheet), `landing` (Broadside).

## [M0 Foundation](https://github.com/nib-ui/nib/milestone/1)

Owner tasks first in the list; they block only publishing. Tokens unblock color-engine, stylelint and the harness (parallel). Core foundations → dom → bridges run in parallel with them. Generator, then the docs skeleton, button and the listbox slice prove the whole pipeline. **Exit:** listbox slice green, `1.0.0-alpha.0` published with provenance.

| Issue | Title | Blocked by | Labels |
|---|---|---|---|
| [#5](https://github.com/nib-ui/nib/issues/5) | Create the npm org nib-ui and enforce 2FA | — | ready-for-human |
| [#6](https://github.com/nib-ui/nib/issues/6) | Register the GitHub trusted publisher for every public package | #5 | ready-for-human |
| [#7](https://github.com/nib-ui/nib/issues/7) | Connect the workspace to Nx Cloud and add the CI token | — | ready-for-human |
| [#8](https://github.com/nib-ui/nib/issues/8) | Create the Vercel project for the docs site | — | ready-for-human |
| [#9](https://github.com/nib-ui/nib/issues/9) | Trademark search for "Nib" in classes 9 and 42 | — | ready-for-human |
| [#10](https://github.com/nib-ui/nib/issues/10) | Buy nib.dev and nib.design | — | ready-for-human |
| [#11](https://github.com/nib-ui/nib/issues/11) | Archive the old design repository | — | ready-for-human |
| [#12](https://github.com/nib-ui/nib/issues/12) | Add Prettier, lint-staged pre-commit hook and a CI format check | — | ready-for-agent |
| [#13](https://github.com/nib-ui/nib/issues/13) | Add SECURITY, CONTRIBUTING and Code of Conduct | — | ready-for-agent |
| [#14](https://github.com/nib-ui/nib/issues/14) | Configure Renovate | — | ready-for-agent |
| [#15](https://github.com/nib-ui/nib/issues/15) | Token pipeline: DTCG source to CSS variables, Tailwind theme and JSON | — | ready-for-agent |
| [#16](https://github.com/nib-ui/nib/issues/16) | color-engine: contrast, colour-vision and hue-collision checks | #15 | ready-for-agent |
| [#17](https://github.com/nib-ui/nib/issues/17) | Stylelint plugin that enforces the Nib laws | #15 | ready-for-agent |
| [#18](https://github.com/nib-ui/nib/issues/18) | Quality harness: Playwright, axe, visual regression matrix, size-limit, Vitest browser | #15 | ready-for-agent |
| [#19](https://github.com/nib-ui/nib/issues/19) | Core foundations: test host, fakes, shared parts and APG conformance runner | — | ready-for-agent |
| [#20](https://github.com/nib-ui/nib/issues/20) | @nib-ui/dom: intent runner, live region, ids, events, geometry adapter | #19 | ready-for-agent |
| [#21](https://github.com/nib-ui/nib/issues/21) | Binding bridges for js, react, vue and svelte | #20 | ready-for-agent |
| [#22](https://github.com/nib-ui/nib/issues/22) | nx generator nib:component | #18, #17, #21 | ready-for-agent |
| [#23](https://github.com/nib-ui/nib/issues/23) | Docs app skeleton (Astro) with the component page template | #15 | ready-for-agent |
| [#24](https://github.com/nib-ui/nib/issues/24) | Button (CSS): primary, outline, ghost, destructive | #22, #23 | ready-for-agent |
| [#25](https://github.com/nib-ui/nib/issues/25) | Listbox vertical slice: controller, four bindings, CSS, docs, every test | #24 | ready-for-agent |
| [#26](https://github.com/nib-ui/nib/issues/26) | Publish 1.0.0-alpha.0 and verify OIDC provenance | #25, #5, #6 | ready-for-human |

## [M1 CSS](https://github.com/nib-ui/nib/milestone/2)

Base first; every other M1 issue depends only on base (fonts and icons only on tokens), so they run in parallel. **Exit:** all M1 issues closed, next alpha published.

| Issue | Title | Blocked by | Labels |
|---|---|---|---|
| [#27](https://github.com/nib-ui/nib/issues/27) | Base: reset, typography, layout, ruled grid, focus, themes and density | #25 | ready-for-agent |
| [#28](https://github.com/nib-ui/nib/issues/28) | @nib-ui/fonts: Inter and JetBrains Mono variable subsets | #15 | ready-for-agent |
| [#29](https://github.com/nib-ui/nib/issues/29) | Minimal icon set (~15) with sprite, ESM and CSS mask outputs | #15 | ready-for-agent |
| [#30](https://github.com/nib-ui/nib/issues/30) | Utilities (Furniture) generated from tokens | #27 | ready-for-agent |
| [#31](https://github.com/nib-ui/nib/issues/31) | Form fields: input, textarea, select, checkbox, radio, switch, field and error summary | #27 | ready-for-agent |
| [#32](https://github.com/nib-ui/nib/issues/32) | Link, tag, callout and code block with COPY | #27 | ready-for-agent |
| [#33](https://github.com/nib-ui/nib/issues/33) | Header and navigation, side column, footer | #27 | ready-for-agent |
| [#34](https://github.com/nib-ui/nib/issues/34) | Breadcrumb and pagination | #27 | ready-for-agent |
| [#35](https://github.com/nib-ui/nib/issues/35) | Section, hero, tile, list row, pane and static table | #27 | ready-for-agent |
| [#36](https://github.com/nib-ui/nib/issues/36) | Empty state and loading (progress, ghost) | #27 | ready-for-agent |
| [#37](https://github.com/nib-ui/nib/issues/37) | Docs: navigation, component index and On this page | #27 | ready-for-agent |
| [#38](https://github.com/nib-ui/nib/issues/38) | Playground (Proof press): live token controls with contrast feedback | #27, #16 | ready-for-agent |
| [#39](https://github.com/nib-ui/nib/issues/39) | Publish the M1 alpha | #30, #31, #32, #33, #34, #35, #36, #37, #38, #28, #29 | ready-for-human |

## [M2 Controllers](https://github.com/nib-ui/nib/milestone/3)

Strict order: `place()` and popover come before tooltip and menu; toast is last because it needs the live region and the one-toaster rule. **Exit:** next alpha published.

| Issue | Title | Blocked by | Labels |
|---|---|---|---|
| [#40](https://github.com/nib-ui/nib/issues/40) | Disclosure and accordion | #39 | needs-triage |
| [#41](https://github.com/nib-ui/nib/issues/41) | Tabs | #40 | needs-triage |
| [#42](https://github.com/nib-ui/nib/issues/42) | place() positioning and popover | #41 | needs-triage |
| [#43](https://github.com/nib-ui/nib/issues/43) | Tooltip | #42 | needs-triage |
| [#44](https://github.com/nib-ui/nib/issues/44) | Menu and menu button | #43 | needs-triage |
| [#45](https://github.com/nib-ui/nib/issues/45) | Dialog, drawer and sheet | #44 | needs-triage |
| [#46](https://github.com/nib-ui/nib/issues/46) | Toast | #45 | needs-triage |
| [#47](https://github.com/nib-ui/nib/issues/47) | Publish the M2 alpha | #46 | needs-triage |

## [M3 Heavy controllers](https://github.com/nib-ui/nib/milestone/4)

Combobox reuses listbox, command palette reuses combobox; data grid is last (largest, tightest budget). **Exit (beta gate):** 30 components meet the definition of done, size budgets pass, APG table green on all four bindings → `1.0.0-beta.0`.

| Issue | Title | Blocked by | Labels |
|---|---|---|---|
| [#48](https://github.com/nib-ui/nib/issues/48) | Combobox | #47 | needs-triage |
| [#49](https://github.com/nib-ui/nib/issues/49) | Command palette | #48 | needs-triage |
| [#50](https://github.com/nib-ui/nib/issues/50) | Date picker | #49 | needs-triage |
| [#51](https://github.com/nib-ui/nib/issues/51) | Data grid | #50 | needs-triage |
| [#52](https://github.com/nib-ui/nib/issues/52) | Beta gate: all components done, budgets met, APG table green | #51 | needs-triage |
| [#53](https://github.com/nib-ui/nib/issues/53) | Publish 1.0.0-beta.0 | #52 | needs-triage |

## [M4 Ecosystem](https://github.com/nib-ui/nib/milestone/5)

`theme check` → `lint` → `init` → four presets (parallel) and the full icon set → docs polish and playground preset switching. **RC gate:** VoiceOver and NVDA pass, docs complete, browserslist snapshot, community files → `1.0.0-rc.0`. **1.0:** rc runs at least two weeks with no open `blocker` issue.

| Issue | Title | Blocked by | Labels |
|---|---|---|---|
| [#54](https://github.com/nib-ui/nib/issues/54) | CLI: nib theme check | #53 | needs-triage |
| [#55](https://github.com/nib-ui/nib/issues/55) | CLI: nib lint | #54 | needs-triage |
| [#56](https://github.com/nib-ui/nib/issues/56) | CLI: nib init | #55 | needs-triage |
| [#57](https://github.com/nib-ui/nib/issues/57) | Preset: docs (Galley) | #56 | needs-triage |
| [#58](https://github.com/nib-ui/nib/issues/58) | Preset: dashboard (Ledger) | #56 | needs-triage |
| [#59](https://github.com/nib-ui/nib/issues/59) | Preset: blog (Broadsheet) | #56 | needs-triage |
| [#60](https://github.com/nib-ui/nib/issues/60) | Preset: landing (Broadside) | #56 | needs-triage |
| [#61](https://github.com/nib-ui/nib/issues/61) | Full icon set (60–80 icons) | #53 | needs-triage |
| [#62](https://github.com/nib-ui/nib/issues/62) | Docs polish and playground preset switching | #57, #58, #59, #60, #61 | needs-triage |
| [#63](https://github.com/nib-ui/nib/issues/63) | Manual screen reader pass: VoiceOver and NVDA | #62 | needs-triage |
| [#64](https://github.com/nib-ui/nib/issues/64) | RC gate: docs complete, browserslist snapshot, community files | #63 | needs-triage |
| [#65](https://github.com/nib-ui/nib/issues/65) | Publish 1.0.0-rc.0 | #64 | needs-triage |
| [#66](https://github.com/nib-ui/nib/issues/66) | Release 1.0.0 | #65 | needs-triage |

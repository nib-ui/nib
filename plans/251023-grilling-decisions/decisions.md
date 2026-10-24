# Grilling decisions — Nib (formerly "Warm Terminal")

Date: 2026-10-23 → 10-24. Status: **design tree complete; waiting on owner's final confirmation**.
Research: `plans/reports/researcher-251023-*.md` · Accent swatches: `plans/visuals/accent-candidates.html`

## 1. Goal & positioning
- Q1 Ambition: personal → niche community → Bootstrap-class, over time. Near-term target: one complete 1.0.
- Q2 Primary positioning: developer-facing products (docs, dashboards, CLI/tool landings, technical blogs). Shop/portfolio recipes stay as "it can do this too" examples.
- Q8 Domain customisation = **presets** (token bundle + recipe): default theme, density, mapping of the 3 free hues, built-in tags, sample pages. Presets never touch the laws.
- Q17 Core licence MIT. Later revenue: paid templates + premium presets; components are never paywalled.

## 2. Brand
- Q3 Step away from Anthropic: keep the design grammar, change palette + name; never use "Claude/Anthropic" in name, tagline or marketing.
- Q6 Rename before any publish, including GitHub. Keep the 3×3 ruled-grid + cursor-cell logo (`/Users/sangnguyen/Desktop/design/logo`).
- B1 Personality: precise · calm · devoted (a typesetter's craft with a touch of the minimal engineer).
- B2 The name carries one idea: the cursor / ink — "the one thing that is marked". The ruled page goes in the tagline.
- B3 No Vietnamese-rooted name. B7 A real, short, evocative English word used in a new sense (Linear / Astro / Bun style).
- B4 Required: npm scope `@<name>`, GitHub org `<name>` or `<name>-ui`, one domain (.dev / .design / .sh). Unscoped npm name not required. CLI ships as `@<name>/cli`.
- B5 3–7 letters, 1–2 syllables, spelled right after hearing once, pronounceable in Vietnamese and English accents, good lowercase JetBrains Mono wordmark (avoid ll / il / rn).
- B6 CLI command = brand name; must not collide with common shell commands or Homebrew formulae.
- B8 Tagline in English, sentence case, no "terminal", "Claude" or "AI".
- B9 Scope rule relaxed: npm scope `@<name>-ui` (or `@<name>ui`) is acceptable; GitHub org `<name>-ui`; brand stays the bare word. Reason: round 2 showed nearly every strong short word is taken as a bare scope.
- B10 Front-runner after round 3: **nib** (`@nib-ui/*`, github.com/nib-ui, nib.dev + nib.design, CLI `nib`, CSS prefix `nib-`). Owner asked to explore retro + mythology before deciding.
- B11 Brand architecture: (b) the main name may be a writing/scribe deity whose symbol is an old writing tool (story built in, still one short word per B5/B7) + (c) a retro print-era naming system for sub-brands (presets, themes, density, CLI), drafted after the main name so the voice matches.
- B12 Retro sub-names live in docs/marketing only (e.g. "Galley — the docs preset"). Code and CLI use self-explanatory names (`docs`, `dark`/`light`, `compact`/`comfortable`, `init`, `theme check`, `lint`). CLI copy (errors, spinner, `init` greeting) may carry a retro print voice. No aliases: one spelling per concept.
- Round 4 (retro + mythology, 53 names) found nothing that beats nib; myth names don't carry the cursor/ink idea in the word itself.
- **NAME: Nib** (decided 2026-10-24). npm `@nib-ui/*` · GitHub org `nib-ui` · `nib.dev` (docs) + `nib.design` · CLI `nib` · CSS prefix `nib-`. Story: the dip-pen nib, the one point where ink meets the ruled page (the retro story lives in the word). Known, accepted risks: `@nib` is another company's active npm scope; Nib Health (Australian insurer, different industry); stylus/nib (dead CSS lib, 2022).
- B13 Tagline: **"Nib — a ruled UI framework, one mark at a time."** Description line (npm/GitHub): "Framework-agnostic CSS and headless components for docs, dashboards and developer tools."
- B14 Retro sub-brand names (docs/marketing only, per B12):

  | In code | Story name | Origin |
  |---|---|---|
  | preset `docs` | Galley | long proof of set type |
  | preset `dashboard` | Ledger | ruled account book |
  | preset `blog` | Broadsheet | large-format newspaper |
  | preset `landing` | Broadside | single-sided printed poster |
  | preset `shop` | Catalogue | printed catalogue |
  | preset `portfolio` | Folio | folded sheet / page number |
  | theme `dark` / `light` | Ink / Paper | |
  | density `compact` / `comfortable` | Set solid / Leaded | lines without / with lead strips between them |
  | jade accent | Verdigris | blue-green patina on brass/copper |
  | package `icons` | Dingbats | printer's ornaments |
  | utilities | Furniture | wood/metal spacers in a type forme |
  | package `tokens` | Sorts | individual pieces of type |
  | package `fonts` | Type case | the case that holds type |
  | playground | Proof press | proofing press |

  CLI voice: `Setting type…` · `Locked up.` · `Pulled a proof → nib.config.json`; `theme check` errors read as proof marks ("Proof mark: accent on paper-raised is 2.8:1, needs 3:1.").

## 3. Colour & design system
- Q5 Two tiers: fixed laws (radius 0, no shadows, mono/sans pairing, 1px/2px strokes, motion); open tokens (accent, 3 free hues, font families as long as the mono + sans pair stays, density).
- Q7/Q29 Accent **F: jade rule + ink inversion**. Dark `#00967d` / text `#009e84`; light `#02806c` / text `#007561`. Also: rule "ink inversion = selection/cursor only, never a button"; retune `syntax-keyword` / `syntax-number` (collide with teal); CVD test inside `theme check`. Both light and dark themes.
- Q27/Q32/Q33 Own icon set: 16/20 grid, 1px/2px strokes, square caps, 90°/45° angles only, `currentColor`, ~60–80 icons; SVG sprite + ESM + CSS mask. Icons accompany words by default; icon-only only for dense controls inside components, with mandatory `aria-label` + tooltip.
- Q16 Uppercase via `text-transform`; raise label line-height for Vietnamese diacritics; `:lang()` disables uppercase for CJK.
- T1 Default theme follows `prefers-color-scheme`; override with `data-theme` on `<html>` or any region; `light-dark()` + `color-scheme`; presets may set their own default.
- Note: JetBrains Mono has no `tnum` (no-op, not needed); Inter numerals need `tnum`.

## 4. Architecture
- Q4 CSS tokens first + optional scripts (reference: Appwrite Pink).
- Q9/Q18 1.0 = foundation + ~25 components + data grid, date picker, advanced combobox, command palette, framework wrappers. **Single release at 1.0.**
- Q19 Hand-written, **zero runtime dependencies**.
- Q30 Headless TS core (controllers: state, APG keyboard, ARIA); `js` / `react` / `vue` / `svelte` are thin bindings.
- Q31 1.0 wrappers: React, Vue, Svelte.
- Q10 Prefer the newest native HTML/CSS; ESM scripts with `init(root)` / `destroy()`, auto-init via `data-*`, idempotent (SPA-safe).
- Q34 Data grid: sort, row selection, sticky header, column resize, APG grid keyboard, pagination, simple cell edit, virtualisation from ~1k rows (no grouping / pivot / column drag / range selection). Date picker: single date, range, min/max, disabled dates, `Intl` (test vi-VN / en-US / ja-JP), no time / lunar calendar.
- Q45 Hand-written positioning module (placement → flip → shift → fit) for every floating element; removed once anchor positioning ships in all 3 engines.
- Q11 Prefixed component classes; state styled via ARIA (`aria-current` = accent); accessibility is a first-class concern.
- Q12 Source tokens in DTCG JSON → CSS vars, Tailwind v4 `@theme`, JSON (Figma later). Plain CSS, `@layer`, Lightning CSS, no Sass. DESIGN.md = spec/docs, not a build source.
- Q16/Q21 Prefixed utility system generated from tokens, opt-in file; layout / spacing / typography / colour roles / container only; no radius / shadow / gradient / blur; no class names that collide with Tailwind.
- Q20/Q37 Modern CSS used directly, no fallbacks. `@property` only for typed/animated properties, `inherits: true` by default.
- Q39 Two entries: plain (`@layer xx.theme, xx.base, xx.components, xx.utilities;` at the top of every file) and `xx/tailwind.css` (tokens in `:root` + `@theme inline` aliases, radius/shadow namespace reset, components in Tailwind's `components` layer; no reset, no utilities).
- Q41 `!important` banned (except reduced-motion, with an inline comment explaining why).
- T3 Structural RTL: logical properties only (lint blocks left/right), directional glyphs flip via `:dir(rtl)`.

## 5. Browsers
- Q42 Floor C: last 2 versions of Chrome / Firefox / Safari (currently ~155 / 157 / 26.6). The 10 Limited features are banned (scroll-state queries, closedby, popover=hint, interpolate-size, customizable select, text-wrap pretty, scroll-driven animations, if(), typed attr(), @function); anchor positioning not yet allowed.
- Q44 Each minor pins a `browserslist` snapshot in the changelog; patches never raise the floor; newly available features land only in the next minor.
- Q43/Q46 Electron supported (Chromium ≥ the snapshot's minimum Chrome); Tauri / WebView not officially supported.

## 6. Ecosystem
- Q13/Q40 CLI 1.0: `init`, `theme check` (AA on 3 surfaces × 2 themes + CVD + hue collisions), `lint` (radius / shadow / gradient / blur classes in HTML / JSX / Vue / Svelte, off-token colours). `add` in 1.x; ESLint plugin after 1.0.
- T7 No CLI telemetry.
- Q14 Docs: custom Astro site (no Starlight), live examples + HTML / React / Vue / Svelte tabs, accent/preset playground. T4 Docs in English for 1.0, i18n-ready architecture.
- Q28 Optional `fonts` package: Inter + JetBrains Mono variable, Latin / Latin Ext / Vietnamese subsets, OFL; core only references `--font-sans` / `--font-mono` with system fallbacks; never auto-loads Google Fonts.
- Q38 Docs on Vercel + `<name>.dev`; CDN via jsDelivr / unpkg; GitHub Issues (existing triage labels) + Discussions; CONTRIBUTING + Code of Conduct; no Discord yet.

## 7. Repo & release
- Q23 GitHub org named after the brand (owner creates the org on the web — no API for it); Claude transfers the repo and uses the owner's logo.
- Monorepo pnpm + Turborepo + Changesets: `tokens`, `css`, `js`, `react`, `vue`, `svelte`, `cli`, `fonts`, `icons`, `apps/docs`, `apps/playground`.
- Q36 Merge the `design` repo via `git subtree` (history kept) → `spec/DESIGN.md` (rewritten for new name/accent), `brand/` (logo + guidelines); archive the old repo.
- Q24 Lockstep versions with Changesets; strict semver from 1.0; minors may break before 1.0; class renames go through a deprecation cycle.
- Q35 Prereleases `1.0.0-alpha/beta` on dist-tag `next`, unannounced.
- T5 Size budgets (CI fails when exceeded): CSS core + components ≤ 35 KB gz, utilities ≤ 10 KB, each JS module ≤ 3 KB, combobox / date picker / data grid ≤ 12 KB each.
- T6 Publish only from GitHub Actions with trusted publishing (OIDC) + provenance; mandatory 2FA; SECURITY.md; Renovate + lockfile.

## 8. Quality
- Q15 Checkbox / radio / switch are native inputs (`appearance: none`, glyph via `::before`, switch has `role="switch"`).
- Q25 WCAG 2.2 AA + WAI-ARIA APG; axe-core in CI, Playwright keyboard tests, contrast check (shared engine with `theme check`), VoiceOver / NVDA checklist before every minor.
- Q26 Playwright visual regression: theme × density × language (en / vi / ar) × 360px / desktop × Chromium / Firefox / WebKit (+ forced-colors). Vitest browser mode (mount → unmount → mount). Stylelint plugin blocks radius / shadow / gradient / blur / `!important` / left-right. Contrast for every token pair.
- T2 `@media (forced-colors: active)` for every component: selection/cursor uses `Highlight` / `HighlightText`, 2px rules become real borders, focus uses `CanvasText`.

## Open questions
None on design. Remaining items are actions, gated on the owner's final confirmation:
- Owner: trademark check for "Nib" (USPTO / WIPO, software class 9/42); buy `nib.dev` + `nib.design`; create npm org `nib-ui` and GitHub org `nib-ui` (web only; enable 2FA).
- Claude (authorised in Q23, after confirmation): transfer the repo to `nib-ui`, merge the `design` repo via `git subtree` into `spec/` + `brand/`, rewrite DESIGN.md / README for Nib + jade/ink-inversion accent, record key decisions as ADRs in `docs/adr/`.

## Follow-ups found while writing the spec (2026-10-24)
- **Resolved (ADR 9):** primary button = 2px ink border, transparent ground; hierarchy primary 2px → outline 1px → ghost; ink inversion means *chosen* and never makes an action stand out (pressed toggles and selected options may use it); destructive confirm = 2px red border; no filled-button exception for landing CTAs.
- Syntax colors retuned off teal: keyword `#a98fc0` / `#6e4f8a` (mauve), number `#c2a26f` / `#7d5f2c` (ochre); ≥ 4.5:1 on surface raised in both themes.
- Label line-heights raised for Vietnamese diacritics: `label-md` 12/18, `label-sm` 11/16.
- Vocabulary settled with GLOSSARY.md (2026-10-24): in a listbox / combobox / command palette the option under the keyboard is *current* (2px accent rule) and the selected value is the cursor block; the "highlighted" row state is renamed **flagged**; the `primary` color token is removed (the primary button's frame uses `on-surface`); surface "panel" is renamed **overlay** (`surface-overlay`); "side panel" is now **side column**.
- After the token-check prototype and Mobbin research (2026-10-24, ADR 10): primary button sits in the region's action row and never shares a row with a cursor block; cursor block only for single selection, multi-select = `[x]` + hover fill + bulk action bar; flagged rows always carry a word; type-to-confirm for permanent deletion of named resources; forms get an error summary, `OPTIONAL` marker (no asterisks), switch-vs-checkbox rule; knob-less `ON`/`OFF` switch kept (ON weight 500 on-surface, OFF on-surface 3, row hit area ≥ 44px); listbox current = accent rule + hover fill; disabled dates struck through; `COPY` → `COPIED ✓`; "On this page" current heading has a rule; `SKIP TO CONTENT` link. Jade rule on the ink block measured 3.52:1 (dark) / 3.78:1 (light).
- Monorepo tooling switched to Nx (2026-10-24, ADR 11, supersedes the tooling line of ADR 6): package-based Nx on pnpm workspaces; Nx Release with one fixed group `nib`, version plans, tag `v{version}`; `@nib-ui/core` published; `tools/` for color-engine, stylelint-plugin, nx-plugin; tag-based module boundaries + banned third-party imports in core/bindings; `nib:component` generator; Nx Cloud remote cache only (owner installed the Nx Cloud GitHub app on `nib-ui`), read-only cache for fork PRs, release rebuilds with `--skip-nx-cache`; OIDC provenance via `nx release publish` to be verified on the first alpha, `npm publish` fallback.
- Headless core architecture (2026-10-24, ADR 12) from four parallel designs: per-controller `createX(options?, host?)` with a uniform instance (`state`, `send → intents`, `part → {attrs, on}`, `update`, `subscribe`, `destroy`); only clock and geometry are seams; effects are returned intents; new `@nib-ui/dom` package holds all DOM code; locale from `<html lang>` with `en-US` core default; one toaster per page; IME composition events first-class; no public extension surface in 1.0 except a `keys` option.
- Nx workspace scaffolded (2026-10-24): Nx 24.0.1, TypeScript 6.0.3 (typescript-eslint does not support TS 7 yet), ESLint 10, Vitest 5, Node 24. Every project from ADR 11 exists as a stub; `@nib-ui/core` ships `NibError`. Workspace dependencies between packages are added when code first imports them (the dependency check rejects unused ones). Boundary rules verified by deliberate violations. First version plan is `premajor`, released with `--preid=alpha` → `1.0.0-alpha.0`. `nxCloudId` not set yet: needs `nx connect` by the owner.
- 1.0 roadmap grilled (2026-10-24), see `docs/project-roadmap.md`: five milestones M0 Foundation → M1 CSS → M2 Controllers → M3 Heavy controllers (beta) → M4 Ecosystem (rc → 1.0), each ending in a prerelease on `next`; listbox vertical slice closes M0 and `1.0.0-alpha.0` is published early to test OIDC provenance; full definition of done (incl. VR matrix) from the first component, VR full matrix on affected PRs + nightly on `main`, baselines from the Playwright Docker image; all four bindings ship with each controller; 30 components (18 CSS-only, 12 interactive), slider to 1.x; four presets (docs, dashboard, blog, landing), shop/portfolio to 1.x; docs and playground from M1 (docs skeleton pulled into M0 for the slice), playground under `/play`; minimal icons and fonts moved to M1; Renovate, community files, Prettier + lint-staged in M0; gates: beta = all components + budgets + APG green, rc = VoiceOver/NVDA + docs + browserslist snapshot + community files, 1.0 = two weeks of rc with no open `blocker`; milestones + labels, no epics, no project board, no dates. Issues #5–#66 created (M2–M4 as `needs-triage` skeletons).
- Light hues retuned for tags (2026-10-24): `color-engine` gained the rule "hue text on its own `-soft` fill over all three surfaces ≥ 4.5:1"; the light green, blue, cyan and magenta failed it (4.16–4.41:1 on raised/overlay). Each was darkened only in OKLCH L (hue and chroma kept, hue shift ≤ 0.3° from hex rounding) to the lightest value that passes: green `#537126` → `#4e6b20`, blue `#2a60d6` → `#255ad0`, cyan `#156f93` → `#09698d`, magenta `#8c46bb` → `#8741b6`. Side effect: accent-vs-green CVD warnings drop from three to two (light protan gone; deutan 9.1, tritan 8.8). Dark hues, light red and yellow unchanged.
- Visual regression platform (2026-10-24, ADR 7 amendment): baselines made and compared in the Playwright Docker image on linux/arm64, locally (`pnpm update-snapshots`) and in CI (`ubuntu-24.04-arm` + container). Chosen over amd64 because QEMU amd64 emulation on Apple silicon made Chromium return NaN contrast to axe; x86 contributors rely on CI diffs. Size budgets now live in `size-budgets.json` at the root (gzip), read by each package's `.size-limit.js` and re-exported by `@nib-ui/test-harness`.
- `@nib-ui/dom` adapters (2026-10-24, #20): `runIntents()` runs intents in order and returns those whose element is missing (a binding that runs them before commit sees it); focus uses no `preventScroll`. `announce()` keeps one polite (`role=status`) and one assertive (`role=alert`) region per document, visually hidden through CSSOM (allowed by a strict `style-src`), empties then writes after 100 ms on core's `Clock` so a repeated message is spoken again, and a newer message cancels a pending one; while a modal `<dialog>` is open the region moves inside the topmost one (everything else is inert). `toNibEvent()` reads events by shape, not `instanceof`, so iframe events work; it treats `keyCode 229` as composing (Safari's IME keydown). `domGeometry().watch` is batched to one call per animation frame. Size budgets are now measured with `@size-limit/esbuild` (entry bundled with dependencies, minified, gzipped), because `@size-limit/file` only measured the entry file and missed re-exported modules.

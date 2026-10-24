# Browser support floor for no-fallback CSS (snapshot 2026-10-23)

## Sources and method

- Baseline status and dates: `web-features@3.44.0` (npm), the dataset behind webstatus.dev. https://github.com/web-platform-dx/web-features , https://webstatus.dev
- Per-engine first versions: MDN `@mdn/browser-compat-data@8.1.7` (npm). https://github.com/mdn/browser-compat-data . Conflicts resolved to the later (conservative) version.
- Global usage: `caniuse-lite@1.0.30001819` (published 2026-10-22). Usage shares only; threshold math is mine. https://caniuse.com
- Current versions: Chrome stable 156 (Oct 20), Firefox 158 (Oct 13), Safari 26.6 latest 26.x minor, Safari 27 released Sep 2026 with iOS 27 (Sep 14, reported). Chrome and Firefox moved to 2-week cycles in Sep 2026. Sources: https://www.elevenforum.com/t/google-chrome-will-move-to-a-two-week-release-cycle-starting-september-2026.45016/latest (secondary), https://developer.mozilla.org/docs/Mozilla/Firefox/Releases/156 , https://developer.apple.com/documentation/safari-release-notes/safari-27-release-notes , https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-saf
- Baseline rules: Newly = shipped in all 3 engines, `low` status, ~30 months. Widely = Newly + 30 months ("Widely due" column).

## 1. Feature matrix (first version shipped)

| #   | Feature                                                                  | Baseline | Newly since | Widely due   | Chrome/Edge | Firefox         | Safari (macOS) | iOS Safari | Global % (approx) |
| --- | ------------------------------------------------------------------------ | -------- | ----------- | ------------ | ----------- | --------------- | -------------- | ---------- | ----------------- |
| 1   | `@layer`                                                                 | Widely   | 2022-03-14  | (2024-09-14) | 99          | 97              | 15.4           | 15.4       | 89.2              |
| 2   | `@container` size                                                        | Widely   | 2023-02-14  | (2025-08-14) | 105         | 110             | 16             | 16         | 88.7              |
| 3   | `@container` style queries                                               | Newly    | 2026-05-19  | 2028-11-19   | 111         | 151             | 18             | 18         | 85.6              |
| 4   | `@container` scroll-state                                                | Limited  | -           | -            | 133         | no              | no             | no         | 65.0              |
| 5   | `:has()`                                                                 | Widely   | 2023-12-19  | (2026-06-19) | 105         | 121             | 15.4           | 15.4       | 88.7              |
| 6   | CSS nesting                                                              | Widely   | 2023-12-11  | (2026-06-11) | 120         | 117             | 17.2           | 17.2       | 85.9              |
| 7   | `color-mix()`                                                            | Widely   | 2023-05-09  | (2025-11-09) | 111         | 113             | 16.2           | 16.2       | 87.6              |
| 8   | `oklch()`                                                                | Widely   | 2023-05-09  | (2025-11-09) | 111         | 113             | 15.4           | 15.4       | 88.0              |
| 9   | Relative color syntax                                                    | Newly    | 2024-09-16  | 2027-03-16   | 125         | 128             | 18             | 18         | 84.3              |
| 10  | `light-dark()`                                                           | Newly    | 2024-05-13  | 2026-11-13   | 123         | 120             | 17.5           | 17.5       | 85.3              |
| 11  | `@property`                                                              | Newly    | 2024-07-09  | 2027-01-09   | 85          | 128             | 16.4           | 16.4       | 88.3              |
| 12  | `<dialog>`                                                               | Widely   | 2022-03-14  | (2024-09-14) | 37          | 98              | 15.4           | 15.4       | 89.3              |
| 13  | `<dialog closedby>`                                                      | Limited  | -           | -            | 134         | 141             | preview        | no         | 66.9              |
| 14  | `popover` (auto/manual)                                                  | Newly    | 2025-01-27  | 2027-07-27   | 114         | 125             | 17             | 18.3       | 85.4              |
| 15  | `popover="hint"`                                                         | Limited  | -           | -            | 151         | 153             | no             | no         | 63.8              |
| 16  | Invoker commands (`command`/`commandfor`)                                | Newly    | 2025-12-12  | 2028-06-12   | 135         | 144             | 26.2           | 26.2       | 80.3              |
| 17  | Anchor core (`anchor-name`, `position-area`, `position-try`, `anchor()`) | Newly    | 2026-01-13  | 2028-07-13   | 125-129     | 147             | 26             | 26         | 81.1              |
| 18  | `position-anchor`                                                        | Newly    | 2026-09-14  | 2029-03-14   | 151         | 151             | 27             | 27         | 64.6              |
| 19  | `@scope`                                                                 | Newly    | 2026-03-24  | 2028-09-24   | 143*        | 146             | 26.4           | 26.4       | 81.4              |
| 20  | `@starting-style`                                                        | Newly    | 2024-08-06  | 2027-02-06   | 117         | 129             | 17.5           | 17.5       | 85.9              |
| 21  | `transition-behavior: allow-discrete`                                    | Newly    | 2024-08-06  | 2027-02-06   | 117         | 129             | 17.4           | 17.4       | 86.0              |
| 22  | `interpolate-size` / `calc-size()`                                       | Limited  | -           | -            | 129         | no              | no             | no         | 65.3              |
| 23  | `field-sizing`                                                           | Newly    | 2026-06-16  | 2028-12-16   | 123         | 152             | 26.2           | 26.2       | 81.1              |
| 24  | Customizable `<select>` (`appearance: base-select`)                      | Limited  | -           | -            | 135         | flag only (149) | 27             | 27         | 65.6              |
| 25  | `text-wrap: balance`                                                     | Newly    | 2024-05-13  | 2026-11-13   | 114         | 121             | 17.5           | 17.5       | 86.4              |
| 26  | `text-wrap: pretty`                                                      | Limited  | -           | -            | 117         | no              | 26             | 26         | 80.3              |
| 27  | Logical properties                                                       | Widely   | 2021-09-20  | (2024-03-20) | 87          | 63              | 14.1           | 14.5       | 89.3              |
| 28  | `:user-invalid`                                                          | Widely   | 2023-11-02  | (2026-05-02) | 119         | 88              | 16.5           | 16.5       | 86.9              |
| 29  | View transitions (same-document)                                         | Newly    | 2025-10-14  | 2028-04-14   | 111         | 144             | 18             | 18         | 85.7              |
| 30  | Scroll-driven animations                                                 | Limited  | -           | -            | 115         | no (BCD: 159)   | 26             | 26         | 80.5              |
| 31  | `:focus-visible`                                                         | Widely   | 2022-03-14  | (2024-09-14) | 86          | 85              | 15.4           | 15.4       | 89.2              |
| 32  | `inert`                                                                  | Widely   | 2023-04-11  | (2025-10-11) | 102         | 112             | 15.5           | 15.5       | 89.2              |
| 33  | `<details name>` (exclusive)                                             | Newly    | 2024-09-03  | 2027-03-03   | 120         | 130             | 17.2           | 17.2       | 85.5              |
| 34  | `::details-content`                                                      | Newly    | 2025-09-16  | 2028-03-16   | 131         | 143             | 18.4           | 18.4       | 83.5              |
| 35  | CSS `if()`                                                               | Limited  | -           | -            | 137         | no              | no             | no         | 64.5              |
| 36  | Typed `attr()`                                                           | Limited  | -           | -            | 133         | 155             | preview        | no         | 66.8              |
| 37  | `sibling-index()`                                                        | Newly    | 2026-08-18  | 2029-02-18   | 138         | 154             | 26.2           | 26.2       | 79.8              |
| 38  | `text-box-trim`                                                          | Newly    | 2026-08-18  | 2029-02-18   | 133         | 154             | 18.2           | 18.2       | 83.5              |
| 39  | `@function`                                                              | Limited  | -           | -            | 139         | no              | preview        | no         | 64.2              |

Notes:

- `*` @scope conflict: BCD and caniuse say Chrome 118 and Safari 17.4. webstatus and BCD-later say Chrome 143 and Safari 26.4. Conservative values used.
- Logical properties: BCD per-property versions used (Chrome 87, Firefox 63, Safari 14.1, iOS 14.5). Caniuse-lite marks legacy partial support, so it is not used for floors.
- Global % = share of tracked usage on the engine-version threshold above, from caniuse-lite. Covers Chrome, Android Chrome, Firefox, Android Firefox, Safari, iOS Safari. Excludes Edge-only, Samsung, Opera. Approximate.
- Caniuse-lite lacks support tables for color-mix, light-dark, @property, popover, starting-style, field-sizing, text-wrap pretty, and others. BCD is the authority for those.

## 2. Candidate support floors

| Floor                                      | Chrome/Edge | Firefox | Safari | iOS Safari | Features allowed (of 39)                   | Global % covered |
| ------------------------------------------ | ----------- | ------- | ------ | ---------- | ------------------------------------------ | ---------------- |
| A. Baseline Widely                         | 120         | 121     | 17.2   | 17.2       | 11 (#1, 2, 5, 6, 7, 8, 12, 27, 28, 31, 32) | 85.7             |
| B-full. Baseline Newly (all)               | 151         | 154     | 27     | 27         | 28 + #18 = 29                              | 64.5             |
| B'. Baseline Newly minus `position-anchor` | 143         | 154     | 26.4   | 26.4       | 28                                         | 78.4             |
| C. Latest 2 versions                       | 155         | 157     | 26.6   | 26.6       | 28 (same set as B', but 55% coverage)      | 55.2             |

Floor A rises on 2026-11-13: `light-dark()` and `text-wrap: balance` become Widely. New floor = Chrome 123, Firefox 121, Safari 17.5.

Features forbidden under any no-fallback floor (limited in at least one engine): #4 `scroll-state`, #13 `closedby`, #15 `popover=hint`, #22 `interpolate-size`/`calc-size()`, #24 customizable select, #26 `text-wrap: pretty`, #30 scroll-driven animations, #35 `if()`, #36 typed `attr()`, #39 `@function`.

## 3. Ranking (with trade-offs)

1. **B' (Baseline Newly minus `position-anchor`): recommended.** Chrome 143, Firefox 154, Safari/iOS 26.4. Covers 78% of usage with 28 features. Losing `position-anchor` is cheap, since anchor-name, position-area and position-try already cover implicit anchoring. Adoption risk: newly shipped features still churn. Example: `position-try-options` was renamed to `position-try-fallbacks` (Chrome 125-127). Pin the features and re-check Baseline quarterly.
2. **A (Baseline Widely): safest, lowest value.** 85.7% coverage but only 11 of 39 features. Use if the policy is "zero churn". Floor moves to Chrome 123 / Safari 17.5 on Nov 13.
3. **B-full: not worth it.** +1 feature (`position-anchor`) for a Safari 27/iOS 27 floor. Coverage drops to 64.5%; iOS coverage collapses (about 4.5% of iOS users on 27 in caniuse-lite snapshot).
4. **C (latest 2): dominated.** Same feature set as B' with lower coverage (55%). Requires Chrome 155 and Firefox 157 for no gain.

## 4. iOS Safari gotchas

- iOS floor = Safari floor only in theory. iOS minor updates lag and iOS 27 is new (about 4.5% of iOS usage in the snapshot). Use iOS 26.4 as the floor, not 27.
- `popover`: Baseline date is set by iOS 18.3 (macOS Safari 17). iOS 17.0-18.2 lack it. Under floors A-C no issue.
- `position-anchor`: Safari 26.x ships partial behavior (`position-anchor` initial value is `auto`, not `normal`). Chrome 125-150 had the same initial-value bug. Full behavior only from Safari 27 / Chrome 151. Avoid relying on initial values.
- Device caps (not re-verified against Apple's table): iPhone XS/XR max iOS 18 (no iOS 26). iPhone 8/X max iOS 16 (no iOS 17+). Floors B', C and B-full exclude XS/XR; floor A excludes 8/X as well. Source for XS/XR: https://9to5mac.com/2025/07/24/ios-26-supports-these-recent-iphones-but-drops-three-models/
- Safari has no `closedby`, `popover="hint"`, `if()`, `@function`, or typed `attr()` (preview only). Any use of these is a hard fail on iOS.
- `text-box-trim` and `sibling-index()` arrive on iOS 18.2 and 26.2 respectively, but Firefox only 154. Mixed-engine ship dates drive the floor.

## 5. Limitations

- Chrome 156 / Firefox 158 "current" versions come from release-schedule sources, one of them a forum relaying a table. Not confirmed on official release blogs.
- Safari 27 final release is reported (iOS 27 on Sep 14), but no primary Apple release page was readable (title only). Safari 27 data is from web-features/BCD, which imply shipping.
- webstatus.dev API returned partial data. Baseline status was read from the web-features package it is built on.
- Edge not evaluated separately (Chromium). Samsung Internet and Opera excluded from usage math.
- Did not verify whether the framework targets browsers or an embedded runtime (Electron/Tauri/WebView). If embedded, the floor becomes the bundled engine version, and this report's ranking changes.
- Global % is approximate, based on caniuse-lite snapshot and my thresholds.

## Unresolved questions

1. Target runtime: plain browser, Electron, Tauri, or other WebView? Determines whether the floor is a browser version or a bundled engine version.
2. Is `position-anchor` essential? If yes, floor is B-full (Safari/iOS 27) and iOS 26 users are dropped.
3. Confirm @scope first shipping version in Chrome (118 vs 143). Changes B' Chrome floor from 143 to 138 (sibling-index).
4. Confirm Chrome 156 and Firefox 158 as current stable on official channels; re-verify before publishing.
5. Confirm Safari 27 final release date and minimum iOS 27 build from Apple's notes.
6. Does the team accept "no fallback" for limited features in a single-engine path (e.g., progressive enhancement for `if()`) or strict no-fallback only?

Status: DONE_WITH_CONCERNS (version conflicts on @scope, unverified current versions, runtime target unknown).

# Brand name round 3 (relaxed scope rule), 2026-10-24

## Method

- Scripts: scratchpad `r3.sh`, output `r3_out.txt` (extends round-2 `paced.sh`/`dom.sh`).
- npm scope: `GET registry.npmjs.org/-/org/<s>/package` (404 free, 200 taken; covers user scopes). Checked `<n>-ui`, `<n>ui`, bare `<n>`; 429 backoff.
- GitHub: `gh api users/<s>` for `<n>-ui`, `<n>ui`, `<n>` (404 free).
- Domains: .dev via pubapi.registry.google RDAP; .design via rdap.org; .sh via whois.nic.sh. Fallback `<n>ui.dev`, `<n>-ui.dev` (.dev RDAP).
- CLI: `command -v` + formulae.brew.sh + npm registry `bin` field. Conflicts: `gh search repos --match name --sort stars`, npm registry metadata. Bare-scope dormancy: npm org package list + GH user `updated_at`.
- Vietnamese / other-language meanings: from memory, NOT web-verified.
- Nothing registered. Free = no claim made, availability can change.

## Table

Y = free, N = taken. Domains: D=.dev, S=.design, H=.sh (free letters only). Fallback = `<n>ui.dev` / `<n>-ui.dev` both free (all names).

| name    | fit                                                                       | @n-ui        | @nui | GH n-ui       | domains free                           | bare @n / GH n dormant?                                                  | CLI bin                               | brand conflicts                                                               | score |
| ------- | ------------------------------------------------------------------------- | ------------ | ---- | ------------- | -------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------- | ----- |
| nib     | pen point = where ink lands = the cursor; filled cell = nib mark          | Y            | Y    | Y             | D, S (+fallback)                       | @nib ACTIVE (10 pkgs, 2026-09, corp); GH nib dormant since 2022, 0 repos | none                                  | stylus/nib 1.9k* (CSS mixins, dead 2022); Nib Health (AU insurer); .nib files | 8     |
| caret   | literal text cursor; ^ insertion mark                                     | Y            | Y    | Y             | S (+fallback)                          | @caret EMPTY (0 pkgs); GH caret dormant since 2022                       | none                                  | caret R pkg 1.7k*; Caret editor; CSS `caret-color` SEO noise                  | 7.5   |
| stet    | proof mark "let it stand": the one confirmed thing, pure typesetter craft | Y            | Y    | Y             | fallback only (.dev/.design/.sh taken) | @stet EMPTY; GH stet ACTIVE (65 repos, 2026-07)                          | none                                  | none notable (stetho unrelated)                                               | 7.5   |
| tick    | tick mark, cursor blink tick                                              | Y            | Y    | Y             | fallback only                          | @tick EMPTY; GH tick quiet since 2024                                    | none (brew none)                      | generic; Tick time-tracker; node tick-processor                               | 6     |
| tittle  | the dot on i/j, smallest ink mark; typographic                            | Y            | Y    | Y             | D taken; S, H free                     | @tittle 1 pkg (2026-03); GH dormant since 2016                           | none                                  | none; but "title" misspelling, "tit" substring                                | 5.5   |
| notch   | cut/step; weak ink link                                                   | Y            | Y    | Y             | fallback only                          | @notch EMPTY; GH dormant 2019                                            | npm `notch` bin                       | iPhone notch; Minecraft Notch                                                 | 5     |
| marker  | highlighter/ink                                                           | Y            | N    | Y (nui taken) | fallback only                          | @marker n/a (not parsed) ; GH marker dormant 2022                        | npm `marker` bin                      | marker.js, many                                                               | 5     |
| folio   | page/leaf, typographic                                                    | Y            | Y    | Y             | fallback only                          | @folio old (FOLIO lib system, 2018)                                      | npm `folio` bin (Playwright ancestor) | many Folio brands                                                             | 5     |
| pica    | typographic unit                                                          | Y            | Y    | Y             | fallback only                          | GH pica org dormant 2015                                                 | none                                  | nodeca/pica; "pica" = eating disorder                                         | 5     |
| jot     | quick note mark                                                           | Y            | Y    | Y (nui taken) | S (+fallback)                          | GH dormant                                                               | BSD `jot` Unix cmd + brew formula     | Jot apps                                                                      | 3     |
| quill   | pen                                                                       | Y            | Y    | N             | fallback                               | n/a                                                                      | brew formula quill                    | Quill editor (huge)                                                           | 3     |
| inkwell | ink source                                                                | Y            | Y    | N             | fallback                               | n/a                                                                      | none                                  | 7 letters, weak cursor                                                        | 4     |
| kern    | spacing craft                                                             | N (@kern-ui) | Y    | Y             | fallback                               | n/a                                                                      | none                                  | npm scope taken                                                               | 3     |
| mote    | speck                                                                     | N            | Y    | N (n-ui)      | fallback                               | n/a                                                                      | none                                  | scope taken                                                                   | 2     |
| cursor  | literal                                                                   | Y            | Y    | Y             | fallback                               | n/a                                                                      | none                                  | Cursor AI editor (strong)                                                     | 2     |
| ink     | ink                                                                       | Y            | N    | N             | none                                   | all taken                                                                | none                                  | Ink = React CLI renderer                                                      | 1     |
| mark    |                                                                           | N            | N    | N             | none                                   |                                                                          | brew `mark`                           |                                                                               | 1     |
| glint   |                                                                           | N            | N    | N             | none                                   |                                                                          |                                       | Glint (Ember)                                                                 | 1     |
| pin     |                                                                           | Y            | Y    | N             | none (.dev,.design taken)              |                                                                          |                                       |                                                                               | 1     |
| point   |                                                                           | Y            | Y    | N             | none                                   |                                                                          |                                       |                                                                               | 1     |

\* stars from `gh search`.

## Top 5

1. **nib** — the pen's point is the cursor; the filled cell is a nib touching the ruled grid. Only name with .dev AND .design free. `@nib-ui/css`, `@nib-ui/tokens`, github.com/nib-ui, nib.design (also nib.dev). Tagline: "Nib — A calm CSS framework for one precise mark at a time." Caveat: @nib is an active corporate npm scope, GH `nibui` taken, stylus/nib is stale but CSS-adjacent.
2. **caret** — the exact text-cursor; most direct story, "the one current position". `@caret-ui/css`, github.com/caret-ui, caret.design (fallback caret-ui.dev). Tagline: "Caret — Interface styles that know where you are." Caveat: .dev taken, search noise from `caret-color` and R caret.
3. **stet** — typesetter's "let it stand"; best craft/devotion fit, no brand conflict. `@stet-ui/css`, github.com/stet-ui, stet-ui.dev (stetui.dev). Tagline: "Stet — Interface styles worth leaving as they are." Caveat: no clean .dev/.design/.sh; GH `stet` user active.
4. **tick** — blink/tick mark, short, easy. `@tick-ui/css`, github.com/tick-ui, tick-ui.dev. Tagline: "Tick — One current thing, drawn with care." Generic, weak SEO.
5. **tittle** — smallest ink dot, most typographic. `@tittle-ui/css`, github.com/tittle-ui, tittle.design / tittle.sh. Tagline: "Tittle — Small marks, set with care." Fails spelled-right-after-hearing-once (title).

## Unresolved questions

- Is the active `@nib` corporate scope (and `nibui` GH) a blocker? Request via npm dispute is unreliable.
- Accept fallback-only domains (stet-ui.dev) for stet/caret-less cases, or require a bare domain?
- Vietnamese/other-language meanings unverified by web search; confirm with a native speaker.
- Empty bare scopes (@caret, @stet, @tick, @notch) are held by someone with 0 public packages; owner activity unknown.
- Fit-in-JetBrains-Mono rendering not tested (nib, stet, caret contain no ll/il/rn).

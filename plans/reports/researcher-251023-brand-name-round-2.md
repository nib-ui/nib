# Brand name round 2 — availability research (2026-10-23)

## Headline finding
~300 real English words screened on npm scope first (the hardest gate). **Only ~30 were free; almost every short evocative word is already an npm scope or user** (nib, tick, mark, kern, slug, bead, pin, notch, glint, mote, wick, tittle, blot, jot, dab, pip, stylus, platen, sumi, nub, swash, serif, caret, carat, ink, inkwell, here, now, cell, dot, dash, block, solid, cursor, cursive, current, nonce, ebon, inky, monad, kairos, solus, probe, spike, lantern, halo, nimbus, votive, vestal, signet, pharos, obelisk, ... all TAKEN). Prior-round words re-checked under new criteria: stet, folio, pica, quire, rubric, pilcrow, gutter, ledger, ruler, caret, verso, lede, tally, blink, quill — **all npm scope TAKEN** -> still dead.
Surviving pool is thin and obscure. Best fits are medium (6-7/10), none perfect.

## Method
- npm scope+user: `GET registry.npmjs.org/-/org/<n>/package` (404 = free; 200 = taken). Verified the endpoint also returns 200 for a *user* scope (sindresorhus), so it covers org+user in one check. npmjs.com/~<n> is Cloudflare-blocked (403), not usable. 429s handled with retry-after backoff (paced ~3s/req).
- GitHub: `gh api users/<n>` and `users/<n>-ui` (404 = free).
- Domains: .dev via pubapi.registry.google RDAP (404 free); .design via `rdap.org -L` (404 free); .sh via `whois -h whois.nic.sh` ("Domain not found" = free; rdap.org has no .sh data, 404 there is meaningless); .com via rdap.org -L.
- Shell: `command -v`, formulae.brew.sh formula API. Conflicts: `gh search repos <n> --sort stars`.
- Scripts/outputs: scratchpad `chk.sh dom.sh paced.sh paced_out.txt dom_out.txt` (dir given in task).

## Table (survivors of npm gate + notable rejects)
Legend: Y=free, N=taken/registered. GH column: org `<n>` taken in ALL cases below; `<n>-ui` free = Y. Domains = .dev/.design/.sh. All survivors: .com N (registered, OK), no shell binary, no brew formula unless noted.

| name | idea | syl | @scope+npm user | GH -ui | .dev/.design/.sh | conflicts | Viet/other | wordmark | score |
|---|---|---|---|---|---|---|---|---|---|
| obverse | front face of a coin; the inverted/flip side = ink-inverted cell | 2 | Y | Y | N/Y/Y | tiny dead repos only | clean; Latin root | o-b-v-e-r-s-e fine, no bad pairs | 7 |
| extant | still existing, currently there = the one current thing | 2 | Y | Y | N/Y/Y | tiny unrelated repos | clean | x,t,a,n,t clear | 7 |
| breve | the small mark over one letter (also Vietnamese ă) | 1-2 | Y | Y | N/Y/Y | Brevent (Android app) unrelated; "breve"=short in IT/PT/ES (good) | great for VN readers | clean; pronunciation breev/brev ambiguous | 6.5 |
| frisket | printing mask that decides where ink lands | 2 | Y | Y | N/Y/Y | frisket-dev (22 stars, AI spreadsheet), tiny CLI | clean | clean, "frisk" vibe | 6 |
| sconce | one steady flame fixed on a wall = the one lit thing | 1 | Y | Y | N/Y/Y | sconce (ML compression, 45 stars) | clean | clean; spelling hard after hearing | 5.5 |
| fealty | sworn devotion | 2 | Y | Y | Y/Y/Y | tiny game repos | clean | l next to t ok | 5 (no cursor/ink idea) |
| cresset | iron fire-basket, one flame | 2 | Y | Y | N/Y/Y | cresset-template (718 stars, PyTorch) | clean | ok | 4 |
| engross | to write fair copy; absorb attention | 2 | Y | Y | Y/Y/Y | none | "gross" reads badly | ok | 4 |
| breve-like: macron | diacritic | 2 | Y | Y | N/Y/Y | = French president | n/a | - | 2 |
| menhir | single standing stone | 2 | Y | Y | N/Y/Y | **Menhir (OCaml parser generator, brew formula)** | - | - | 3 DQ |
| inset | cell set inside grid | 2 | Y | N (inset-ui taken) | N/N/N | **CSS `inset` property** | - | - | 1 DQ |
| tympan | press padding sheet | 2 | Y | Y | Y/Y/Y | Tympan hearing aid lib | hard spelling | - | 3 |
| quillon, fusain, dibble, indite, nibs, couplet, punto, plumbob, thither | marginal fits | - | Y | - | - | indite~indict; dibble d/b clash; nibs plural + .sh taken; punto not English | - | - | <=3 |
| caret, stet, folio, pica, quire, rubric, pilcrow, gutter, ledger, ruler, verso, lede, tally, blink, quill, nib, tick, mark, kern, slug, bead, pin, notch, glint, mote, wick, tittle, blot, jot, dab, pip, ink, cursor, cursive, current, nonce, solid, monad, kairos, ebon, halo, votive | - | - | **N** | - | - | - | - | - | out |

## Top 6
1. **obverse** — Obverse — the page, and its other side: one cell inked in. (flip side = ink-inverted cell)
2. **extant** — Extant — only what is here, set exactly. (the one current thing)
3. **breve** — Breve — a small mark, placed with care. (nod to Vietnamese ă; "short")
4. **frisket** — Frisket — decide where the ink falls. (printer's mask; ink)
5. **sconce** — Sconce — one steady light on a ruled wall. (calm, devoted, single flame)
6. **fealty** — Fealty — devoted to the line and the grid. (devotion only; weakest on cursor idea)

Recommendation: obverse or extant. Both clean on languages, wordmark, conflicts; obverse maps to ink-inversion, extant to "the one current thing". If neither lands, the scope requirement is what kills quality: consider relaxing it (e.g. publish under `@<name>-ui`/unscoped `<name>-ui`, or accept a scope held by a dead account) — every strong word (nib, tick, mark, kern, caret, quill...) fails only on scope.

## Unresolved questions
- Should scope be relaxed? Without that, pool is ~6 obscure words.
- npm user check via npmjs.com/~ blocked; relied on org endpoint covering user scopes (verified with sindresorhus). Confidence ~90%.
- `.dev` taken for top 4; `.design` + `.sh` free (whois .sh result is "Domain not found", confidence ~90%). Premium/reserved status not checked.
- GitHub `<n>` org taken for all; unknown whether those accounts are dormant (transfer possible via GitHub name-squatting policy).
- No trademark search done (class 9/42), only GitHub star-sorted search; no web search engine used.

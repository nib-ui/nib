# Brand name round 4 — retro words + deities/mythic figures

## Method

- Scripts: scratchpad `r3.sh` (round 3, unchanged); 43 + 10 candidates, names already in `seen.txt` (487) skipped (ditto, forme, frisket, galley, platen, quoin, sort, tympan, vesper, etc.).
- npm scope: `registry.npmjs.org/-/org/<s>/package` (404 free) for `<n>-ui`, `<n>ui`, `<n>`; 429 backoff (slow, ~25 min for 53 names). GitHub: `gh api users/<s>`. Domains: .dev (pubapi.registry.google RDAP), .design (rdap.org), .sh (whois.nic.sh).
- Conflicts: `gh search repos --match name --sort stars`, `npm view`, `command -v`, formulae.brew.sh. Web search returned nothing useful for these names (used only to confirm no UI lib hit).
- Vietnamese/other-language meanings and mythology facts: from memory, NOT web-verified. Nothing registered. Free = no claim made.
- Rule applied: pass = `@n-ui` free AND GH `n-ui` free AND one of .dev/.design/.sh free.

## Screen result

Failed scope/GH/domain (no survivor): ribbon, carbon, stencil, kern, janus (all `@n-ui` taken); sia, eos (`@n-ui` taken); thoth/mimeo/telex/ticker/slug pass only on thin domains and have story or conflict issues (below); kairos, tyche, nabu, hestia, clio, saga (GH `n-ui` org taken); ptah, maat, khepri, ogma, abacus, quire, rubric, relay, cicero, vesta, heka (all three domains taken); cangjie disqualified (Huawei "Cangjie" programming language + HK input method).

## Table

Y=free. Domains D=.dev S=.design H=.sh. Fallback `<n>ui.dev`/`<n>-ui.dev` free for all names unless noted.

| name                  | dir | story                                                       | syl           | @n-ui/@n           | GH n-ui                             | domains free | CLI                                 | conflicts                                                                | sensitivity                 | CSS prefix | score |
| --------------------- | --- | ----------------------------------------------------------- | ------------- | ------------------ | ----------------------------------- | ------------ | ----------------------------------- | ------------------------------------------------------------------------ | --------------------------- | ---------- | ----- |
| nib (ref)             | -   | pen point where ink lands = cursor                          | 1             | Y/ @nib active     | Y                                   | D,S          | none                                | stylus/nib, Nib Health                                                   | none                        | `nib-`     | 8     |
| nisaba                | B   | Sumerian patron of writing, reed stylus, measuring          | 3 (ni-sa-ba)  | Y / @nisaba taken  | Y (GH `Nisaba` user active)         | S,H          | none                                | google-research/nisaba 54* (script FST lib); npm `nisaba` book CLI 0.1.0 | ancient, no living cult     | `nis-`     | 6.5   |
| nidaba                | B   | older reading of Nisaba                                     | 3             | Y / Y              | Y                                   | D,S,H all    | none                                | OpenPhilology/nidaba 90* (OCR pipeline)                                  | same                        | `nid-`     | 6.5   |
| ogham                 | B   | Irish tally script: strokes notched along a ruled stem line | 2             | Y / @ogham taken   | Y (GH `ogham` = exa author, active) | S,H          | none (npm `ogham` string converter) | ogham/exa 24k* is the person's handle, not a product                     | script, low; Celtic revival | `ogh-`     | 6     |
| seshat                | B   | scribe goddess; stretches the cord to measure/rule          | 2             | Y / @seshat taken  | Y (GH dormant 2021, 0 repos)        | S,H          | none                                | matrix-org/seshat 128*, falvaro/seshat 699* (math parser)                | ancient                     | `ses-`     | 5.5   |
| pilcrow               | A   | ¶ paragraph mark = "a new thing begins here"                | 2             | Y / @pilcrow taken | Y                                   | H only       | none                                | pilcrowonpaper (Lucia auth author) handle; pilcrowmd 58*                 | none                        | `pil-`     | 5.5   |
| didot                 | A   | Didot point, typographic unit                               | 2             | Y / Y(@didot free) | Y                                   | D,H          | none                                | Didot font (Apple), zig engine 90*                                       | none                        | `did-`     | 5     |
| deckle                | A   | rough paper edge                                            | 2             | Y / taken          | Y                                   | H            | none                                | deckle macOS 29*                                                         | none                        | `dec-`     | 4.5   |
| bragi                 | B   | Norse poetry god                                            | 2             | Y / taken          | Y                                   | S,H          | none                                | npm `bragi` logger, Bragi earbuds                                        | Norse revival               | `bra-`     | 4     |
| hemera                | B   | Greek Day                                                   | 3             | Y / taken          | Y                                   | S,H          | none                                | hemerajs 808*                                                            | low                         | `hem-`     | 4     |
| thoth                 | B   | Egyptian scribe/ibis                                        | 1             | Y / taken          | Y                                   | S            | none                                | many Thoth tools                                                         | pronunciation (th/t)        | `th-`      | 4     |
| mimeo                 | A   | mimeograph                                                  | 3             | Y / taken          | Y                                   | S,H          | none                                | mimeo AI-skill repo 285*, Mimeo.com                                      | none                        | `mim-`     | 3.5   |
| telex / ticker        | A   | teleprinter / stock ticker                                  | 2             | Y                  | Y                                   | S            | none                                | generic, anti-cursor (finance)                                           | none                        | -          | 3.5   |
| nanshe, brigid, tyche | B   | various                                                     | -             | Y                  | Y                                   | S,H          | none                                | brigid/tyche misspell on hearing; Brigid living tradition                | brigid sensitive            | -          | <=3   |
| hairline              | A   | thinnest stroke                                             | 2 (8 letters) | Y/Y                | Y                                   | D,S,H all    | none                                | 8 letters (over 3-7)                                                     | none                        | `hl-`      | 5     |
| carriage, colophon    | A   | typewriter carriage = moving cursor; book imprint           | 3             | Y                  | Y                                   | S,H / H      | none                                | 8-letter                                                                 | none                        | -          | 4     |

Hacker/CRT-pulling (against brief): ticker, telex, tape, relay, core, register, punch-card, carbon (also `@carbon-ui` is IBM), ribbon-as-printer (mild). Calm-craft: pilcrow, didot, deckle, hairline, quire, colophon, rubric.
Crowded mythology in tech: Apollo, Athena, Hermes, Atlas, Janus (Henderson, JanusGraph), Kairos (Kairos Power), Thoth, Iris. Living religions to avoid: Sarasvati, Benzaiten, Brigid (Catholic/Pagan), Hestia/Vesta (neo-pagan, low) — none screened further.

## Top 5 (vs nib 8/10)

Verdict: none beats nib. Myth names do not carry the cursor/ink idea in the word itself (the idea lives in a back-story), and the strongest idea fit (Kairos = the present moment) fails GH/domains.

1. **nisaba** (6.5) — Reed-stylus goddess; story is writing + measure, i.e. craft rather than cursor. Packages `@nisaba-ui`, `@nisaba` (taken, skip); GH `nisaba-ui`; `nisaba.design`, `nisaba.sh` (`.dev` taken); prefix `nis-`. vs nib: 3 syllables vs 1, weaker meaning, cleaner of dev-tool collisions than nib. Tagline: "Nisaba — A ruled page for interfaces, one cell inked at a time."
2. **nidaba** (6.5) — Same figure, spelling variant; best availability of the round (`@nidaba`, `@nidaba-ui`, GH both, `.dev/.design/.sh` all free). Risk: people search "nisaba"; OCR project 90*. Prefix `nid-`. vs nib: strongest availability, weakest recognisability. Tagline: "Nidaba — Quiet components on a ruled grid, with one inked cell."
3. **ogham** (6) — Best story in direction B: strokes cut along a ruled line = grid + one marked cell. Packages `@ogham-ui`, GH `ogham-ui`, `ogham.design`, `ogham.sh`; prefix `ogh-`. Risks: "gh" silent, readers say "og-ham" vs "oh-um"; GH `ogham` is the exa author. vs nib: richer story, pronunciation worse. Tagline: "Ogham — Interface marks, cut along a single ruled line."
4. **seshat** (5.5) — Cord-measurer of ruled lines, very on-brief for the grid tagline; but "shat" substring in lowercase mono and matrix-org/seshat. `@seshat-ui`, GH `seshat-ui`, `seshat.design`, `seshat.sh`; prefix `ses-`. Tagline: "Seshat — Measured, ruled, and set with care."
5. **pilcrow** (5.5) — ¶ is a typesetter mark meaning "start here", close in spirit to stet. `@pilcrow-ui`, GH `pilcrow-ui`, `pilcrow.sh` only (.dev, .design taken) so fallback `pilcrowui.dev`; prefix `pil-`. Tagline: "Pilcrow — A ruled page where one thing begins."
   Runner-up if the owner insists on retro: didot (5), hairline (8 letters).

## Unresolved questions

- Owner: is a 3-syllable name acceptable if the story is strong? (nisaba/nidaba only.)
- Nisaba vs Nidaba: pick the correct-scholarly one or the fully available one?
- Pronunciation of ogham needs a native-ear test with Vietnamese users.
- Vietnamese and other-language meanings not web-verified; npm bare-scope dormancy not checked this round (Cloudflare 1015 rate limit on the org listing).
- Kairos fails GH/domains: any appetite for `kairos-ui`-style fallbacks on GitHub (`kairosui`)? Not checked (`ghui` for kairos = F, so org `kairosui` free).

# Name candidates for warm-terminal rename (2026-10-23)

## Method

- npm unscoped: GET registry.npmjs.org/<n> (404 = free)
- npm scope: GET registry.npmjs.org/-/org/<n>/package (404 = free, 200 = taken; 429 rate-limit, retried). Cross-check: npm search total=0.
- GitHub: `gh api users/<n>` (404 = free). .dev: pubapi.registry.google RDAP. .com: rdap.verisign.com.
- Scripts: scratchpad/chk.sh, chk2.sh. Web search: 3 batched queries, no software product hits for any finalist.
- Short real words (stet, folio, pica, quire, rubric, pilcrow, gutter, ledger, ruler, caret, verso, recto, lede, tally, blink, quill, kerf, ruling, hereon...) nearly all fail: npm/GH taken. Only stet (npm free, but org+GH+.dev+.com taken), hereon, kerf, ruling, nowrule partial. So coined compounds are the realistic pool.
- "free" for .dev/.com = RDAP 404 (likely unregistered, not verified at registrar).

## Table (all: npm free, @scope free, GitHub free, .dev free unless noted)

| name                                                                                                         | meaning                                 | prefix | npm  | @scope | GH   | .dev | .com  | conflicts                                    | score |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ------ | ---- | ------ | ---- | ---- | ----- | -------------------------------------------- | ----- |
| stetrule                                                                                                     | stet (proof mark "let it stand") + rule | st-    | free | free   | free | free | free  | none found; resembles Stetl (ETL, unrelated) | 9     |
| stetcell                                                                                                     | stet + cell (cursor cell)               | st-    | free | free   | free | free | free  | none                                         | 8     |
| stetline                                                                                                     | stet + ruled line                       | st-    | free | free   | free | free | taken | none                                         | 8     |
| nibrule                                                                                                      | nib (pen point/cursor) + rule           | nr-    | free | free   | free | free | free  | none (InRule is different)                   | 8     |
| rulecell                                                                                                     | ruled grid + cursor cell                | rc-    | free | free   | free | free | free  | none                                         | 8     |
| cursule                                                                                                      | cursor + rule (pron. "KUR-sool")        | cs-    | free | free   | free | free | free  | none                                         | 7     |
| tabrule                                                                                                      | tab + rule                              | tb-    | free | free   | free | free | free  | none                                         | 7     |
| rulark                                                                                                       | rule + mark                             | rk-    | free | free   | free | free | taken | none                                         | 7     |
| hereleaf                                                                                                     | "here" + folio/leaf                     | hl-    | free | free   | free | free | free  | none                                         | 6     |
| nowfolio                                                                                                     | "now" + folio                           | nf-    | free | free   | free | free | taken | none                                         | 6     |
| hairnib                                                                                                      | hairline + nib                          | hn-    | free | free   | free | free | free  | none                                         | 6     |
| caretia                                                                                                      | caret + -ia                             | ca-    | free | free   | free | free | taken | "caret" R pkg/editor echo                    | 6     |
| rulehere                                                                                                     | rule + here                             | rh-    | free | free   | free | free | free  | none                                         | 5     |
| folrule                                                                                                      | folio + rule                            | fr-    | free | free   | free | free | free  | none                                         | 5     |
| Unverified: curlead @scope (rate-limited); skip it.                                                          |
| Failed (reason): carule/curule/rulin/cursio/leadon (GH taken), caretl/hairca (clunky), inkcell (.dev taken). |

## Top 5

1. **stetrule** - "stet" = editor's mark for "let it stand": the current thing stays; plus the ruled page. Fits jade = current.
2. **stetcell** - the cursor cell that stays; maps directly to the logo's filled cell.
3. **nibrule** - pen nib on a ruled page; short, friendly, all-clean availability.
4. **rulecell** - literal: ruled grid + one cell. Plainest, easiest for VN speakers.
5. **cursule** - cursor + rule, close to "capsule" feel; pronounceable; weaker meaning.

## Notes

- Prefix `st-` has no Tailwind collision (avoid `sr-` which is `sr-only`). Check `rc-`/`nr-`/`cs-` also free.
- Vietnamese: "stet" cluster st-e-t is easy; "rule" /ruːl/ may soften to "ru-lơ".

## Unresolved questions

- Is the npm scope truly claimable (org creation may reserve differently from the org endpoint)? Needs manual npmjs.com check before commit.
- Trademark/USPTO search not done.
- Is a compound OK vs a single short word? All single real words failed.

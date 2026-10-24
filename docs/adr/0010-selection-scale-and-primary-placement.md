# 10. Cursor blocks only for single selection; primary never beside a cursor block

Date: 2026-10-24 · Status: accepted

## Context

The token-check prototype (branch `prototype/token-check`) showed two problems with ADR 2 and
ADR 9 together:

- A pressed toggle or selected option (an ink block) placed next to the primary button (a 2px ink
  frame) outweighs it; the eye lands on the state, not the action.
- "Selected row = cursor block" turns a table with many checked rows into a black slab.

Mobbin research (`plans/reports/researcher-251024-mobbin-ui-ux-accessibility.md`, about 110 web
screens) found that products keep the main action in a footer or bottom-right action row, never in
the same row as a toggle group, and that multi-row selection is always a light tint plus a
checkbox, never an inverted row.

## Decision

- **Placement:** the primary button sits in its region's action row (footer of a form, dialog,
  sheet or pane, inline-end side; or next to the headline in a hero). Pressed toggles and option
  pickers live in the header or content. A primary never shares a row or group with a cursor block.
- **Selection scale:** the cursor block is for single selection only (the row open in a detail
  view, a selected option, a selected date, a toggle that is on). Multi-select rows use an `[x]`
  checkbox and the hover fill, and checking any row shows a bulk action bar
  (`3 SELECTED · ARCHIVE · DELETE · CLEAR`) announced in a polite live region.
- Flagged rows keep their tint but always carry a tag or glyph with a word.

## Considered and rejected

- A lighter "chosen" form for toggles and options only: it would give one concept two shapes,
  against ADR 2.
- Accepting the inversion as is: the prototype showed the primary losing the view.

## Consequences

- Layout rules, not tokens, carry the hierarchy; `nib lint` cannot check placement, so docs and
  examples must model it.
- No market product uses an outline-only primary (0 of about 25 seen); that remains the accepted
  risk of ADR 9.

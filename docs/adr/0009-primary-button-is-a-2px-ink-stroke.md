# 9. Primary button is a 2px ink stroke, not a fill

Date: 2026-10-24 · Status: accepted

## Context

ADR 2 made the ink-inverted cursor block mean "chosen". The primary button was an ink fill with
surface text, so it looked exactly like a selected item. A jade fill is ruled out because the
accent is never a button, and the laws forbid radius and shadow, so emphasis has to come from the
system's own marks. Option pickers and toggles are `<button>`s whose selected state is a cursor
block, so "ink inversion is never a button" was also self-contradictory.

## Decision

- Rule: ink inversion shows a chosen value (row, option, date, toggle that is on, text
  selection). It is never used to make an action stand out.
- Primary button: 2px ink border, transparent ground, on-surface text; hover adds the hover fill.
  One per view, the only 2px ink frame on screen.
- Hierarchy by stroke weight: primary 2px → outline 1px line border → ghost no border.
- Destructive: 1px red border + red text; the confirm button of a destructive dialog is a 2px red
  border and takes the primary's place.
- Pressed toggles (`aria-pressed="true"`) and selected options use the cursor block.
- No filled-button exception, including landing-page CTAs. Landing CTAs get prominence from size
  (`lg`, 48–52px when pinned on phones), position next to the headline, and being the only 2px
  frame in the viewport. Reopen with a new ADR only if real A/B data says otherwise.
- The `on-primary` tokens are removed; `primary` (ink) remains the border color.

## Consequences

- Primary and selected states can sit side by side (e.g. a command palette with a confirm button)
  without ambiguity.
- In forced-colors mode the primary keeps its 2px border in `ButtonText`; a filled button would
  have collapsed into an outline there.
- Outlined CTAs may convert worse on marketing pages; accepted for consistency.

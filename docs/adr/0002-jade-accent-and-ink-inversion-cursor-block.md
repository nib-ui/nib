# 2. Jade accent plus an ink-inverted cursor block for "current"

Date: 2026-10-24 · Status: accepted (primary button settled in ADR 9)

## Context

The accent means only *the current thing*. The old coral (#d97757 / #c15f3c) was Anthropic's
brand color. In OKLCH the six semantic hues and coral occupy most of the hue wheel (red 20°,
coral 39°, yellow 82°, green 127°, cyan 226°, blue 263°, magenta 310°); the only gap at least 45°
from every neighbour is around 176°. Six candidates were measured for contrast, hue distance and
color-vision deficiency (see `plans/reports/researcher-251023-accent-candidates.md`).

## Decision

- Accent is **jade**: dark `#00967d` (marks) / `#009e84` (text); light `#02806c` / `#007561`.
  Marks ≥ 3:1 and text ≥ 4.5:1 on all three surfaces of each theme.
- Two forms of "current": a **jade rule** (active-nav underline, focus ring, progress, playhead,
  `NOW` text) says *where*; an **ink-inverted cursor block** (ink fill, surface text, 17.5:1) says
  *which one is chosen* (selected row, selected option, selected date, text selection). The option under the
  keyboard in a listbox or command palette is *current*, so it gets the jade rule, not the block.
- Ink inversion means "chosen" and is never used to make an action stand out (see ADR 9).
- Syntax keyword and number colors move off teal: keyword mauve (`#a98fc0` / `#6e4f8a`), number
  ochre (`#c2a26f` / `#7d5f2c`).
- `nib theme check` tests custom accents for contrast, CVD distance to red/green/yellow, and
  collisions with the fixed hues.

## Consequences

- Dark jade vs red under protanopia is only ΔE ≈ 5, so the cursor block and law 5 (hue never
  alone) carry meaning, not jade alone.
- The primary button can no longer be an ink fill; ADR 9 makes it a 2px ink stroke.
- Forced-colors mode removes fills: cursor blocks map to `Highlight` / `HighlightText`.

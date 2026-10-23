# 8. Own icon set; icons accompany words

Date: 2026-10-24 · Status: accepted

## Context

The original spec banned icons ("words, not icons"). Components such as the date picker, data
grid and combobox need small directional and state marks, and framework users expect icons.

## Decision

- Nib draws its own icon set (story name Dingbats) under the system's laws: 16×16 grid (20×20 for
  large controls), 1px strokes (2px for emphasis), square caps, miter joins, only 90° and 45°
  angles, no curves, pixel-aligned, `currentColor` only.
- Delivery: SVG sprite, one ES module per icon, and a CSS mask version. About 60–80 icons in 1.0.
- Icons accompany words by default. Icon-only is allowed only for dense controls inside a
  component (month arrows, sort, resize, dialog close) and then requires an accessible name and a
  tooltip. Text glyphs (`❯ ※ ▲ ⚠ ✓ · ✻`) stay in running text.

## Consequences

- The "words, not icons" rule becomes "words first". How wrappers expose icons (prop or slot) is decided with the component APIs.

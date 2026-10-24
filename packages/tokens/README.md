# @nib-ui/tokens

Nib's design tokens (story name: _Sorts_). The source is DTCG JSON in `source/`, transcribed from
the front matter of `spec/DESIGN.md`; a test fails if the two drift apart.

## Files

| Import                        | Contents                                                                                                                                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nib-ui/tokens/tokens.css`   | Custom properties in `@layer nib.theme`: colours as `light-dark()`, fonts, type roles, spacing, motion, density                                                                                                                              |
| `@nib-ui/tokens/tailwind.css` | Tailwind v4 `@theme inline` aliases (`bg-nib-surface`, `text-nib-label-md`, …), with the radius and shadow namespaces reset. Load `tokens.css` too.                                                                                          |
| `@nib-ui/tokens/tokens.json`  | Colours resolved to hex per theme, every custom property, and each density's values. The derived `-soft` and `-border` hue variants appear only under `vars` (as `color-mix()`), since their final colour depends on the surface underneath. |
| `@nib-ui/tokens`              | `buildTokens(source)`, the pure function that produces the three files                                                                                                                                                                       |

## Themes and density

- The theme follows `prefers-color-scheme`. `data-theme="light"` or `"dark"` on any element forces it
  for that region.
- `comfortable` density is the default; `data-density="compact"` on any element tightens cell padding
  and control height (`--nib-density-*`).
- With `prefers-reduced-motion: reduce`, every `--nib-duration-*` is `0ms` at the root. A region that
  overrides a duration must zero it in its own `prefers-reduced-motion` block.

## Names

`color.surface` → `--nib-surface` · `font.mono` → `--nib-font-mono` · `typography.label-md.font-size` →
`--nib-label-md-font-size` · `spacing.lg` → `--nib-space-lg` · `motion.duration.hover` →
`--nib-duration-hover` · each hue also gets `--nib-<hue>-soft` and `--nib-<hue>-border`.

The `@nib-ui/source` export condition points at `src/` and is for this workspace only; `src/` is not
published.

The source uses DTCG 2025.10 types, with `dimension` extended to the `em` and `ch` units.

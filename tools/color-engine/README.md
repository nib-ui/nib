# @nib-ui/color-engine

Private. Contrast and colour-vision checks shared by `nib theme check`, CI and the playground. Pure
functions, no DOM, no dependencies.

- `contrast(fg, bg)`: WCAG 2.x ratio; a translucent foreground is composited over `bg` first.
- `simulate(hex, 'protan' | 'deutan' | 'tritan')`: Machado et al. (2009), severity 1.0.
- `distance(a, b, vision?)`: ΔE in OKLab × 100, after simulation when a vision type is given.
- `checkTheme({ dark, light })`: every rule on both themes, returned as proof marks.

## Rules

| Rule | Severity |
|---|---|
| on-surface 1–3, accent-text and the six hues ≥ 4.5:1 on all three surfaces | error |
| each hue ≥ 4.5:1 on its own `-soft` fill mixed over all three surfaces (tags) | error |
| syntax colours ≥ 4.5:1 on surface raised; on-cursor on cursor and on-hue on each hue ≥ 4.5:1 | error |
| accent ≥ 3:1 on all three surfaces and on the cursor block | error |
| accent and any hue under ΔE 8 for normal vision | error |
| accent and red, green or yellow under ΔE 10 for protanopia, deuteranopia or tritanopia | warning |

Every colour a rule reads must be opaque; `checkTheme` throws otherwise.

Exempt: on-surface 4 (decorative glyphs) and `line` (decorative hairlines). Colour-vision closeness
is a warning only, because law 5 pairs every hue with a word. Nib's own palette produces four such
warnings today, all known from the accent research; a test pins that list.

The palette test reads the built `@nib-ui/tokens/tokens.json`, so run it with `nx test`, which
builds tokens first.

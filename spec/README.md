# Nib spec

[`DESIGN.md`](DESIGN.md) is the design spec for Nib: the YAML front matter holds exact token values
for both themes, type scale, spacing and component defaults; the body explains the five laws and
how each part is used. It follows the [DESIGN.md format](https://stitch.withgoogle.com/docs/design-md/overview/)
so design and coding agents can read it.

It is the source of truth for *intent*, not a build input. Shipped tokens are compiled from DTCG
JSON in the `tokens` package; keep the two in step.

## How to use it

1. **Hand `DESIGN.md` to your design or coding agent** as the visual rules for every screen.
2. **Start from the matching preset** (Galley/docs, Ledger/dashboard, Broadsheet/blog,
   Broadside/landing, Catalogue/shop, Folio/portfolio). It says what the accent marks and which
   components carry the screen.
3. **Map the free hues once.** Red, green and yellow keep fixed meanings; give blue, cyan and
   magenta to your own concepts and never reuse one for two concepts.
4. **Check each screen against "Do's and Don'ts"** at the end of `DESIGN.md`.

## Quick reference

| Role | Dark (Ink) | Light (Paper) |
|---|---|---|
| surface · raised · overlay | `#141413` · `#1a1a18` · `#1e1d1b` | `#faf9f5` · `#f1efe8` · `#ece9e0` |
| ink | `#faf9f5` | `#141413` |
| accent (jade) | `#00967d` (text `#009e84`) | `#02806c` (text `#007561`) |
| cursor block | ink fill, surface text | ink fill, surface text |
| red · green · yellow | `#e08f8f` · `#c3e88d` · `#e5c07b` | `#a04545` · `#537126` · `#7a5d00` |
| blue · cyan · magenta | `#82aaff` · `#89ddff` · `#c792ea` | `#2a60d6` · `#156f93` · `#8c46bb` |

Type: Inter 400/500/600 for headlines and prose · JetBrains Mono 400/500 for labels, prices, dates
and code · mono ligatures off. Spacing: 4pt grid with half steps. Strokes: 1px hairline, 2px rule.
Radius: 0.

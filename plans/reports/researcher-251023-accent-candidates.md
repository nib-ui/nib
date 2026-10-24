# Accent candidates (post-coral) - 2026-10-23

Source: /Users/sangnguyen/Desktop/design/DESIGN.md (not edited). Script: scratchpad `lib.js`, `measure.js`, `hues.js`, `results.json` (WCAG + OKLCH + Machado CVD, own impl). Swatches: `plans/visuals/accent-candidates.html`.
Thresholds applied: accent >=3:1 vs 3 surfaces; accent-text >=4.5:1 vs 3 surfaces; selection (accent fill + surface text) >=4.5:1. Pick targets 4.6+ for rounding margin.

## 1. Occupied hue map (OKLCH h, degrees)

| Hue       | Dark hex (L/C/h)      | Light hex (L/C/h)                               |
| --------- | --------------------- | ----------------------------------------------- |
| red       | #e08f8f (.73/.10/20)  | #a04545 (.51/.12/22)                            |
| old coral | #d97757 (.67/.13/39)  | #c15f3c (.60/.14/40), text #a94e2f (.53/.13/39) |
| yellow    | #e5c07b (.83/.10/82)  | #7a5d00 (.49/.10/87)                            |
| green     | #c3e88d (.88/.12/127) | #537126 (.51/.11/128)                           |
| cyan      | #89ddff (.86/.09/226) | #156f93 (.51/.10/231)                           |
| blue      | #82aaff (.74/.13/264) | #2a60d6 (.53/.19/263)                           |
| magenta   | #c792ea (.74/.14/311) | #8c46bb (.54/.18/309)                           |

Hue angles stable across themes (+-6 deg). Gaps between neighbours (deg): green->cyan 99 (centre 176), magenta->red 69 (centre 350, red-side 30), red->yellow 62 (coral/orange = banned), yellow->green 45 (centre 105), blue->magenta 48 (centre 287), cyan->blue 37.
Only one gap has >=45 deg to both neighbours: **teal ~176**. All light-theme hues sit at L .49-.53, so any light accent at L~.54 has low dE-OK to all of them (hue, not lightness, must do the work).

## 2-3. Candidates and measurements

| #   | Name / strategy                                                                    | dark accent | dark accent-text | light accent | light accent-text |
| --- | ---------------------------------------------------------------------------------- | ----------- | ---------------- | ------------ | ----------------- |
| A   | Teal-jade, hue gap h176                                                            | #00967d     | #009e84          | #02806c      | #007561           |
| B   | "Phosphor" chartreuse-lime h110                                                    | #878a00     | #8e9100          | #727602      | #696c00           |
| C   | Cursor block: pure ink (neutral)                                                   | #faf9f5     | #faf9f5          | #141413      | #141413           |
| D   | Indigo-violet h287                                                                 | #8478de     | #8a7ee5          | #7260d3      | #6955c7           |
| E   | Rose h350                                                                          | #c86497     | #cf6a9e          | #b14f82      | #a64579           |
| F   | Hybrid: ink inversion for current/selected + jade (A) rule/focus/progress/NOW text | #00967d     | #009e84          | #02806c      | #007561           |

Contrast (surface / raised / panel):

| #   | accent dark    | accent light   | text dark      | text light     | selection dark / light |
| --- | -------------- | -------------- | -------------- | -------------- | ---------------------- |
| A   | 4.97/4.70/4.54 | 4.63/4.24/4.02 | 5.46/5.17/4.99 | 5.36/4.91/4.65 | 4.97 / 4.63            |
| B   | 4.97/4.70/4.54 | 4.63/4.24/4.02 | 5.44/5.15/4.97 | 5.32/4.87/4.62 | 4.97 / 4.63            |
| C   | 17.5/16.5/16.0 | 17.5/16.0/15.2 | same           | same           | 17.5 / 17.5            |
| D   | 5.02/4.75/4.59 | 4.60/4.22/4.00 | 5.44/5.14/4.97 | 5.35/4.90/4.64 | 5.02 / 4.60            |
| E   | 5.03/4.75/4.59 | 4.62/4.23/4.01 | 5.45/5.15/4.98 | 5.32/4.87/4.61 | 5.03 / 4.62            |
| F   | as A           | as A           | as A           | as A           | 17.5 / 17.5 (ink)      |

All pass. Binding constraint: light accent-text vs panel (#ece9e0) and light selection vs #faf9f5 -> light accent can only be ~.02 L lighter than its text.

Distance to semantic hues and old coral (hue = OKLCH h angle diff; dE = dE-OK x100; "min" over six hues + coral, both themes):

| #   | min hue dist (nearest)   | min dE-OK x100 (nearest) | hue dist to coral | CVD dE x100 min vs red/green/yellow (dark / light)       |
| --- | ------------------------ | ------------------------ | ----------------- | -------------------------------------------------------- |
| A   | 48 (green; cyan 50)      | 9 (light cyan, green)    | 137               | 5 (red-prot) / 6 (red-deut)                              |
| B   | 16 (green); yellow 25    | 5 (light green)          | 72                | 13 / 3 (green-prot)                                      |
| C   | n/a (C<0.01, achromatic) | 15 (dark green/cyan)     | n/a (dE 33-43)    | 13 / 26                                                  |
| D   | 22 (magenta, blue 23)    | 8 (light magenta)        | 112               | 18 / 22                                                  |
| E   | 30 (red; magenta 39)     | 9 (light red)            | 49                | 11 / 9                                                   |
| F   | 48 (rule colour = A)     | 9 (rule); fills use ink  | 137               | 5 / 6 for rule; inversion is lightness-based so CVD-safe |

Per-pair CVD detail is in `results.json` (keys `cvd`). Note: all chromatic candidates have low light-theme CVD separation (<=15) because every light hue is L~.5; the six existing hues already collide with each other there, so this is a theme-wide limit, not accent-specific.

## 4. Ranking and re-mapping flags

1. **F hybrid (jade rule + ink inversion)** - best. Hue-carrying marks (underline, focus, progress, NOW text) use the only truly open gap; "selected/current block" uses ink inversion, which is hue-independent and CVD-proof (17.5:1). No semantic remap. Cost: more states to specify (two accent forms); ink inversion overlaps the primary CTA look (ink fill + surface text), so selection must stay non-CTA-shaped (e.g. list/row, not button).
2. **A teal-jade** - same hues as F, accent = jade for everything incl. selection fill (4.6-5.0:1). No remap. Cautions: dark red-protanopia dE only 5 (red text vs teal mark could confuse under protan; they never share form, and words travel with colour). Overlaps syntax tokens: keyword #4d9375 (h164) and number #4c9a91 (h186), dE 4 from dark teal - code-block highlighted line rule would blend with syntax colours; may need keyword/number nudged.
3. **C ink cursor block** - zero hue contention, max contrast, but "current" == on-surface/primary ink, so active nav (already on-surface) and CTA lose distinction from current; no coloured signal at all. Fine as fallback if colour must be avoided.
4. **E rose** - 30 deg from red, dE .09-.10 from red in light; reads as warning/error-adjacent and shows red-like under CVD (dE 9-13). Would force red or magenta re-map (or pink danger confusion). Not recommended.
5. **D indigo-violet** - 22-23 deg from blue and magenta, dE .08-.10: reads as a category hue. **Forces re-mapping blue or magenta** (e.g. blue -> cyan-ish, magenta -> pink).
6. **B chartreuse** - 16 deg from green, 25 from yellow, light dE .05: reads as success/warning. **Forces re-map of green or yellow** (breaks fixed meanings). Rejected.

Nothing needs hue re-mapping for A, C, F.

## Method notes

- OKLCH via Ottosson matrices; WCAG 2.x relative luminance; CVD = Machado 2009 severity 1.0 in linear RGB, dE-OK on simulated pair.
- Hex picked by scanning OKLCH L at fixed C,h: dark = lowest L passing 4.6 then +.02 L; light = highest L passing 4.6 (selection/accent-text) and 3.1 (marks). Chroma gamut-clamped by hex rounding.

## Unresolved questions

- Is ink inversion acceptable as a second "current" form (F), or must accent be one colour token (A)?
- Accept dark-theme teal vs red protan dE 5, or add a lightness offset rule (e.g. never place accent text adjacent to red text)? Lightness shifts tested did not help (dE 6-13 at L .70-.86) - not solvable by L alone.
- Should syntax-keyword/number (teal-ish h164/h186) be nudged if teal is chosen?
- Is a hue distance floor (>=30 deg / dE >=.12) the right bar? No candidate reaches dE .12 in light theme.
- Swatch HTML not visually screenshot-verified.

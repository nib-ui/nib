---
nib: minor
---

`@nib-ui/icons` ships the first 17 icons (chevrons, prev / next arrows, close, check, plus, minus, search, calendar, copy, external, menu, warning, info) as an SVG sprite, one ES module per icon and a CSS mask (`icons.css`, `class="nib-icon nib-icon-<name>"`). The build rejects any source that breaks the drawing laws: `<path>` only, straight 0° / 45° / 90° segments, half-pixel grid, 1px or 2px strokes on whole pixels, 16 or 20 box.

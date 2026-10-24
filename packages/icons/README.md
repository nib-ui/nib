# @nib-ui/icons

Nib's own icon set (Dingbats): straight 1px or 2px strokes at 90° and 45°, square caps, on a 16 or
20 pixel grid, in `currentColor`. Icons accompany words; an icon on its own needs an
`aria-label` and a tooltip.

- `@nib-ui/icons/icons.css`: `<span class="nib-icon nib-icon-copy" aria-hidden="true"></span>`
- `@nib-ui/icons/sprite.svg`, served from your own origin: `<svg width="16" height="16" aria-hidden="true"><use href="/sprite.svg#nib-icon-copy" /></svg>`
- `import { copy } from '@nib-ui/icons'` or `import copy from '@nib-ui/icons/copy'`: SVG markup.

Add an icon as `src/svg/<name>.svg` holding `<path>` elements with only `d` (and `stroke-width="2"`
for emphasis). `pnpm nx build icons` checks every source against the drawing laws and fails,
listing every breach.

The CSS masks are `data:` URLs: a Content Security Policy needs `img-src data:` for them; the
sprite and the modules need nothing.

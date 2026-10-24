# @nib-ui/stylelint-plugin

Private. Stylelint rules that enforce the Nib laws in Nib's own CSS; `nib lint` reuses them.

```js
// stylelint.config.mjs
export { default } from '@nib-ui/stylelint-plugin/config';
```

The default export is the array of plugins; `@nib-ui/stylelint-plugin/config` turns every rule on.

| Rule | Rejects | Allows |
|---|---|---|
| <a id="no-radius"></a>`nib/no-radius` | `border-radius` and every physical or logical corner longhand other than 0, vendor prefixes included | `0`, `0px` |
| <a id="no-shadow"></a>`nib/no-shadow` | `box-shadow`, `text-shadow`, `drop-shadow()` in `filter` | `none` |
| <a id="no-gradient"></a>`nib/no-gradient` | every `linear`, `radial`, `conic`, `repeating-` and legacy `-webkit-gradient()`, in any property | |
| <a id="no-blur"></a>`nib/no-blur` | `blur()` in `filter`, any `backdrop-filter` | `none` |
| <a id="no-important"></a>`nib/no-important` | `!important` | inside a non-negated `@media (prefers-reduced-motion: reduce)` with a non-empty comment (not a `stylelint-` directive) right before the declaration |
| <a id="no-physical-direction"></a>`nib/no-physical-direction` | properties with `left`/`right`; `left`/`right` values (prefixed too) of `text-align`, `text-align-last`, `float`, `clear`; four-value box shorthands whose right and left differ | logical properties, `start`/`end`, `top`/`bottom`; corner radii are left to `nib/no-radius` |
| <a id="color-tokens"></a>`nib/color-tokens` | hex and colour functions anywhere (custom properties and `@property` included, relative colour syntax too); named colours in colour properties, `var()` fallbacks included | `var()`, `color-mix()`/`light-dark()` of variables, `transparent`, `currentColor`, global keywords, system colours, text inside strings and `url()` |

`@nib-ui/tokens` is generated, so its `tokens.css` is not linted by these rules.

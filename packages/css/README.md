# @nib-ui/css

Nib's CSS: tokens, base styles and every component in cascade layers
(`nib.theme`, `nib.base`, `nib.components`, `nib.utilities`). Component states come from ARIA and
HTML attributes, not modifier classes.

```css
@layer nib.theme, nib.base, nib.components, nib.utilities;
@import '@nib-ui/fonts/fonts.css';
@import '@nib-ui/css/nib.css';
```

| Import                              | What it holds                                                          |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `@nib-ui/css/nib.css`               | Tokens, base and every component, minified                             |
| `@nib-ui/css/components/<name>.css` | One component, for pages that load only what they use (add the tokens) |
| `@nib-ui/css/utilities.css`         | Opt-in single-purpose classes from the tokens                          |
| `@nib-ui/css/presets/<name>.css`    | A preset's layout recipes and hue mapping, after `nib.css`             |

Unlayered styles of your own beat every Nib layer. See the css guide in the Nib docs.

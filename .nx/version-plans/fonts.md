---
nib: minor
---

`@nib-ui/fonts` ships Inter and JetBrains Mono as self-hosted variable WOFF2 (Latin, Latin Extended, Vietnamese subsets) with `fonts.css` (`@font-face` + `unicode-range`, under the names the tokens use) and both OFL licences. Import `@nib-ui/fonts/fonts.css` before `@nib-ui/css/nib.css`; without it the token stacks fall back to system fonts.

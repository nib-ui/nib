---
nib: minor
---

CLI: `nib theme check [file.css …]` in `@nib-ui/cli` reads a theme's `--nib-*` colours (hex, or `light-dark()` of two hex colours), lays them over Nib's palette and runs every contrast, tag, colour-vision and hue-collision rule on both themes. Errors print as proof marks and exit with 1; with no files it reads the `theme` file named in `nib.config.json`. No telemetry.

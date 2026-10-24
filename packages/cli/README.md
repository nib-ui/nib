# @nib-ui/cli

The `nib` command. Collects no telemetry.

```sh
npx @nib-ui/cli theme check
```

## nib theme check [file.css …]

Proofs a theme's colours. It reads every `--nib-<role>` colour the files set, lays them over Nib's
palette and runs the rules of `@nib-ui/color-engine` on both themes:

- text (on-surface 1–3, accent text, error, the six hues, syntax) at least 4.5:1 on surface,
  surface raised and surface overlay;
- each hue at least 4.5:1 on its own `-soft` tag fill;
- the accent at least 3:1 on the three surfaces and on the cursor block;
- the accent at least ΔE 8 from every hue, and a warning when it sits within ΔE 10 of red, green
  or yellow for protanopia, deuteranopia or tritanopia.

With no files it reads the `theme` file named in `nib.config.json`, and with neither it proofs
Nib's own palette.

```css
:root {
  --nib-accent: light-dark(#02806c, #00967d);
}
```

Write each colour as hex, or as `light-dark(<light>, <dark>)` of two hex colours, the form
`@nib-ui/tokens` uses; any other value is an error, since it cannot be proofed. Selectors are not
weighed: a later declaration wins, as if every rule applied to the whole page.

Errors read as proof marks and exit with 1:

```
Pulling a proof of src/theme.css…
error    Proof mark: accent on paper-raised is 2.8:1, needs 3:1.
Not locked up: 1 error, 4 warnings.
```

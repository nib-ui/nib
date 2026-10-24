import { checkTheme, type ThemeColors } from '@nib-ui/color-engine';
import tokens from '@nib-ui/tokens/tokens.json' with { type: 'json' };
import { readConfig, readText, type Io } from './io.ts';
import { mergeTheme, readThemeCss } from './theme-css.ts';

/** The palette Nib ships; the build inlines it, so the check matches this release of Nib. */
const nibPalette = (): ThemeColors => (tokens as { color: ThemeColors }).color;

/**
 * `nib theme check [file.css …]`: lays the files' `--nib-*` colours (or those of the config's
 * `theme` file) over Nib's palette and runs every contrast and colour-vision rule on both themes.
 * Errors are proof marks that fail the run (exit 1); warnings are printed only.
 */
export async function themeCheck(files: readonly string[], io: Io): Promise<number> {
  const config = await readConfig(io);
  const sources = files.length ? files : config.theme ? [config.theme] : [];
  const base = nibPalette();
  const roles = Object.keys(base.dark);
  let colors = base;
  const unreadable: string[] = [];
  io.out(sources.length ? `Pulling a proof of ${sources.join(', ')}…` : "Pulling a proof of Nib's own palette…");
  for (const file of sources) {
    const css = await readText(io, file);
    if (css === null) {
      io.err(`error    ${file} is not there.`);
      return 1;
    }
    const theme = readThemeCss(css, roles);
    unreadable.push(...theme.unreadable.map((line) => `${file}: cannot proof ${line}`));
    colors = mergeTheme(colors, theme);
  }
  // Proofing around a colour that was not read would judge Nib's colour in its place.
  if (unreadable.length) {
    for (const line of unreadable)
      io.err(`error    ${line}; write it as hex, light-dark() of two hex colours, or var(--nib-…).`);
    io.out(`Not locked up: ${unreadable.length} unreadable colour${unreadable.length === 1 ? '' : 's'}.`);
    return 1;
  }
  let marks;
  try {
    marks = checkTheme(colors);
  } catch (e) {
    io.err(`error    ${(e as Error).message}.`);
    return 1;
  }
  for (const mark of marks) io[mark.severity === 'error' ? 'err' : 'out'](`${mark.severity.padEnd(8)} ${mark.message}`);
  const errors = marks.filter((m) => m.severity === 'error').length;
  const warnings = marks.filter((m) => m.severity === 'warning').length;
  const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const tally = `${count(errors, 'error')}, ${count(warnings, 'warning')}`;
  io.out(errors ? `Not locked up: ${tally}.` : `Locked up: ${tally}.`);
  return errors ? 1 : 0;
}

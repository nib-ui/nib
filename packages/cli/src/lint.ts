import { relative, resolve } from 'node:path';
import nibConfig from '@nib-ui/stylelint-plugin/config';
import stylelint from 'stylelint';
import { classNames, position } from './class-names.ts';
import { classProblem } from './class-rules.ts';
import { readConfig, readText, type Io } from './io.ts';
import { lintFiles } from './lint-files.ts';

/** One broken law, at a place in a file. */
export interface Mark {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
}

/** Stylesheets through Nib's Stylelint rules; the theme file may set colours, so it skips `nib/color-tokens`. */
async function cssMarks(io: Io, files: readonly string[], theme: string | undefined): Promise<Mark[]> {
  if (!files.length) return [];
  const { results } = await stylelint.lint({
    files: files.map((f) => resolve(io.cwd, f)),
    cwd: io.cwd,
    config: {
      ...nibConfig,
      ...(theme && { overrides: [{ files: [resolve(io.cwd, theme)], rules: { 'nib/color-tokens': null } }] }),
    },
    // Only Nib's laws: a project's own Stylelint config and its disable comments do not apply.
    configBasedir: io.cwd,
    ignoreDisables: true,
  });
  return results.flatMap((r) =>
    r.warnings.map((w) => ({
      file: relative(io.cwd, r.source ?? ''),
      line: w.line,
      column: w.column,
      rule: w.rule,
      // Stylelint ends each message with the rule name in brackets; it is printed apart.
      message: w.text.replace(/\s*\([^)]*\)$/, ''),
    })),
  );
}

/** Class names in markup that break a law (Tailwind's arbitrary values bypass the tokens). */
async function markupMarks(io: Io, files: readonly string[]): Promise<Mark[]> {
  const marks: Mark[] = [];
  for (const file of files) {
    const text = (await readText(io, file)) ?? '';
    for (const { name, offset } of classNames(text)) {
      const problem = classProblem(name);
      if (problem) marks.push({ file, ...position(text, offset), ...problem });
    }
  }
  return marks;
}

/**
 * `nib lint [path …]`: the Nib laws over a project's CSS (radius, shadow, gradient, blur,
 * `!important`, physical directions, off-token colours) and over the class names in its markup.
 * Exits with 1 when anything breaks a law.
 */
export async function lint(paths: readonly string[], io: Io): Promise<number> {
  const config = await readConfig(io);
  const files = await lintFiles(io.cwd, paths);
  const total = files.css.length + files.markup.length;
  io.out(`Setting type: ${total} file${total === 1 ? '' : 's'}…`);
  const marks = [...(await cssMarks(io, files.css, config.theme)), ...(await markupMarks(io, files.markup))];
  for (const m of marks) io.err(`${m.file}:${m.line}:${m.column}  ${m.rule}  ${m.message}`);
  if (!marks.length) {
    io.out('Locked up: no proof marks.');
    return 0;
  }
  const where = new Set(marks.map((m) => m.file)).size;
  io.out(
    `Not locked up: ${marks.length} proof mark${marks.length === 1 ? '' : 's'} in ${where} file${where === 1 ? '' : 's'}.`,
  );
  return 1;
}

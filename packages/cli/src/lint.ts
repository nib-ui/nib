import { resolve } from 'node:path';
import nibConfig from '@nib-ui/stylelint-plugin/config';
import stylelint from 'stylelint';
import { classNames, positions } from './class-names.ts';
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

// The theme file is where colours are set, so it alone skips `nib/color-tokens`.
const THEME_CONFIG = { ...nibConfig, rules: { ...nibConfig.rules, 'nib/color-tokens': null } };

/**
 * One stylesheet through Nib's Stylelint rules, passed as text: no globbing of its path, and
 * neither the project's Stylelint config, its ignore files nor its disable comments apply.
 */
async function cssMarks(io: Io, file: string, text: string, isTheme: boolean): Promise<Mark[]> {
  const { results } = await stylelint.lint({
    code: text,
    codeFilename: resolve(io.cwd, file),
    config: isTheme ? THEME_CONFIG : nibConfig,
    configBasedir: io.cwd,
    ignorePath: [],
    ignoreDisables: true,
  });
  return results.flatMap((r) => [
    ...r.warnings.map((w) => ({
      file,
      line: w.line,
      column: w.column,
      rule: w.rule,
      // Stylelint ends each message with the rule name in brackets; it is printed apart.
      message: w.text.replace(/\s*\([^)]*\)$/, ''),
    })),
    ...r.parseErrors.map((w) => ({ file, line: w.line ?? 1, column: w.column ?? 1, rule: 'css', message: w.text })),
  ]);
}

/** Class names in markup that break a law (Tailwind's arbitrary values bypass the tokens). */
function markupMarks(file: string, text: string): Mark[] {
  const at = positions(text);
  return classNames(text).flatMap(({ name, offset }) => {
    const problem = classProblem(name);
    return problem ? [{ file, ...at(offset), ...problem }] : [];
  });
}

/** A mark on a line holding `nib-lint-ignore`, or right below one, is waived. */
function waived(text: string, line: number): boolean {
  const lines = text.split('\n', line);
  return [lines[line - 1], lines[line - 2]].some((l) => l?.includes('nib-lint-ignore'));
}

/**
 * `nib lint [path …]`: the Nib laws over a project's CSS (radius, shadow, gradient, blur,
 * `!important`, physical directions, off-token colours) and over the class names in its markup.
 * Exits with 1 when anything breaks a law.
 */
export async function lint(paths: readonly string[], io: Io): Promise<number> {
  const config = await readConfig(io);
  const files = await lintFiles(io.cwd, paths);
  const theme = config.theme && resolve(io.cwd, config.theme);
  const total = files.css.length + files.markup.length;
  io.out(`Setting type: ${total} file${total === 1 ? '' : 's'}…`);
  const marks: Mark[] = [];
  for (const [kind, list] of [['css', files.css] as const, ['markup', files.markup] as const]) {
    for (const file of list) {
      const text = (await readText(io, file)) ?? '';
      const found =
        kind === 'css' ? await cssMarks(io, file, text, resolve(io.cwd, file) === theme) : markupMarks(file, text);
      marks.push(...found.filter((m) => !waived(text, m.line)));
    }
  }
  marks.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);
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

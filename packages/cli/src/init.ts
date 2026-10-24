import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, posix, relative, resolve } from 'node:path';
import { CONFIG_FILE, readConfig, readText, type Io, type NibConfig } from './io.ts';
import { entryCss, isPreset, PRESETS, THEME_CSS, type CssKind } from './init-files.ts';

export interface InitOptions {
  preset?: string;
  css?: string;
  /** Folder for the stylesheets, relative to the project; default `src`. */
  dir?: string;
}

/** A wrong flag or answer is a usage mistake: exit 2, with the usage printed. */
const usage = (message: string) => Object.assign(new Error(message), { code: 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE' });

/** Writes a file unless one is already there; says which. */
async function place(io: Io, path: string, text: string): Promise<boolean> {
  if ((await readText(io, path)) !== null) {
    io.out(`Kept      ${path} (already there)`);
    return false;
  }
  await mkdir(dirname(resolve(io.cwd, path)), { recursive: true });
  await writeFile(resolve(io.cwd, path), text);
  io.out(`Set       ${path}`);
  return true;
}

/** A choice from a flag, or asked when the terminal can answer, or the first one. */
async function choose<T extends string>(io: Io, given: string | undefined, question: string, choices: readonly T[]) {
  const pick = (value: string) => {
    if ((choices as readonly string[]).includes(value)) return value as T;
    throw usage(`${question} must be one of ${choices.join(', ')}; got "${value}".`);
  };
  if (given !== undefined) return pick(given);
  if (!io.ask) return choices[0] as T;
  const answer = (await io.ask(`${question} (${choices.join(' / ')})`, choices[0] as T)).trim();
  return answer ? pick(answer) : (choices[0] as T);
}

/** The stylesheet folder as a project-relative path with forward slashes; never outside the project. */
function folder(io: Io, dir: string): string {
  const full = resolve(io.cwd, dir.split('\\').join('/'));
  const rel = relative(io.cwd, full).split('\\').join('/');
  if (!dir.trim() || rel.startsWith('..') || isAbsolute(rel))
    throw usage(`--dir must be a folder inside the project; got "${dir}".`);
  return rel || '.';
}

/** The choices to set up: what an existing config already says wins; the rest from flags, questions or defaults. */
async function settle(io: Io, options: InitOptions, existing: NibConfig): Promise<Required<NibConfig>> {
  const kept = Object.keys(existing).filter((k) => ['preset', 'css', 'entry', 'theme'].includes(k));
  if (kept.length) io.out(`Reading   ${CONFIG_FILE}: its ${kept.join(', ')} stay as they are`);
  const preset = existing.preset ?? (await choose(io, options.preset, 'Preset', Object.keys(PRESETS).filter(isPreset)));
  const css = existing.css ?? (await choose(io, options.css, 'CSS', ['plain', 'tailwind'] as const));
  const dir = existing.entry && existing.theme ? '' : folder(io, options.dir ?? 'src');
  return {
    preset,
    css,
    entry: existing.entry ?? posix.join(dir, 'nib.css'),
    theme: existing.theme ?? posix.join(dir, 'nib-theme.css'),
  };
}

/**
 * `nib init`: picks a preset and how CSS is loaded, then writes a CSS entry, an empty theme file
 * and, last, `nib.config.json`. A project that has a config keeps its choices; existing files are
 * kept. Installs nothing and sends nothing anywhere.
 */
export async function init(options: InitOptions, io: Io): Promise<number> {
  io.out('Setting type…');
  const config = await settle(io, options, await readConfig(io));
  const preset = isPreset(config.preset) ? config.preset : 'docs';
  const css: CssKind = config.css === 'tailwind' ? 'tailwind' : 'plain';
  // The theme file is imported from the entry by its path relative to the entry's folder.
  const themeImport = posix.relative(posix.dirname(config.entry), config.theme) || 'nib-theme.css';
  await place(io, config.entry, entryCss(css, themeImport.startsWith('.') ? themeImport : `./${themeImport}`, preset));
  await place(io, config.theme, THEME_CSS);
  // Written last, so a failed write above never leaves a config pointing at missing files.
  const wrote = await place(io, CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`);

  const packages = ['@nib-ui/css', '@nib-ui/tokens', ...(css === 'tailwind' ? ['tailwindcss'] : [])];
  const html = Object.entries(PRESETS[preset].html)
    .map(([name, value]) => ` ${name}="${value}"`)
    .join('');
  io.out('');
  io.out(`Next: install ${packages.join(' ')}, then import ${config.entry} once in your app.`);
  if (html) io.out(`The ${preset} preset sets the page: <html${html}>.`);
  io.out(wrote ? `Pulled a proof → ${CONFIG_FILE}. Locked up.` : 'Locked up.');
  return 0;
}

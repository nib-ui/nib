import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, posix, relative, resolve } from 'node:path';
import { CONFIG_FILE, readText, type Io } from './io.ts';
import { entryCss, isPreset, PRESETS, THEME_CSS, type CssKind, type Preset } from './init-files.ts';

export interface InitOptions {
  preset?: string;
  css?: string;
  /** Folder for the stylesheets, relative to the project; default `src`. */
  dir?: string;
}

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
  if (given !== undefined) {
    if ((choices as readonly string[]).includes(given)) return given as T;
    throw new Error(`${question} must be one of ${choices.join(', ')}; got "${given}".`);
  }
  if (!io.ask) return choices[0] as T;
  const answer = (await io.ask(`${question} (${choices.join(' / ')})`, choices[0] as T)).trim();
  if (!answer) return choices[0] as T;
  if ((choices as readonly string[]).includes(answer)) return answer as T;
  throw new Error(`${question} must be one of ${choices.join(', ')}; got "${answer}".`);
}

/**
 * `nib init`: picks a preset and how CSS is loaded, then writes `nib.config.json`, a CSS entry and
 * an empty theme file. Existing files are kept. Installs nothing and sends nothing anywhere.
 */
export async function init(options: InitOptions, io: Io): Promise<number> {
  io.out('Setting type…');
  const preset: Preset = await choose(io, options.preset, 'Preset', Object.keys(PRESETS).filter(isPreset));
  const css: CssKind = await choose(io, options.css, 'CSS', ['plain', 'tailwind'] as const);
  const dir = options.dir ?? 'src';
  const entry = posix.join(dir, 'nib.css');
  const theme = posix.join(dir, 'nib-theme.css');
  const themeImport = `./${relative(dirname(entry), theme).split('\\').join('/')}`;

  const config = { preset, css, entry, theme };
  const wrote = await place(io, CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`);
  await place(io, entry, entryCss(css, themeImport));
  await place(io, theme, THEME_CSS);

  const packages = ['@nib-ui/css', '@nib-ui/tokens', ...(css === 'tailwind' ? ['tailwindcss'] : [])];
  const html = Object.entries(PRESETS[preset].html)
    .map(([name, value]) => ` ${name}="${value}"`)
    .join('');
  io.out('');
  io.out(`Next: install ${packages.join(' ')}, then import ${entry} once in your app.`);
  if (html) io.out(`The ${preset} preset sets the page: <html${html}>.`);
  io.out(wrote ? `Pulled a proof → ${CONFIG_FILE}. Locked up.` : 'Locked up.');
  return 0;
}

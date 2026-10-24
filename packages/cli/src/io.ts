import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';

/** Where a command runs and where it prints; tests pass their own. */
export interface Io {
  cwd: string;
  out(line: string): void;
  err(line: string): void;
  /** Asks a question and returns the answer (empty for the default); absent when no one can answer. */
  ask?(question: string, fallback: string): Promise<string>;
}

export const processIo = (): Io => ({
  cwd: process.cwd(),
  out: (line) => process.stdout.write(`${line}\n`),
  err: (line) => process.stderr.write(`${line}\n`),
  // Only a person at a terminal is asked; in CI or a pipe the defaults are taken.
  ...(process.stdin.isTTY && {
    ask: async (question: string, fallback: string) => {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      try {
        return await rl.question(`${question} [${fallback}] `);
      } finally {
        rl.close();
      }
    },
  }),
});

/** A file's text, or null when it is not there; any other failure names the file. */
export async function readText(io: Io, path: string): Promise<string | null> {
  try {
    return await readFile(resolve(io.cwd, path), 'utf8');
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    throw new Error(`Cannot read ${path} (${code === 'EISDIR' ? 'a folder' : (code ?? (e as Error).message)}).`, {
      cause: e,
    });
  }
}

/** `nib.config.json`, written by `nib init`. Every field is optional. */
export interface NibConfig {
  /** The preset `nib init` set up: docs, dashboard, blog or landing. */
  preset?: string;
  /** How the CSS is loaded: Nib alone (`plain`) or under Tailwind (`tailwind`). */
  css?: string;
  /** The stylesheet the app imports once. */
  entry?: string;
  /** The stylesheet holding the project's `--nib-*` colour overrides. */
  theme?: string;
}

export const CONFIG_FILE = 'nib.config.json';

/** The project's config, or an empty one when there is none; a broken file is an error. */
export async function readConfig(io: Io): Promise<NibConfig> {
  const text = await readText(io, CONFIG_FILE);
  if (text === null) return {};
  let config: unknown;
  try {
    config = JSON.parse(text);
  } catch {
    // Reported below with the file's name.
  }
  if (!config || typeof config !== 'object' || Array.isArray(config))
    throw new Error(`${CONFIG_FILE} is not a JSON object.`);
  for (const key of ['preset', 'css', 'entry', 'theme']) {
    const value = (config as Record<string, unknown>)[key];
    if (value !== undefined && typeof value !== 'string')
      throw new Error(
        `"${key}" in ${CONFIG_FILE} must be ${key === 'entry' || key === 'theme' ? 'the path of a stylesheet' : 'a string'}.`,
      );
  }
  return config as NibConfig;
}

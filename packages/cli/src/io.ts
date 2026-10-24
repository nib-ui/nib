import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/** Where a command runs and where it prints; tests pass their own. */
export interface Io {
  cwd: string;
  out(line: string): void;
  err(line: string): void;
}

export const processIo = (): Io => ({
  cwd: process.cwd(),
  out: (line) => process.stdout.write(`${line}\n`),
  err: (line) => process.stderr.write(`${line}\n`),
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
  const { theme } = config as Record<string, unknown>;
  if (theme !== undefined && typeof theme !== 'string')
    throw new Error(`"theme" in ${CONFIG_FILE} must be the path of a stylesheet.`);
  return config as NibConfig;
}

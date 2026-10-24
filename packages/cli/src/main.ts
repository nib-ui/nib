import { parseArgs } from 'node:util';
import { init } from './init.ts';
import type { Io } from './io.ts';
import { lint } from './lint.ts';
import { themeCheck } from './theme-check.ts';

const HELP = `Usage: nib <command>

  init [--preset <name>] [--css plain|tailwind] [--dir <folder>]
                             Set up Nib: writes nib.config.json, a CSS entry (Nib alone, or
                             under Tailwind) and an empty theme file in the folder (default
                             src). Presets: docs, dashboard, blog, landing. Asks when run in
                             a terminal; existing files are kept.

  theme check [file.css …]   Proof the theme's colours: contrast on three surfaces in both
                             themes, colour-vision distance and hue collisions. Reads the
                             files given, or the "theme" file in nib.config.json.

  lint [path …]              Check the Nib laws: CSS through Nib's Stylelint rules, and the
                             class names in HTML, JSX, Vue, Svelte and Astro for radius,
                             shadow, gradient, blur and off-token colours (Tailwind included).
                             Reads the current folder when no path is given.

  --help                     Show this.

Nib collects no telemetry.`;

/** Runs one command line (without `node` and the script) and returns the exit code. */
export async function main(args: readonly string[], io: Io): Promise<number> {
  const [command, sub, ...rest] = args;
  try {
    if (command === undefined || args.includes('--help') || args.includes('-h')) {
      io.out(HELP);
      return 0;
    }
    if (command === 'init') {
      const { values, positionals } = parseArgs({
        args: args.slice(1),
        options: { preset: { type: 'string' }, css: { type: 'string' }, dir: { type: 'string' } },
        allowPositionals: true,
      });
      if (!positionals.length) return await init(values, io);
    }
    const flag = args.slice(1).find((a) => a.startsWith('-'));
    if (command === 'theme' && sub === 'check' && !flag) return await themeCheck(rest, io);
    if (command === 'lint' && !flag) return await lint(args.slice(1), io);
    io.err(`error    ${flag ? `Unknown option: ${flag}` : `Unknown command: ${args.join(' ')}`}\n\n${HELP}`);
    return 2;
  } catch (e) {
    // A flag `init` does not know is a usage mistake, like an unknown command.
    const usage = String((e as NodeJS.ErrnoException).code).startsWith('ERR_PARSE_ARGS');
    io.err(`error    ${(e as Error).message}${usage ? `\n\n${HELP}` : ''}`);
    return usage ? 2 : 1;
  }
}

import type { Io } from './io.ts';
import { lint } from './lint.ts';
import { themeCheck } from './theme-check.ts';

const HELP = `Usage: nib <command>

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
    const flag = args.slice(1).find((a) => a.startsWith('-'));
    if (command === 'theme' && sub === 'check' && !flag) return await themeCheck(rest, io);
    if (command === 'lint' && !flag) return await lint(args.slice(1), io);
    io.err(`error    ${flag ? `Unknown option: ${flag}` : `Unknown command: ${args.join(' ')}`}\n\n${HELP}`);
    return 2;
  } catch (e) {
    io.err(`error    ${(e as Error).message}`);
    return 1;
  }
}

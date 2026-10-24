import type { Io } from './io.ts';
import { themeCheck } from './theme-check.ts';

const HELP = `Usage: nib <command>

  theme check [file.css …]   Proof the theme's colours: contrast on three surfaces in both
                             themes, colour-vision distance and hue collisions. Reads the
                             files given, or the "theme" file in nib.config.json.

  --help                     Show this.

Nib collects no telemetry.`;

/** Runs one command line (without `node` and the script) and returns the exit code. */
export async function main(args: readonly string[], io: Io): Promise<number> {
  const [command, sub, ...rest] = args;
  try {
    if (command === 'theme' && sub === 'check') return await themeCheck(rest, io);
    if (command === undefined || command === '--help' || command === '-h') {
      io.out(HELP);
      return 0;
    }
    io.err(`error    Unknown command: ${args.join(' ')}\n\n${HELP}`);
    return 2;
  } catch (e) {
    io.err(`error    ${(e as Error).message}`);
    return 1;
  }
}

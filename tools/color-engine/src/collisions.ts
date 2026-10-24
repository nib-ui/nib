import { distance } from './distance.ts';
import { colour, floor1, themeTag, type ProofMark, type Theme } from './proof-marks.ts';
import type { Vision } from './vision.ts';

// Below this ΔE (OKLab × 100) normal vision reads two colours as the same one.
const SAME_COLOUR = 8;
// Below this ΔE under a colour-vision deficiency the accent is hard to tell from a fixed hue.
// Only a warning: law 5 makes every hue travel with a word.
const CVD_CLOSE = 10;

/** The six semantic hues. */
export const HUES = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta'];
const FIXED_HUES = ['red', 'green', 'yellow'];
const VISION_NAMES: Record<Vision, string> = { protan: 'protanopia', deutan: 'deuteranopia', tritan: 'tritanopia' };

export const COLLISION_COLOURS = ['accent', ...HUES];

export function collisionMarks(colors: Record<string, string>, theme: Theme): ProofMark[] {
  const accent = colour(colors, 'accent');
  const place = themeTag(theme);
  const same = HUES.flatMap((hue) => {
    const d = distance(accent, colour(colors, hue));
    if (d >= SAME_COLOUR) return [];
    const message = `Proof mark: accent and ${hue} are ${floor1(d)} apart ${place}, under ${SAME_COLOUR}. Move the accent further from ${hue}.`;
    return [{ severity: 'error' as const, theme, message }];
  });
  const cvd = FIXED_HUES.flatMap((hue) =>
    (Object.keys(VISION_NAMES) as Vision[]).flatMap((vision) => {
      const d = distance(accent, colour(colors, hue), vision);
      if (d >= CVD_CLOSE) return [];
      const message = `Proof mark: accent and ${hue} are ${floor1(d)} apart for ${VISION_NAMES[vision]} ${place}, under ${CVD_CLOSE}. Pair every use with a word.`;
      return [{ severity: 'warning' as const, theme, message }];
    }),
  );
  return [...same, ...cvd];
}

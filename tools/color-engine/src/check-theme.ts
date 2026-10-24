import { HUE_MIX } from '@nib-ui/tokens';
import { COLLISION_COLOURS, collisionMarks, HUES } from './collisions.ts';
import { contrast } from './contrast.ts';
import { composite } from './srgb.ts';
import { colour, floor1, placeName, type ProofMark, type Theme, type ThemeColors } from './proof-marks.ts';

const SURFACES = ['surface', 'surface-raised', 'surface-overlay'];
const SYNTAX = ['syntax-keyword', 'syntax-string', 'syntax-number', 'syntax-identifier'];
const TEXT = 4.5;
const MARK = 3;

interface ContrastRule {
  fg: string;
  bg: string;
  min: number;
}

// Every pair the spec promises (Accessibility: text ≥ 4.5:1 on all three surfaces, accent marks
// ≥ 3:1). Exempt: on-surface-4 (decorative glyphs only) and line (decorative hairlines).
const onSurfaces = (names: string[], min: number) => names.flatMap((fg) => SURFACES.map((bg) => ({ fg, bg, min })));
const CONTRAST_RULES: ContrastRule[] = [
  ...onSurfaces(['on-surface', 'on-surface-2', 'on-surface-3', 'accent-text', ...HUES], TEXT),
  ...SYNTAX.map((fg) => ({ fg, bg: 'surface-raised', min: TEXT })),
  { fg: 'on-cursor', bg: 'cursor', min: TEXT },
  ...HUES.map((bg) => ({ fg: 'on-hue', bg, min: TEXT })),
  ...onSurfaces(['accent'], MARK),
  // The jade rule drawn on the ink-inverted cursor block.
  { fg: 'accent', bg: 'cursor', min: MARK },
];

/** Every colour any rule reads; a renamed token must fail loudly, not skip its checks. */
const REQUIRED = [...new Set([...CONTRAST_RULES.flatMap((r) => [r.fg, r.bg]), ...COLLISION_COLOURS])];

const fail = (theme: Theme, fg: string, place: string, ratio: number, min: number): ProofMark[] => [
  { severity: 'error', theme, message: `Proof mark: ${fg} on ${place} is ${floor1(ratio)}:1, needs ${min}:1.` },
];

function contrastMarks(colors: Record<string, string>, theme: Theme): ProofMark[] {
  return CONTRAST_RULES.flatMap(({ fg, bg, min }) => {
    const ratio = contrast(colour(colors, fg), colour(colors, bg));
    return ratio >= min ? [] : fail(theme, fg, placeName(bg, theme), ratio, min);
  });
}

/**
 * A tag sets hue text on that hue's -soft fill, which is the hue at a few percent over whatever
 * surface holds the tag; the tint pulls the background towards the text.
 */
function softTagMarks(colors: Record<string, string>, theme: Theme): ProofMark[] {
  const percent = HUE_MIX.soft[theme === 'light' ? 0 : 1];
  const alpha = Math.round((percent / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  return HUES.flatMap((hue) =>
    SURFACES.flatMap((surface) => {
      const hex = colour(colors, hue);
      const ratio = contrast(hex, composite(`${hex}${alpha}`, colour(colors, surface)));
      return ratio >= TEXT ? [] : fail(theme, hue, `${hue}-soft over ${placeName(surface, theme)}`, ratio, TEXT);
    }),
  );
}

/** Runs every contrast and colour-distance rule on both themes. */
export function checkTheme(colors: ThemeColors): ProofMark[] {
  return (['dark', 'light'] as const).flatMap((theme) => {
    const missing = REQUIRED.filter((name) => !(name in colors[theme]));
    if (missing.length) throw new Error(`The ${theme} theme lacks ${missing.join(', ')}`);
    // Contrast and distance are only meaningful for opaque colours; translucent ones (line, hover,
    // scrim) are exempt from every rule.
    for (const name of REQUIRED) {
      const hex = colour(colors[theme], name);
      if (hex.length > 7) throw new Error(`${name} in the ${theme} theme must be opaque, got ${hex}`);
    }
    return [
      ...contrastMarks(colors[theme], theme),
      ...softTagMarks(colors[theme], theme),
      ...collisionMarks(colors[theme], theme),
    ];
  });
}

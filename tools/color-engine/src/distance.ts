import { toLinear, type LinearRgb } from './srgb.ts';
import { simulateLinear, type Vision } from './vision.ts';

// Björn Ottosson's linear sRGB → OKLab.
function oklab([r, g, b]: LinearRgb): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/**
 * ΔE in OKLab × 100 between two opaque colours, optionally as seen with a colour-vision
 * deficiency. Around 2 is barely visible; Nib treats under 8 as the same colour.
 */
export function distance(a: string, b: string, vision?: Vision): number {
  const see = (hex: string) => {
    const rgb = toLinear(hex);
    return oklab(vision ? simulateLinear(rgb, vision) : rgb);
  };
  const [x, y] = [see(a), see(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) * 100;
}

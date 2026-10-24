/** Linear-light RGB, each channel 0–1. */
export type LinearRgb = [number, number, number];

/** Parses `#rrggbb` or `#rrggbbaa` into 0–255 channels and an alpha of 0–1. */
export function parseHex(hex: string): { rgb: [number, number, number]; alpha: number } {
  const [, digits, alpha] = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex) ?? [];
  if (!digits) throw new Error(`Not a hex colour: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as [number, number, number];
  return { rgb: [r, g, b], alpha: alpha ? parseInt(alpha, 16) / 255 : 1 };
}

export const toHex = (rgb: [number, number, number]) =>
  `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`;

/** Blends a possibly translucent colour over an opaque background, in sRGB as browsers do. */
export function composite(fg: string, bg: string): string {
  const top = parseHex(fg);
  const base = parseHex(bg).rgb;
  return toHex(top.rgb.map((c, i) => c * top.alpha + (base[i] ?? 0) * (1 - top.alpha)) as [number, number, number]);
}

const decode = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const encode = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export const toLinear = (hex: string): LinearRgb => parseHex(hex).rgb.map(decode) as LinearRgb;
export const fromLinear = (rgb: LinearRgb) => toHex(rgb.map(encode) as [number, number, number]);

import { composite, toLinear } from './srgb.ts';

const luminance = (hex: string) => {
  const [r, g, b] = toLinear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.x contrast ratio (1–21). A translucent foreground is composited over `bg` first. */
export function contrast(fg: string, bg: string): number {
  const [a, b] = [luminance(composite(fg, bg)), luminance(bg)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

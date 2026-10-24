import { fromLinear, toLinear, type LinearRgb } from './srgb.ts';

export type Vision = 'protan' | 'deutan' | 'tritan';

type Matrix = [LinearRgb, LinearRgb, LinearRgb];

// Machado, Oliveira & Fernandes (2009), severity 1.0, applied to linear RGB.
const MACHADO: Record<Vision, Matrix> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function simulateLinear(rgb: LinearRgb, vision: Vision): LinearRgb {
  return MACHADO[vision].map(([a, b, c]) => clamp(a * rgb[0] + b * rgb[1] + c * rgb[2])) as LinearRgb;
}

/** How an opaque colour looks with full protanopia, deuteranopia or tritanopia. */
export const simulate = (hex: string, vision: Vision) => fromLinear(simulateLinear(toLinear(hex), vision));

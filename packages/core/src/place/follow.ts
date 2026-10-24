import type { Host } from '../host.ts';
import { place, type Align, type Placement, type Side } from './place.ts';

export interface FollowOptions {
  side?: Side;
  align?: Align;
  offset?: number;
  dir?: 'ltr' | 'rtl';
}

/** Two placements that put the box in the same place, so a scroll that moved nothing renders nothing. */
export const samePlacement = (a: Placement | null, b: Placement | null) =>
  a === b || (!!a && !!b && (Object.keys(a) as (keyof Placement)[]).every((k) => a[k] === b[k]));

/**
 * Places the element `floatingRef` beside `anchorRef` through the geometry seam, in the anchor's
 * writing direction unless one is given. `size` is the floating box's natural size, when known.
 */
export function measurePlacement(
  host: Host,
  anchorRef: string,
  floatingRef: string,
  options: FollowOptions,
  size = host.geometry.measure(floatingRef),
): Placement | null {
  const anchor = host.geometry.measure(anchorRef);
  if (!anchor || !size) return null;
  const dir = options.dir ?? host.geometry.direction?.(anchorRef) ?? 'ltr';
  return place({ anchor, floating: size, viewport: host.geometry.viewport(), ...options, dir });
}

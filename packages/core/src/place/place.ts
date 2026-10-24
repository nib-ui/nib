import type { Rect, Size } from '../host.ts';

/** The side of the anchor the floating box sits on; start and end follow the writing direction. */
export type Side = 'top' | 'bottom' | 'start' | 'end';
export type Align = 'start' | 'center' | 'end';

export interface PlaceInput {
  /** The anchor's box, in viewport pixels. */
  anchor: Rect;
  /** The floating box's natural size. */
  floating: Size;
  viewport: Size;
  side?: Side;
  align?: Align;
  /** Gap between anchor and floating box. */
  offset?: number;
  /** Space kept free along the viewport's edges. */
  padding?: number;
  dir?: 'ltr' | 'rtl';
}

export interface Placement {
  /** Top-left corner in viewport pixels (physical, whatever the direction). */
  x: number;
  y: number;
  /** The side it ended on after flipping, in logical terms. */
  side: Side;
  align: Align;
  /** The room on that side: cap the floating box to it. */
  maxWidth: number;
  maxHeight: number;
}

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', start: 'end', end: 'start' };

/**
 * Places a floating box next to an anchor: on the preferred side, flipped to the opposite side when
 * it does not fit there and the other side has more room, shifted along the edge to stay inside
 * the viewport, and capped to the room it has. Pure: positioning controllers feed it boxes from the
 * geometry seam. (Remove once CSS anchor positioning ships in every engine.)
 */
export function place({
  anchor,
  floating,
  viewport,
  side = 'bottom',
  align = 'start',
  offset = 4,
  padding = 8,
  dir = 'ltr',
}: PlaceInput): Placement {
  const rtl = dir === 'rtl';
  // Physical room on each side of the anchor, inside the padding.
  const room = {
    top: anchor.y - offset - padding,
    bottom: viewport.height - (anchor.y + anchor.height) - offset - padding,
    left: anchor.x - offset - padding,
    right: viewport.width - (anchor.x + anchor.width) - offset - padding,
  };
  const physical = (s: Side) => (s === 'start' ? (rtl ? 'right' : 'left') : s === 'end' ? (rtl ? 'left' : 'right') : s);
  const vertical = side === 'top' || side === 'bottom';
  const need = vertical ? floating.height : floating.width;
  const chosen =
    room[physical(side)] < need && room[physical(OPPOSITE[side])] > room[physical(side)] ? OPPOSITE[side] : side;
  const at = physical(chosen);

  const clamp = (v: number, size: number, limit: number) => Math.max(padding, Math.min(v, limit - padding - size));

  if (vertical) {
    // Align along the inline axis: start is the anchor's left edge in ltr, its right edge in rtl.
    const startX = rtl ? anchor.x + anchor.width - floating.width : anchor.x;
    const endX = rtl ? anchor.x : anchor.x + anchor.width - floating.width;
    const x = align === 'center' ? anchor.x + (anchor.width - floating.width) / 2 : align === 'start' ? startX : endX;
    const y = at === 'top' ? anchor.y - offset - floating.height : anchor.y + anchor.height + offset;
    const maxHeight = Math.max(0, room[at as 'top' | 'bottom']);
    return {
      x: clamp(x, floating.width, viewport.width),
      // An anchor scrolled out of view leaves the box at the viewport's edge, never outside it.
      y: clamp(y, Math.min(floating.height, maxHeight), viewport.height),
      side: chosen,
      align,
      maxWidth: viewport.width - 2 * padding,
      maxHeight,
    };
  }
  const y =
    align === 'center'
      ? anchor.y + (anchor.height - floating.height) / 2
      : align === 'start'
        ? anchor.y
        : anchor.y + anchor.height - floating.height;
  const x = at === 'left' ? anchor.x - offset - floating.width : anchor.x + anchor.width + offset;
  const maxWidth = Math.max(0, room[at as 'left' | 'right']);
  return {
    x: clamp(x, Math.min(floating.width, maxWidth), viewport.width),
    y: clamp(y, floating.height, viewport.height),
    side: chosen,
    align,
    maxWidth,
    maxHeight: viewport.height - 2 * padding,
  };
}

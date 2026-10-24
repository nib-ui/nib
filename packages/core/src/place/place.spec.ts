import { describe, expect, it } from 'vitest';
import { place, type PlaceInput } from './place.ts';

const VIEW = { width: 400, height: 300 };
const input = (over: Partial<PlaceInput> = {}): PlaceInput => ({
  anchor: { x: 100, y: 100, width: 80, height: 20 },
  floating: { width: 120, height: 60 },
  viewport: VIEW,
  ...over,
});

describe('place', () => {
  it('puts the floating box below the anchor, aligned to its start, offset by the gap', () => {
    expect(place(input())).toMatchObject({ x: 100, y: 124, side: 'bottom', align: 'start' });
  });

  it('aligns to the centre or the end of the anchor', () => {
    expect(place(input({ align: 'center' })).x).toBe(80);
    expect(place(input({ align: 'end' })).x).toBe(60);
  });

  it('treats start and end as the writing direction says', () => {
    expect(place(input({ dir: 'rtl' })).x).toBe(60);
    expect(place(input({ side: 'end' }))).toMatchObject({ x: 184, y: 100, side: 'end' });
    // In right-to-left the end side is on the left, which is too small here: it flips to the start (right).
    expect(place(input({ side: 'end', dir: 'rtl' }))).toMatchObject({ x: 184, side: 'start' });
  });

  it('flips to the other side when the preferred one is too small and the other is larger', () => {
    const low = input({ anchor: { x: 100, y: 250, width: 80, height: 20 } });
    expect(place(low)).toMatchObject({ side: 'top', y: 186 });
    // Neither side fits: it stays on the larger one and is capped to that room.
    const tall = input({ floating: { width: 120, height: 280 } });
    expect(place(tall)).toMatchObject({ side: 'bottom', maxHeight: 300 - 124 - 8 });
  });

  it('shifts along the edge to stay inside the viewport padding', () => {
    expect(place(input({ anchor: { x: 350, y: 100, width: 40, height: 20 } })).x).toBe(400 - 8 - 120);
    expect(place(input({ anchor: { x: -30, y: 100, width: 40, height: 20 } })).x).toBe(8);
  });

  it('caps the size to the room on its side', () => {
    expect(place(input())).toMatchObject({ maxHeight: 300 - 124 - 8, maxWidth: 400 - 16 });
  });
});

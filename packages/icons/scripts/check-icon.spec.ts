import { describe, expect, it } from 'vitest';
import { checkIcon } from './check-icon.ts';

const svg = (inner: string, size = 16) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${inner}</svg>`;
const problems = (inner: string, size?: number) => checkIcon(svg(inner, size)).problems;

describe('checkIcon', () => {
  it('accepts straight 90° and 45° strokes on the pixel grid, at 16 or 20', () => {
    expect(problems('<path d="M3.5 5.5 L7.5 9.5 L11.5 5.5"/>')).toEqual([]);
    expect(problems('<path d="M2.5 7.5 H12.5 M7.5 2.5 V12.5"/>')).toEqual([]);
    expect(problems('<path stroke-width="2" d="M3 10 H17"/>', 20)).toEqual([]);
    expect(problems('<path d="M7.5 4.5 V4.5"/>')).toEqual([]);
    expect(checkIcon(svg('<path d="M2.5 7.5 H12.5"/>', 20)).size).toBe(20);
  });

  it('rejects curves and arcs', () => {
    expect(problems('<path d="M2.5 2.5 C4 4 6 6 8 8"/>')).toEqual(['curve or arc command "C" (only M L H V Z)']);
    expect(problems('<path d="M2.5 2.5 A4 4 0 0 1 8 8"/>')[0]).toMatch(/"A"/);
  });

  it('rejects angles other than 90° and 45°', () => {
    expect(problems('<path d="M2.5 2.5 L8.5 5.5"/>')).toEqual(['segment 2.5,2.5 → 8.5,5.5 is not at 0°, 45° or 90°']);
  });

  it('follows Z, relative commands and implicit repeats', () => {
    expect(problems('<path d="M2.5 2.5 H12.5 V12.5 Z"/>')).toEqual([]);
    expect(problems('<path d="M2.5 2.5 H12.5 V9.5 Z"/>')).toEqual([
      'segment 12.5,9.5 → 2.5,2.5 is not at 0°, 45° or 90°',
    ]);
    expect(problems('<path d="M2.5 2.5 h10 v10 h-10 z"/>')).toEqual([]);
    expect(problems('<path d="M2.5 2.5 12.5 12.5"/>')).toEqual([]);
    expect(problems('<path d="m2.5 2.5 3 1"/>')).toEqual(['segment 2.5,2.5 → 5.5,3.5 is not at 0°, 45° or 90°']);
  });

  it('puts every point where the stroke covers whole pixels: .5 for 1px, whole for 2px', () => {
    expect(problems('<path d="M2 8 H12"/>')).toEqual([
      '1px stroke point 2,8 straddles two pixels',
      '1px stroke point 12,8 straddles two pixels',
    ]);
    expect(problems('<path d="M2.5 7.5 H12"/>')).toEqual(['1px stroke point 12,7.5 straddles two pixels']);
    expect(problems('<path stroke-width="2" d="M2.5 7.5 V12.5"/>')[0]).toBe(
      '2px stroke point 2.5,7.5 straddles two pixels',
    );
  });

  it('keeps the stroke and its square cap inside the box', () => {
    expect(problems('<path d="M0.5 7.5 H15.5"/>')).toEqual([]);
    expect(problems('<path stroke-width="2" d="M0 8 H12"/>')).toEqual([
      'point 0,8 puts the stroke outside the 16×16 box',
    ]);
  });

  it('rejects empty, unanchored or unreadable paths', () => {
    expect(problems('')).toEqual(['no <path>']);
    expect(problems('<path d=""/>')).toEqual(['<path> without a d']);
    expect(problems('<path d="L2.5 2.5 H8.5"/>')).toEqual(['path "L2.5 2.5 H8.5" does not start with M']);
    expect(problems("<path d='M2 2 C4 4 6 6 8 8'/>")).toEqual(['attribute "d" in single quotes', '<path> without a d']);
  });

  it('rejects other caps, joins, colours, shapes, weights, sizes and points outside the box', () => {
    expect(problems('<path stroke-linecap="round" d="M2.5 7.5 H12.5"/>')).toEqual([
      'attribute "stroke-linecap" on <path>',
    ]);
    expect(problems('<path fill="red" d="M2.5 7.5 H12.5"/>')).toEqual(['attribute "fill" on <path>']);
    expect(problems('<circle cx="8" cy="8" r="4"/>')).toEqual(['element <circle> (only <path>)', 'no <path>']);
    expect(problems('<path stroke-width="3" d="M2.5 7.5 H12.5"/>')).toEqual(['stroke-width 3 (only 1 or 2)']);
    expect(problems('<path d="M2.5 7.5 H18.5"/>')).toEqual(['point 18.5,7.5 puts the stroke outside the 16×16 box']);
    expect(problems('<path d="M2.5 7.5 H12.5"/>', 24)).toEqual(['viewBox 0 0 24 24 (only 16 or 20)']);
  });
});

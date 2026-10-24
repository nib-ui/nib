import { afterEach, describe, expect, it } from 'vitest';
import { runIntents } from './index.ts';

const html = (markup: string) => {
  document.body.innerHTML = markup;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('runIntents', () => {
  it('moves focus to the element a focus intent names', () => {
    html('<button id="a">A</button><button id="b">B</button>');
    runIntents([{ type: 'focus', ref: 'b' }]);
    expect(document.activeElement?.id).toBe('b');
  });

  it('scrolls the element a scroll-into-view intent names into its scroll container', () => {
    html(`<div id="list" style="height:40px;overflow:auto">
      ${Array.from({ length: 20 }, (_, i) => `<div id="o${i}" style="height:20px">${i}</div>`).join('')}
    </div>`);
    runIntents([{ type: 'scroll-into-view', ref: 'o10', block: 'nearest' }]);
    // Row 10 starts at 200px; "nearest" aligns its bottom (220px) with the 40px viewport.
    expect(document.getElementById('list')?.scrollTop).toBe(180);
  });

  it('centres the element when block is center', () => {
    html(`<div id="list" style="height:40px;overflow:auto">
      ${Array.from({ length: 20 }, (_, i) => `<div id="o${i}" style="height:20px">${i}</div>`).join('')}
    </div>`);
    runIntents([{ type: 'scroll-into-view', ref: 'o10', block: 'center' }]);
    // Row 10's middle (210px) sits in the middle of the 40px viewport.
    expect(document.getElementById('list')?.scrollTop).toBe(190);
  });

  it('returns the intents whose element is not in the document, and still runs the rest', () => {
    html('<button id="b">B</button>');
    const missing = runIntents([
      { type: 'focus', ref: 'gone' },
      { type: 'scroll-into-view', ref: 'also-gone', block: 'nearest' },
      { type: 'focus', ref: 'b' },
    ]);
    expect(missing).toEqual([
      { type: 'focus', ref: 'gone' },
      { type: 'scroll-into-view', ref: 'also-gone', block: 'nearest' },
    ]);
    expect(document.activeElement?.id).toBe('b');
  });
});

import { page } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { domGeometry } from './index.ts';

const frames = async (n = 2) => {
  for (let i = 0; i < n; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
};

const scroller = () => {
  document.body.innerHTML = '<div id="s" style="height:50px;overflow:auto"><div style="height:500px"></div></div>';
  return document.getElementById('s') as HTMLElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('domGeometry', () => {
  it('measures the laid-out box of an element by id, and null when it is absent', () => {
    document.body.innerHTML =
      '<div style="position:absolute;left:30px;top:40px;width:120px;height:24px" id="anchor"></div>';
    const geometry = domGeometry();
    expect(geometry.measure('anchor')).toEqual({ x: 30, y: 40, width: 120, height: 24 });
    expect(geometry.measure('missing')).toBeNull();
  });

  it('reports the visible viewport size', async () => {
    await page.viewport(420, 300);
    expect(domGeometry().viewport()).toEqual({ width: 420, height: 300 });
  });

  it('calls watchers once per frame when any scroll container scrolls', async () => {
    const s = scroller();
    await frames();
    let calls = 0;
    const stop = domGeometry().watch(() => calls++);
    s.scrollTop = 10;
    s.dispatchEvent(new Event('scroll'));
    s.scrollTop = 20;
    s.dispatchEvent(new Event('scroll'));
    await frames();
    stop();
    expect(calls).toBe(1);
  });

  it('calls watchers when the viewport resizes', async () => {
    await page.viewport(500, 400);
    await frames();
    let calls = 0;
    const stop = domGeometry().watch(() => calls++);
    await frames();
    const before = calls;
    await page.viewport(360, 400);
    await frames();
    stop();
    expect(calls).toBeGreaterThan(before);
  });

  it('calls watchers when the page content changes size', async () => {
    document.body.innerHTML = '<div id="grow" style="height:10px"></div>';
    await frames();
    let calls = 0;
    const stop = domGeometry().watch(() => calls++);
    await frames();
    const before = calls;
    (document.getElementById('grow') as HTMLElement).style.height = '900px';
    await frames(3);
    stop();
    expect(calls).toBeGreaterThan(before);
  });

  it('stops calling once the watch is stopped', async () => {
    const s = scroller();
    let calls = 0;
    const stop = domGeometry().watch(() => calls++);
    await frames();
    stop();
    const before = calls;
    s.scrollTop = 30;
    s.dispatchEvent(new Event('scroll'));
    await page.viewport(380, 300);
    document.body.append(Object.assign(document.createElement('div'), { style: 'height:700px' }));
    await frames(3);
    expect(calls).toBe(before);
  });
});

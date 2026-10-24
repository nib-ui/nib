import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { destroy, init } from './index.ts';
import './disclosure.ts';

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
});

describe('disclosure and accordion (vanilla)', () => {
  it('a disclosure button shows and hides its panel', async () => {
    document.body.innerHTML = `<div data-nib="disclosure"><button data-nib-trigger>Shipping</button><div data-nib-panel>3–5 days</div></div>`;
    init();
    const button = document.querySelector('button') as HTMLButtonElement;
    const panel = document.querySelector('[data-nib-panel]') as HTMLElement;
    expect(panel.hidden).toBe(true);
    expect(button.getAttribute('aria-controls')).toBe(panel.id);
    await userEvent.click(button);
    expect(panel.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('an accordion opens one section at a time and arrows move between its buttons', async () => {
    document.body.innerHTML = `<div data-nib="accordion">
      <div data-nib-item="a" data-open><h3><button data-nib-trigger>A</button></h3><div data-nib-panel>a</div></div>
      <div data-nib-item="b"><h3><button data-nib-trigger>B</button></h3><div data-nib-panel>b</div></div>
    </div>`;
    init();
    const [a, b] = [...document.querySelectorAll('button')] as HTMLButtonElement[];
    const [pa, pb] = [...document.querySelectorAll<HTMLElement>('[data-nib-panel]')];
    expect(pa?.hidden).toBe(false);
    await userEvent.click(b as HTMLButtonElement);
    expect(pa?.hidden).toBe(true);
    expect(pb?.hidden).toBe(false);
    a?.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(b);
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(a);
  });
});

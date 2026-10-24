import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { destroy, init } from './index.ts';
import './tabs.ts';

const MARKUP = `<div data-nib="tabs" data-value="b">
  <div data-nib-tablist aria-label="Letters">
    <button data-nib-tab="a">A</button><button data-nib-tab="b">B</button><button data-nib-tab="c">C</button>
  </div>
  <div data-nib-panel="a">a</div><div data-nib-panel="b">b</div><div data-nib-panel="c">c</div>
</div>`;
const tab = (key: string) => document.querySelector(`[data-nib-tab="${key}"]`) as HTMLButtonElement;
const panel = (key: string) => document.querySelector(`[data-nib-panel="${key}"]`) as HTMLElement;

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
});

describe('tabs (vanilla)', () => {
  it('starts on data-value, and arrows select and focus the next tab', async () => {
    document.body.innerHTML = MARKUP;
    init();
    expect(tab('b').getAttribute('aria-selected')).toBe('true');
    expect(panel('a').hidden).toBe(true);
    tab('b').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('c'));
    expect(panel('c').hidden).toBe(false);
    expect(tab('b').tabIndex).toBe(-1);
  });

  it('follows the writing direction of the page, also when it changes after setup', async () => {
    document.body.innerHTML = MARKUP;
    init();
    document.documentElement.dir = 'rtl';
    tab('b').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('c'));
  });

  it('picks up a tab added later', async () => {
    document.body.innerHTML = MARKUP;
    init();
    tab('c').insertAdjacentHTML('afterend', '<button data-nib-tab="d">D</button>');
    panel('c').insertAdjacentHTML('afterend', '<div data-nib-panel="d">d</div>');
    await new Promise((r) => setTimeout(r));
    await userEvent.click(tab('d'));
    expect(panel('d').hidden).toBe(false);
  });
});

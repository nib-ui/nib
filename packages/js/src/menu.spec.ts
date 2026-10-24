import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { destroy, init } from './index.ts';
import './menu.ts';

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
});

describe('menu (vanilla)', () => {
  it('opens from the keyboard on the first item, chooses with Enter and flips a checkbox item', async () => {
    document.body.innerHTML = `<div data-nib="menu" style="margin: 40px">
      <button data-nib-button>Edit</button>
      <div data-nib-menu>
        <div data-nib-item="copy">Copy</div>
        <div data-nib-item="wrap" data-kind="checkbox">Wrap lines</div>
      </div>
    </div>`;
    init();
    const button = document.querySelector('button') as HTMLButtonElement;
    const menu = document.querySelector('[data-nib-menu]') as HTMLElement;
    const seen: unknown[] = [];
    document.body.addEventListener('nib:select', (e) => seen.push((e as CustomEvent).detail));
    button.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(() => menu.matches(':popover-open')).toBe(true);
    await expect.poll(() => document.activeElement).toBe(menu);
    expect(menu.getAttribute('aria-activedescendant')).toMatch(/-item-copy$/);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect.poll(() => menu.matches(':popover-open')).toBe(false);
    expect(document.activeElement).toBe(button);
    await expect.poll(() => seen).toEqual([{ key: 'wrap' }]);
    const wrap = document.querySelector('[data-nib-item="wrap"]') as HTMLElement;
    await expect.poll(() => wrap.getAttribute('aria-checked')).toBe('true');
  });
});

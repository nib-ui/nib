import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { destroy, init } from './index.ts';
import './combobox.ts';

const MARKUP = `<div data-nib="combobox" lang="vi">
  <label for="city">City</label><input id="city" data-nib-input />
  <ul data-nib-listbox><li data-nib-option="hn">Hà Nội</li><li data-nib-option="hcm">Hồ Chí Minh</li><li data-nib-option="dn">Đà Nẵng</li></ul>
</div>`;
const input = () => document.querySelector('input') as HTMLInputElement;
const list = () => document.querySelector('[data-nib-listbox]') as HTMLElement;
const visible = () =>
  [...document.querySelectorAll<HTMLElement>('[data-nib-option]')]
    .filter((o) => !o.hidden)
    .map((o) => o.dataset['nibOption']);

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
});

describe('combobox (vanilla)', () => {
  it('filters as you type, ignoring diacritics, and Enter writes the choice into the field', async () => {
    document.body.innerHTML = MARKUP;
    init();
    await userEvent.type(input(), 'da n');
    await expect.poll(() => list().matches(':popover-open')).toBe(true);
    expect(visible()).toEqual(['dn']);
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => input().value).toBe('Đà Nẵng');
    expect(list().matches(':popover-open')).toBe(false);
    expect(document.activeElement).toBe(input());
  });

  it('waits for an IME composition to end before filtering', async () => {
    document.body.innerHTML = MARKUP;
    init();
    const field = input();
    field.focus();
    field.dispatchEvent(new CompositionEvent('compositionstart'));
    field.value = 'tieesng';
    field.dispatchEvent(new InputEvent('input', { data: 's', isComposing: true }));
    expect(visible()).toEqual(['hn', 'hcm', 'dn']);
    field.value = 'Hồ';
    field.dispatchEvent(new CompositionEvent('compositionend', { data: 'Hồ' }));
    await expect.poll(visible).toEqual(['hcm']);
  });
});

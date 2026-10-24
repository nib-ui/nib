import { describe, expect, it, vi } from 'vitest';
import { createTestHost } from '../testing/test-host.ts';
import { runConformance } from '../testing/conformance.ts';
import { createListbox, type ListboxOptions } from './index.ts';
import { listboxApg } from './listbox.apg.ts';

const ITEMS = [
  { key: 'en', label: 'English' },
  { key: 'fr', label: 'Français', disabled: true },
  { key: 'vi', label: 'Tiếng Việt' },
  { key: 'ar', label: 'العربية' },
];

function setup(options: Partial<ListboxOptions> = {}) {
  const t = createTestHost();
  const listbox = createListbox({ id: 'lb', items: ITEMS, ...options }, t.host);
  const list = () => listbox.part('list');
  const option = (key: string) => listbox.part('option', key);
  const press = (key: string, init = {}) => t.fire(list(), 'keydown', { key, ...init });
  return { t, listbox, list, option, press };
}

describe('createListbox: rendering and movement', () => {
  it('renders an APG listbox whose options carry ids, roles and their disabled state', () => {
    const { list, option } = setup();
    expect(list().attrs).toMatchObject({ id: 'lb-list', role: 'listbox', tabindex: 0 });
    expect(list().attrs['aria-activedescendant']).toBeUndefined();
    expect(option('en').attrs).toMatchObject({ id: 'lb-option-en', role: 'option', 'aria-selected': false });
    expect(option('fr').attrs['aria-disabled']).toBe(true);
    expect(option('en').attrs['aria-disabled']).toBeUndefined();
  });

  it('moves the current option with the arrows, skipping disabled ones, and scrolls it into view', () => {
    const { t, list, option, press } = setup();
    press('ArrowDown');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-en');
    expect(option('en').attrs['data-current']).toBe(true);
    expect(t.prevented).toBe(true);
    expect(press('ArrowDown')).toEqual([{ type: 'scroll-into-view', ref: 'lb-option-vi', block: 'nearest' }]);
    expect(option('en').attrs['data-current']).toBeUndefined();
    press('End');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-ar');
    // At the edge the position stays and nothing scrolls.
    expect(press('ArrowDown')).toEqual([]);
    press('Home');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-en');
    press('ArrowUp');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-en');
  });

  it('leaves keys it does not handle to the browser', () => {
    const { t, press } = setup();
    press('Tab');
    expect(t.prevented).toBe(false);
  });
});

describe('createListbox: the chosen value', () => {
  it('chooses the current option with Enter or Space and shows it as the selected one', () => {
    const onValueChange = vi.fn();
    const { t, option, press, listbox } = setup({ onValueChange });
    press('ArrowDown');
    press('ArrowDown');
    press('Enter');
    expect(option('vi').attrs['aria-selected']).toBe(true);
    expect(option('en').attrs['aria-selected']).toBe(false);
    expect(listbox.state.value).toBe('vi');
    expect(onValueChange).toHaveBeenCalledWith('vi');
    press('ArrowUp');
    press(' ');
    expect(t.prevented).toBe(true);
    expect(listbox.state.value).toBe('en');
  });

  it('starts from defaultValue; a controlled value only changes when the caller passes it back', () => {
    expect(setup({ defaultValue: 'ar' }).option('ar').attrs['aria-selected']).toBe(true);
    const onValueChange = vi.fn();
    const { listbox, option, press } = setup({ value: 'en', onValueChange });
    press('End');
    press('Enter');
    expect(onValueChange).toHaveBeenCalledWith('ar');
    expect(option('en').attrs['aria-selected']).toBe(true);
    listbox.update({ value: 'ar' });
    expect(option('ar').attrs['aria-selected']).toBe(true);
  });

  it('chooses an option on click and makes it current; a disabled option ignores the click', () => {
    const { t, listbox, option } = setup();
    t.fire(option('vi'), 'click');
    expect(listbox.state).toMatchObject({ value: 'vi', current: 'vi' });
    t.fire(option('fr'), 'click');
    expect(listbox.state).toMatchObject({ value: 'vi', current: 'vi' });
  });
});

describe('createListbox: typeahead, focus and pointer', () => {
  it('finds options by typing, ignoring case and diacritics, and starts over after a pause', () => {
    const { t, list, press } = setup({ locale: 'vi' });
    press('t');
    press('i');
    press('e');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-vi');
    t.clock.advance(500);
    press('e');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-en');
  });

  it('ignores keys while an input method is composing', () => {
    const { t, list, press } = setup();
    press('ArrowDown', { isComposing: true });
    expect(list().attrs['aria-activedescendant']).toBeUndefined();
    expect(t.prevented).toBe(false);
  });

  it('on focus, makes the chosen option current, else the first enabled one', () => {
    const { t, list } = setup({ defaultValue: 'vi' });
    expect(t.fire(list(), 'focus')).toEqual([{ type: 'scroll-into-view', ref: 'lb-option-vi', block: 'nearest' }]);
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-vi');
    const other = setup();
    other.t.fire(other.list(), 'focus');
    expect(other.list().attrs['aria-activedescendant']).toBe('lb-option-en');
  });

  it('makes the option under the pointer current without scrolling', () => {
    const { t, list, option } = setup();
    expect(t.fire(option('ar'), 'pointermove')).toEqual([]);
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-ar');
    t.fire(option('fr'), 'pointermove');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-ar');
  });

  it('drops a current or chosen option whose item was removed', () => {
    const { listbox, press } = setup({ defaultValue: 'ar' });
    press('End');
    listbox.update({ items: ITEMS.slice(0, 3) });
    expect(listbox.state).toMatchObject({ current: null, value: null });
  });

  it('lets the caller rebind or switch off a key', () => {
    const { list, press } = setup({ keys: { next: ['j'], first: false } });
    press('j');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-en');
    press('ArrowDown');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-en');
    press('End');
    press('Home');
    expect(list().attrs['aria-activedescendant']).toBe('lb-option-ar');
  });
});

describe('createListbox: multiple', () => {
  it('checks rows with Space and click, as [x] rows, never as selected ones', () => {
    const onCheckedChange = vi.fn();
    const { t, list, option, press, listbox } = setup({ multiple: true, onCheckedChange });
    expect(list().attrs['aria-multiselectable']).toBe(true);
    press('ArrowDown');
    press(' ');
    t.fire(option('ar'), 'click');
    expect(listbox.state.checked).toEqual(['en', 'ar']);
    expect(onCheckedChange).toHaveBeenLastCalledWith(['en', 'ar']);
    expect(option('en').attrs).toMatchObject({ 'aria-checked': true, 'data-checked': true });
    expect(option('vi').attrs).toMatchObject({ 'aria-checked': false });
    expect(option('vi').attrs['data-checked']).toBeUndefined();
    expect(option('en').attrs['aria-selected']).toBeUndefined();
    // The click made ar current, so Space unchecks it.
    press(' ');
    expect(listbox.state.checked).toEqual(['en']);
  });
});

describe('createListbox: APG conformance', () => {
  it('passes every row of its table', () => {
    expect(runConformance(listboxApg, createListbox as never).filter((r) => r.failures.length)).toEqual([]);
  });
});

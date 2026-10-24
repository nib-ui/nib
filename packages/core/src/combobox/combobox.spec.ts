import { describe, expect, it, vi } from 'vitest';
import { createTestHost } from '../testing/test-host.ts';
import { runConformance } from '../testing/conformance.ts';
import { comboboxApg } from './combobox.apg.ts';
import { createCombobox, type ComboboxOptions } from './index.ts';

const ITEMS = [
  { key: 'hn', label: 'Hà Nội' },
  { key: 'hcm', label: 'Hồ Chí Minh' },
  { key: 'dn', label: 'Đà Nẵng' },
];

function setup(options: Partial<ComboboxOptions> = {}) {
  const t = createTestHost();
  const cb = createCombobox({ id: 'cb', locale: 'vi', items: ITEMS, ...options }, t.host);
  const type = (value: string, init = {}) => t.fire(cb.part('input'), 'input', { value, ...init });
  return { t, cb, type };
}

describe('createCombobox', () => {
  it('renders an APG combobox field controlling a listbox popup', () => {
    const { cb } = setup();
    expect(cb.part('input').attrs).toMatchObject({
      role: 'combobox',
      'aria-expanded': false,
      'aria-controls': 'cb-listbox',
      'aria-autocomplete': 'list',
      autocomplete: 'off',
    });
    expect(cb.part('listbox').attrs).toMatchObject({ role: 'listbox', popover: 'manual' });
    expect(cb.part('option', 'hn').attrs).toMatchObject({ role: 'option', 'aria-selected': false });
  });

  it('filters while typing, ignoring case and diacritics, opening the list on the first match', () => {
    const onQueryChange = vi.fn();
    const { cb, type } = setup({ onQueryChange });
    expect(type('ho chi')).toEqual([
      { type: 'popover', ref: 'cb-listbox', open: true },
      { type: 'scroll-into-view', ref: 'cb-option-hcm', block: 'nearest' },
    ]);
    expect(cb.state).toMatchObject({ open: true, visible: ['hcm'], current: 'hcm' });
    expect(cb.part('option', 'hn').attrs['hidden']).toBe(true);
    expect(onQueryChange).toHaveBeenLastCalledWith('ho chi');
    // Nothing matches: the list closes.
    expect(type('xyz')).toEqual([{ type: 'popover', ref: 'cb-listbox', open: false }]);
  });

  it('neither filters nor moves while an IME composes (Telex), then filters on compositionend', () => {
    const { t, cb, type } = setup();
    t.fire(cb.part('input'), 'compositionstart');
    type('tieesng', { isComposing: true });
    expect(cb.state).toMatchObject({ composing: true, open: false, visible: ['hn', 'hcm', 'dn'] });
    expect(t.fire(cb.part('input'), 'keydown', { key: 'ArrowDown', isComposing: true })).toEqual([]);
    t.fire(cb.part('input'), 'compositionend', { value: 'Hà' });
    expect(cb.state).toMatchObject({ composing: false, visible: ['hn'], current: 'hn' });
  });

  it('chooses with a click, writes the label into the field, and keeps focus there', () => {
    const onValueChange = vi.fn();
    const { t, cb, type } = setup({ onValueChange });
    type('d');
    expect(t.fire(cb.part('option', 'dn'), 'click')).toEqual([{ type: 'popover', ref: 'cb-listbox', open: false }]);
    expect(onValueChange).toHaveBeenCalledWith('dn');
    expect(cb.part('input').attrs['value']).toBe('Đà Nẵng');
    t.fire(cb.part('listbox'), 'mousedown');
    expect(t.prevented).toBe(true);
  });

  it('opens on every option with the chosen one current when the field shows the chosen value', () => {
    const { t, cb, type } = setup();
    type('da');
    t.fire(cb.part('option', 'dn'), 'click');
    t.fire(cb.part('input'), 'keydown', { key: 'ArrowDown' });
    expect(cb.state).toMatchObject({ open: true, visible: ['hn', 'hcm', 'dn'], current: 'dn' });
  });

  it('does not open an empty list, and Alt+Down opens without moving while Alt+Up closes', () => {
    const { t, cb, type } = setup();
    type('xyz');
    expect(t.fire(cb.part('input'), 'keydown', { key: 'ArrowDown' })).toEqual([]);
    expect(cb.state.open).toBe(false);
    type('h');
    t.fire(cb.part('input'), 'keydown', { key: 'ArrowUp', altKey: true });
    expect(cb.state.open).toBe(false);
    t.fire(cb.part('input'), 'keydown', { key: 'ArrowDown', altKey: true });
    expect(cb.state).toMatchObject({ open: true, current: null });
  });

  it('holds keys while the controller is still composing, even when the key event says it is not', () => {
    const { t, cb } = setup();
    t.fire(cb.part('input'), 'compositionstart');
    expect(t.fire(cb.part('input'), 'keydown', { key: 'ArrowDown', isComposing: false })).toEqual([]);
    expect(cb.state.open).toBe(false);
  });

  it('reports the query once when Safari sends an input after compositionend', () => {
    const onQueryChange = vi.fn();
    const { t, cb, type } = setup({ onQueryChange });
    t.fire(cb.part('input'), 'compositionstart');
    type('tiế', { isComposing: true });
    t.fire(cb.part('input'), 'compositionend', { value: 'tiếng' });
    type('tiếng');
    expect(onQueryChange.mock.calls).toEqual([['tiếng']]);
  });

  it('puts back the chosen label on blur, and an emptied field clears the value', () => {
    const onValueChange = vi.fn();
    const { t, cb, type } = setup({ defaultValue: 'hn', onValueChange });
    type('xyz');
    t.fire(cb.part('input'), 'blur');
    expect(cb.state).toMatchObject({ query: 'Hà Nội', value: 'hn' });
    type('');
    t.fire(cb.part('input'), 'blur');
    expect(cb.state).toMatchObject({ query: '', value: null });
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it('writes the label of a value set from outside into the field', () => {
    const { cb } = setup({ value: 'hn' });
    cb.update({ id: 'cb', locale: 'vi', items: ITEMS, value: 'dn' });
    expect(cb.state).toMatchObject({ value: 'dn', query: 'Đà Nẵng' });
  });

  it('clears the field and the value with Escape when the list is already closed, once', () => {
    const onQueryChange = vi.fn();
    const onValueChange = vi.fn();
    const { t, cb } = setup({ defaultValue: 'hn', onQueryChange, onValueChange });
    t.fire(cb.part('input'), 'keydown', { key: 'Escape' });
    expect(cb.state).toMatchObject({ query: '', value: null });
    expect(onValueChange).toHaveBeenCalledWith(null);
    t.fire(cb.part('input'), 'keydown', { key: 'Escape' });
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('places the open list below the field and stops following it when it closes', () => {
    const { t, cb, type } = setup();
    t.geometry.setRect('cb-input', { x: 10, y: 10, width: 200, height: 32 });
    t.geometry.setRect('cb-listbox', { x: 0, y: 0, width: 200, height: 100 });
    type('h');
    t.fire(cb.part('listbox'), 'toggle', { newState: 'open' });
    expect(cb.state.placement).toMatchObject({ side: 'bottom', y: 46 });
    t.fire(cb.part('listbox'), 'toggle', { newState: 'closed' });
    expect(cb.state.placement).toBeNull();
  });

  it('passes every row of its APG table', () => {
    expect(runConformance(comboboxApg, createCombobox as never).filter((r) => r.failures.length)).toEqual([]);
  });
});

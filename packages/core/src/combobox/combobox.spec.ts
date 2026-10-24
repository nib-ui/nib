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
    t.fire(cb.part('option', 'dn'), 'pointerdown');
    expect(t.prevented).toBe(true);
  });

  it('clears the field with Escape when the list is already closed', () => {
    const { t, cb, type } = setup();
    type('xyz');
    t.fire(cb.part('input'), 'keydown', { key: 'Escape' });
    expect(cb.state.query).toBe('');
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

import { describe, expect, it, vi } from 'vitest';
import { createTestHost } from '../testing/test-host.ts';
import { runConformance } from '../testing/conformance.ts';
import { createMenu, type MenuOptions } from './index.ts';
import { menuApg } from './menu.apg.ts';

const ITEMS = [
  { key: 'copy', label: 'Copy' },
  { key: 'wrap', label: 'Wrap lines', kind: 'checkbox' as const, checked: true },
  { key: 'mono', label: 'Mono', kind: 'radio' as const, checked: false },
];

function setup(options: Partial<MenuOptions> = {}) {
  const t = createTestHost();
  t.geometry.setRect('mn-button', { x: 10, y: 10, width: 80, height: 28 });
  t.geometry.setRect('mn-menu', { x: 0, y: 0, width: 160, height: 90 });
  const menu = createMenu({ id: 'mn', items: ITEMS, ...options }, t.host);
  const toggle = (newState: 'open' | 'closed') => t.fire(menu.part('menu'), 'toggle', { newState });
  return { t, menu, toggle };
}

describe('createMenu', () => {
  it('renders a menu button and a menu of items with their roles and checked states', () => {
    const { menu } = setup();
    expect(menu.part('button').attrs).toMatchObject({
      popovertarget: 'mn-menu',
      'aria-haspopup': 'menu',
      'aria-expanded': false,
    });
    expect(menu.part('menu').attrs).toMatchObject({ role: 'menu', popover: 'auto', tabindex: -1 });
    expect(menu.part('item', 'copy').attrs).toMatchObject({ role: 'menuitem' });
    expect(menu.part('item', 'copy').attrs['aria-checked']).toBeUndefined();
    expect(menu.part('item', 'wrap').attrs).toMatchObject({ role: 'menuitemcheckbox', 'aria-checked': true });
    expect(menu.part('item', 'mono').attrs).toMatchObject({ role: 'menuitemradio', 'aria-checked': false });
  });

  it('opens on the first item with focus on the menu, placed below the button', () => {
    const { menu, toggle } = setup();
    expect(toggle('open')).toEqual([{ type: 'focus', ref: 'mn-menu' }]);
    expect(menu.state).toMatchObject({ open: true, current: 'copy', placement: { side: 'bottom' } });
    expect(menu.part('button').attrs['aria-expanded']).toBe(true);
  });

  it('opens from ArrowUp on the button on the last item', () => {
    const { t, menu, toggle } = setup();
    expect(t.fire(menu.part('button'), 'keydown', { key: 'ArrowUp' })).toEqual([
      { type: 'popover', ref: 'mn-menu', open: true },
    ]);
    toggle('open');
    expect(menu.state.current).toBe('mono');
  });

  it('chooses on click, reports the key and closes', () => {
    const onSelect = vi.fn();
    const { t, menu, toggle } = setup({ onSelect });
    toggle('open');
    expect(t.fire(menu.part('item', 'wrap'), 'click')).toEqual([
      { type: 'popover', ref: 'mn-menu', open: false },
      { type: 'focus', ref: 'mn-button' },
    ]);
    expect(onSelect).toHaveBeenCalledWith('wrap');
    toggle('closed');
    expect(menu.state).toEqual({ open: false, current: null, placement: null });
  });

  it('closes on Tab without choosing', () => {
    const onSelect = vi.fn();
    const { t, menu, toggle } = setup({ onSelect });
    toggle('open');
    expect(t.fire(menu.part('menu'), 'keydown', { key: 'Tab' })).toEqual([
      { type: 'popover', ref: 'mn-menu', open: false },
    ]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('follows the pointer, but not onto a disabled item', () => {
    const { t, menu, toggle } = setup({ items: [...ITEMS, { key: 'off', label: 'Off', disabled: true }] });
    toggle('open');
    t.fire(menu.part('item', 'mono'), 'pointermove');
    expect(menu.state.current).toBe('mono');
    t.fire(menu.part('item', 'off'), 'pointermove');
    expect(menu.state.current).toBe('mono');
  });

  it('passes every row of its APG table', () => {
    expect(runConformance(menuApg, createMenu as never).filter((r) => r.failures.length)).toEqual([]);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { runConformance } from '../testing/conformance.ts';
import { createTestHost } from '../testing/test-host.ts';
import { commandPaletteApg } from './command-palette.apg.ts';
import {
  ariaShortcut,
  createCommandPalette,
  matchShortcut,
  printShortcut,
  type CommandPaletteOptions,
} from './index.ts';

const COMMANDS = [
  { key: 'new', label: 'Tạo tệp mới', hotkey: 'mod+n' },
  { key: 'open', label: 'Mở tệp', disabled: true },
  { key: 'save', label: 'Lưu', hotkey: 'mod+s' },
];

function setup(options: Partial<CommandPaletteOptions> = {}) {
  const t = createTestHost();
  const cp = createCommandPalette({ id: 'cp', locale: 'vi', commands: COMMANDS, apple: true, ...options }, t.host);
  const type = (value: string, init = {}) => t.fire(cp.part('input'), 'input', { value, ...init });
  return { t, cp, type };
}

describe('createCommandPalette', () => {
  it('opens as a modal dialog with focus in the field, and names both', () => {
    const { cp } = setup({ label: 'Lệnh' });
    expect(cp.send({ type: 'open' })).toEqual([
      { type: 'modal', ref: 'cp-dialog', open: true },
      { type: 'focus', ref: 'cp-input' },
    ]);
    expect(cp.part('dialog').attrs).toMatchObject({ id: 'cp-dialog', 'aria-label': 'Lệnh' });
    expect(cp.part('input').attrs).toMatchObject({
      role: 'combobox',
      'aria-label': 'Lệnh',
      'aria-controls': 'cp-listbox',
    });
    expect(cp.part('trigger').attrs).toMatchObject({
      commandfor: 'cp-dialog',
      command: 'show-modal',
      'aria-keyshortcuts': 'Meta+K',
    });
  });

  it('filters ignoring diacritics, the first match current, and announces when nothing matches', () => {
    const { cp, type } = setup({ emptyText: 'Không có lệnh' });
    type('luu');
    expect(cp.state).toMatchObject({ visible: ['save'], current: 'save' });
    expect(cp.part('option', 'new').attrs['hidden']).toBe(true);
    expect(type('zzz')).toEqual([{ type: 'announce', text: 'Không có lệnh', politeness: 'polite' }]);
    expect(cp.part('input').attrs).toMatchObject({ 'aria-expanded': false, 'aria-activedescendant': undefined });
  });

  it('runs the current command with Enter: closes, then calls onRun', () => {
    const onRun = vi.fn();
    const { t, cp, type } = setup({ onRun });
    cp.send({ type: 'open' });
    t.fire(cp.part('dialog'), 'toggle', { newState: 'open' });
    type('tao');
    expect(t.fire(cp.part('input'), 'keydown', { key: 'Enter' })).toEqual([
      { type: 'modal', ref: 'cp-dialog', open: false },
    ]);
    // Not yet: the binding closes the dialog first.
    expect(onRun).not.toHaveBeenCalled();
    t.clock.advance(0);
    expect(onRun).toHaveBeenCalledWith('new');
  });

  it('opens on the shortcut, and the shortcut again closes it', () => {
    const { t, cp } = setup();
    expect(cp.send({ type: 'shortcut' })[0]).toEqual({ type: 'modal', ref: 'cp-dialog', open: true });
    t.fire(cp.part('dialog'), 'toggle', { newState: 'open' });
    expect(cp.send({ type: 'shortcut' })).toEqual([{ type: 'modal', ref: 'cp-dialog', open: false }]);
  });

  it('opens again on a shortcut pressed before the dialog reported closing', () => {
    const { t, cp, type } = setup();
    cp.send({ type: 'open' });
    t.fire(cp.part('dialog'), 'toggle', { newState: 'open' });
    type('luu');
    t.fire(cp.part('input'), 'keydown', { key: 'Enter' });
    expect(cp.send({ type: 'shortcut' })[0]).toEqual({ type: 'modal', ref: 'cp-dialog', open: true });
  });

  it('runs a clicked command but not a disabled one', () => {
    const onRun = vi.fn();
    const { t, cp } = setup({ onRun });
    expect(t.fire(cp.part('option', 'open'), 'click')).toEqual([]);
    t.fire(cp.part('option', 'save'), 'click');
    t.clock.advance(0);
    expect(onRun).toHaveBeenCalledWith('save');
  });

  it('starts afresh after closing, however it closed', () => {
    const onOpenChange = vi.fn();
    const { t, cp, type } = setup({ onOpenChange });
    cp.send({ type: 'open' });
    t.fire(cp.part('dialog'), 'toggle', { newState: 'open' });
    type('luu');
    t.fire(cp.part('dialog'), 'toggle', { newState: 'closed' });
    expect(cp.state).toMatchObject({ open: false, query: '', visible: ['new', 'open', 'save'], current: 'new' });
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('holds filtering and keys while an IME composes', () => {
    const { t, cp, type } = setup();
    t.fire(cp.part('input'), 'compositionstart');
    type('luw', { isComposing: true });
    expect(t.fire(cp.part('input'), 'keydown', { key: 'Enter' })).toEqual([]);
    expect(cp.state.visible).toHaveLength(3);
    t.fire(cp.part('input'), 'compositionend', { value: 'lưu' });
    expect(cp.state.visible).toEqual(['save']);
  });

  it('passes every row of its APG table', () => {
    expect(runConformance(commandPaletteApg, createCommandPalette as never).filter((r) => r.failures.length)).toEqual(
      [],
    );
  });
});

describe('shortcuts', () => {
  it('matches mod as ⌘ on Apple platforms and Ctrl elsewhere, every modifier exactly', () => {
    expect(matchShortcut({ key: 'k', metaKey: true }, 'mod+k', true)).toBe(true);
    expect(matchShortcut({ key: 'P', metaKey: true, shiftKey: true }, 'shift+mod+p', true)).toBe(true);
    expect(matchShortcut({ key: 'k', ctrlKey: true, altKey: true }, 'mod+k', false)).toBe(false);
    expect(matchShortcut({ key: 'K', ctrlKey: true }, 'mod+k', false)).toBe(true);
    expect(matchShortcut({ key: 'k', ctrlKey: true }, 'mod+k', true)).toBe(false);
    expect(matchShortcut({ key: 'k', metaKey: true, shiftKey: true }, 'mod+k', true)).toBe(false);
  });

  it('matches the physical key on a layout whose letters are not Latin, but not on AZERTY', () => {
    expect(matchShortcut({ key: 'ك', code: 'KeyK', ctrlKey: true }, 'mod+k', false)).toBe(true);
    expect(matchShortcut({ key: 'л', code: 'KeyK', metaKey: true }, 'mod+k', true)).toBe(true);
    // AZERTY: the key in the Q position types "a"; it is A, not Q.
    expect(matchShortcut({ key: 'a', code: 'KeyQ', ctrlKey: true }, 'mod+q', false)).toBe(false);
  });

  it('prints and names a shortcut for the platform', () => {
    expect(printShortcut('shift+mod+p', true)).toBe('⇧⌘P');
    expect(printShortcut('mod+k', false)).toBe('Ctrl+K');
    expect(ariaShortcut('mod+k', false)).toBe('Control+K');
  });
});

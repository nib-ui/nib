import { describe, expect, it, vi } from 'vitest';
import { listenShortcut } from './listen-shortcut.ts';

const press = (target: EventTarget, init: KeyboardEventInit) => {
  const e = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e;
};

describe('listenShortcut', () => {
  it('calls back on the shortcut, not on a held key, and stops when asked', () => {
    const fn = vi.fn();
    const stop = listenShortcut('ctrl+k', fn);
    expect(press(document.body, { key: 'k', ctrlKey: true }).defaultPrevented).toBe(true);
    press(document.body, { key: 'k', ctrlKey: true, repeat: true });
    expect(fn).toHaveBeenCalledTimes(1);
    stop();
    press(document.body, { key: 'k', ctrlKey: true });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('keeps a shortcut without Ctrl, ⌘ or Alt out of text fields', () => {
    const fn = vi.fn();
    const stop = listenShortcut('/', fn);
    const input = document.body.appendChild(document.createElement('input'));
    expect(press(input, { key: '/' }).defaultPrevented).toBe(false);
    press(document.body, { key: '/' });
    expect(fn).toHaveBeenCalledTimes(1);
    stop();
    input.remove();
  });
});

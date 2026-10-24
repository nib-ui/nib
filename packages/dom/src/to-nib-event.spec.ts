import type { NibEvent } from '@nib-ui/core';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { toNibEvent } from './index.ts';

afterEach(() => {
  document.body.innerHTML = '';
});

/** Focuses a fresh input and collects every `type` event it receives, already normalised. */
function listen(type: string, handle?: (e: NibEvent) => void) {
  document.body.innerHTML = '<input id="i">';
  const input = document.getElementById('i') as HTMLInputElement;
  const seen: NibEvent[] = [];
  input.addEventListener(type, (e) => {
    const nib = toNibEvent(e);
    seen.push(nib);
    handle?.(nib);
  });
  input.focus();
  return { input, seen };
}

describe('toNibEvent', () => {
  it('carries the key and modifiers of a real key press', async () => {
    const { seen } = listen('keydown');
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(seen.at(-1)).toMatchObject({
      type: 'keydown',
      key: 'ArrowDown',
      shiftKey: true,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      isComposing: false,
    });
  });

  it('passes preventDefault through to the DOM event', async () => {
    const { input } = listen('keydown', (e) => e.preventDefault());
    await userEvent.keyboard('a');
    expect(input.value).toBe('');
  });

  it('treats keyCode 229 as composing, which Safari reports for IME keys with isComposing false', () => {
    const { input, seen } = listen('keydown');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Process', keyCode: 229 }));
    expect(seen.at(-1)?.isComposing).toBe(true);
  });

  it('carries the typed text of an input event', async () => {
    const { seen } = listen('input');
    await userEvent.keyboard('đ');
    expect(seen.at(-1)).toMatchObject({ type: 'input', data: 'đ', isComposing: false });
  });

  it('marks composition updates as composing and the end as done, with their text', () => {
    const { input, seen } = listen('compositionupdate');
    input.addEventListener('compositionend', (e) => seen.push(toNibEvent(e)));
    input.dispatchEvent(new CompositionEvent('compositionupdate', { data: 'tieng' }));
    input.dispatchEvent(new CompositionEvent('compositionend', { data: 'tiếng' }));
    expect(seen).toMatchObject([
      { type: 'compositionupdate', data: 'tieng', isComposing: true },
      { type: 'compositionend', data: 'tiếng', isComposing: false },
    ]);
  });

  it('reads events from another window, such as an iframe', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const view = frame.contentWindow as Window & typeof globalThis;
    const nib = toNibEvent(new view.KeyboardEvent('keydown', { key: 'Home', ctrlKey: true }));
    expect(nib).toMatchObject({ type: 'keydown', key: 'Home', ctrlKey: true });
  });
});

import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { destroy, init } from './index.ts';
import './dialog.ts';

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
});

describe('dialog (vanilla)', () => {
  it('opens modally from its button, closes on Escape, and gives focus back', async () => {
    document.body.innerHTML = `<div data-nib="dialog">
      <button data-nib-trigger>Delete</button>
      <dialog data-nib-dialog><h2 data-nib-title>Delete?</h2><p data-nib-description>It cannot be undone.</p>
        <button data-nib-close>Cancel</button><button data-nib-close>Close</button></dialog>
    </div>`;
    init();
    const trigger = document.querySelector('[data-nib-trigger]') as HTMLButtonElement;
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    const seen: unknown[] = [];
    document.body.addEventListener('nib:change', (e) => seen.push((e as CustomEvent).detail));
    const closes = [...document.querySelectorAll('[data-nib-close]')];
    expect(new Set(closes.map((c) => c.id)).size).toBe(2);
    await userEvent.click(trigger);
    await expect.poll(() => dialog.matches(':modal')).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe(document.querySelector('h2')?.id);
    await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    await expect.poll(() => seen).toEqual([{ open: true }, { open: false }]);
  });
});

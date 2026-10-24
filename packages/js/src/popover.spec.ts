import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { destroy, init } from './index.ts';
import './popover.ts';

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
});

describe('popover (vanilla)', () => {
  it('opens beside its trigger and closes on Escape with focus back on the trigger', async () => {
    // Nib owns the content's style attribute (it writes the position there), so the rules live in a sheet.
    document.body.innerHTML = `<style>.pp { position: fixed; inset: auto; margin: 0; top: var(--nib-y); left: var(--nib-x) }</style>
    <div data-nib="popover" style="margin: 40px">
      <button data-nib-trigger>Filters</button>
      <div data-nib-content class="pp">
        <button>Apply</button>
      </div>
    </div>`;
    init();
    const trigger = document.querySelector('[data-nib-trigger]') as HTMLButtonElement;
    const content = document.querySelector('[data-nib-content]') as HTMLElement;
    await userEvent.click(trigger);
    await expect.poll(() => content.matches(':popover-open')).toBe(true);
    await expect.poll(() => content.dataset['side']).toBe('bottom');
    const t = trigger.getBoundingClientRect();
    expect(Math.round(content.getBoundingClientRect().top)).toBe(Math.round(t.bottom + 4));
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    content.querySelector('button')?.focus();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => content.matches(':popover-open')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });
});

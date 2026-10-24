import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { destroy, init } from './index.ts';
import './tooltip.ts';

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
});

describe('tooltip (vanilla)', () => {
  it('shows on hover after the delay, placed, and hides when the pointer leaves', async () => {
    document.body.innerHTML = `<style>.tt { position: fixed; top: var(--nib-y); left: var(--nib-x) } .tt:not([data-side]) { visibility: hidden }</style>
      <p style="margin: 80px"><span data-nib="tooltip" data-delay="50"><button data-nib-trigger>Copy</button><span class="tt" data-nib-tooltip>Copies it</span></span></p>`;
    init();
    const trigger = document.querySelector('button') as HTMLButtonElement;
    const tip = document.querySelector('[role="tooltip"]') as HTMLElement;
    await userEvent.hover(trigger);
    await expect.poll(() => tip.hidden).toBe(false);
    await expect.poll(() => tip.dataset['side']).toBe('top');
    await userEvent.unhover(trigger);
    await expect.poll(() => tip.hidden).toBe(true);
  });
});

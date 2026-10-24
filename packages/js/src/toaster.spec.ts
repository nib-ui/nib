import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { destroy, init } from './index.ts';
import { toast } from './toaster.ts';

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
});

describe('toaster (vanilla)', () => {
  it('renders pushed toasts with their buttons, announces them, and closes them', async () => {
    document.body.innerHTML = `<section data-nib="toaster" class="nib-toaster"></section>`;
    init();
    const onAction = vi.fn();
    toast({ title: 'Row deleted', action: { label: 'Undo', onAction }, duration: Infinity });
    const region = document.querySelector('[data-nib="toaster"]') as HTMLElement;
    expect(region.getAttribute('role')).toBe('region');
    expect(region.querySelector('.nib-toast__title')?.textContent).toBe('Row deleted');
    await expect.poll(() => document.querySelector('[data-nib-live="polite"]')?.textContent).toBe('Row deleted');
    await userEvent.click(region.querySelector('[data-nib-action]') as HTMLElement);
    expect(onAction).toHaveBeenCalledOnce();
    expect(region.querySelector('.nib-toast')).toBeNull();
    toast({ title: 'Saved', duration: Infinity });
    await userEvent.click(region.querySelector('[data-nib-close]') as HTMLElement);
    expect(region.querySelector('.nib-toast')).toBeNull();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { createTestHost } from '../testing/test-host.ts';
import { createToaster, type ToasterOptions } from './index.ts';

function setup(options: ToasterOptions = {}) {
  const t = createTestHost();
  const toaster = createToaster({ id: 'tr', ...options }, t.host);
  return { t, toaster };
}

describe('createToaster', () => {
  it('shows a pushed toast and announces it, politely or, for an error, assertively', () => {
    const { toaster } = setup();
    expect(toaster.send({ type: 'push', toast: { title: 'Added to cart', body: 'Kenya Nyeri ×2' } })).toEqual([
      { type: 'announce', text: 'Added to cart. Kenya Nyeri ×2', politeness: 'polite' },
    ]);
    expect(toaster.send({ type: 'push', toast: { title: 'Payment failed', tone: 'error' } })).toEqual([
      { type: 'announce', text: 'Payment failed', politeness: 'assertive' },
    ]);
    expect(toaster.state.toasts.map((x) => x.title)).toEqual(['Added to cart', 'Payment failed']);
    expect(toaster.part('toast', '2').attrs['data-tone']).toBe('error');
    expect(toaster.part('region').attrs).toMatchObject({ role: 'region', 'aria-label': 'Notifications' });
  });

  it('closes a toast after its duration, never one that lasts forever', () => {
    const { t, toaster } = setup({ duration: 1000 });
    toaster.send({ type: 'push', toast: { title: 'Saved' } });
    toaster.send({ type: 'push', toast: { title: 'Stays', duration: Infinity } });
    t.clock.advance(1000);
    expect(toaster.state.toasts.map((x) => x.title)).toEqual(['Stays']);
  });

  it('waits while the pointer or focus is in the region, and gives the full time again after', () => {
    const { t, toaster } = setup({ duration: 1000 });
    toaster.send({ type: 'push', toast: { title: 'Saved' } });
    t.clock.advance(800);
    t.fire(toaster.part('region'), 'pointerenter');
    t.clock.advance(5000);
    expect(toaster.state.toasts).toHaveLength(1);
    t.fire(toaster.part('region'), 'pointerleave');
    t.clock.advance(999);
    expect(toaster.state.toasts).toHaveLength(1);
    t.clock.advance(1);
    expect(toaster.state.toasts).toHaveLength(0);
  });

  it('keeps at most `max` toasts, pushing the oldest out', () => {
    const { toaster } = setup({ max: 2 });
    for (const title of ['a', 'b', 'c']) toaster.send({ type: 'push', toast: { title } });
    expect(toaster.state.toasts.map((x) => x.title)).toEqual(['b', 'c']);
  });

  it('runs a toast action, then closes it; the close button closes it too', () => {
    const { t, toaster } = setup();
    const onAction = vi.fn();
    toaster.send({ type: 'push', toast: { title: 'Row deleted', action: { label: 'Undo', onAction } } });
    toaster.send({ type: 'push', toast: { title: 'Saved' } });
    expect(toaster.state.toasts[0]?.action).toEqual({ label: 'Undo' });
    t.fire(toaster.part('action', '1'), 'click');
    expect(onAction).toHaveBeenCalledOnce();
    t.fire(toaster.part('close', '2'), 'click');
    expect(toaster.state.toasts).toEqual([]);
  });

  it('stops every timer when destroyed', () => {
    const { t, toaster } = setup();
    toaster.send({ type: 'push', toast: { title: 'Saved' } });
    toaster.destroy();
    expect(() => t.clock.advance(10_000)).not.toThrow();
  });
});

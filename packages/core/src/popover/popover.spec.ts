import { describe, expect, it, vi } from 'vitest';
import { createTestHost } from '../testing/test-host.ts';
import { createPopover } from './index.ts';

function setup() {
  const t = createTestHost();
  t.geometry.setViewport({ width: 400, height: 300 });
  t.geometry.setRect('pp-trigger', { x: 100, y: 100, width: 80, height: 20 });
  t.geometry.setRect('pp-content', { x: 0, y: 0, width: 120, height: 60 });
  const onOpenChange = vi.fn();
  const popover = createPopover({ id: 'pp', onOpenChange }, t.host);
  const toggle = (newState: 'open' | 'closed') => t.fire(popover.part('content'), 'toggle', { newState });
  return { t, popover, toggle, onOpenChange };
}

describe('createPopover', () => {
  it('ties the trigger to a native popover', () => {
    const { popover } = setup();
    expect(popover.part('trigger').attrs).toMatchObject({
      id: 'pp-trigger',
      popovertarget: 'pp-content',
      'aria-expanded': false,
      'aria-controls': 'pp-content',
    });
    expect(popover.part('content').attrs).toMatchObject({ id: 'pp-content', popover: 'auto' });
    expect(popover.part('content').attrs['style']).toBeUndefined();
  });

  it('places the opened popover below its trigger and reports the change', () => {
    const { popover, toggle, onOpenChange } = setup();
    toggle('open');
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(popover.part('trigger').attrs['aria-expanded']).toBe(true);
    expect(popover.part('content').attrs).toMatchObject({
      'data-side': 'bottom',
      style: '--nib-x: 100px; --nib-y: 124px; --nib-max-width: 384px; --nib-max-height: 168px',
    });
  });

  it('follows its trigger while open, and stops when closed', () => {
    const { t, popover, toggle } = setup();
    toggle('open');
    t.geometry.setRect('pp-trigger', { x: 100, y: 250, width: 80, height: 20 });
    t.geometry.changed();
    expect(popover.state.placement).toMatchObject({ side: 'top', y: 186 });
    toggle('closed');
    expect(popover.state).toEqual({ open: false, placement: null });
    t.geometry.setRect('pp-trigger', { x: 0, y: 0, width: 80, height: 20 });
    t.geometry.changed();
    expect(popover.state.placement).toBeNull();
  });

  it('flips once there is room, judging by the size it had before it was capped', () => {
    const { t, popover, toggle } = setup();
    t.geometry.setRect('pp-content', { x: 0, y: 0, width: 120, height: 200 });
    toggle('open');
    expect(popover.state.placement).toMatchObject({ side: 'bottom', maxHeight: 168 });
    // The page now shows the capped box; the anchor moves down where the top has room.
    t.geometry.setRect('pp-content', { x: 0, y: 0, width: 120, height: 168 });
    t.geometry.setRect('pp-trigger', { x: 100, y: 240, width: 80, height: 20 });
    t.geometry.changed();
    expect(popover.state.placement?.side).toBe('top');
  });

  it('does not render again while scrolling changes nothing', () => {
    const { t, popover, toggle } = setup();
    toggle('open');
    const listener = vi.fn();
    popover.subscribe(listener);
    t.geometry.changed();
    expect(listener).not.toHaveBeenCalled();
  });

  it('reads the writing direction from the trigger', () => {
    const { t, popover, toggle } = setup();
    t.geometry.setDirection('rtl');
    toggle('open');
    expect(popover.state.placement?.x).toBe(60);
  });

  it('marks itself placed when opened, even when it cannot be measured, so it never stays hidden', () => {
    const t = createTestHost();
    const popover = createPopover({ id: 'lost' }, t.host);
    t.fire(popover.part('content'), 'toggle', { newState: 'open' });
    expect(popover.part('content').attrs).toMatchObject({ 'data-nib-popover': true, 'data-placed': true });
    expect(popover.state.placement).toBeNull();
  });

  it('stops following layout when destroyed', () => {
    const t = createTestHost();
    const watch = vi.spyOn(t.geometry, 'watch');
    const popover = createPopover({ id: 'pp' }, t.host);
    t.fire(popover.part('content'), 'toggle', { newState: 'open' });
    const stop = watch.mock.results[0]?.value as () => boolean;
    popover.destroy();
    // The watcher is gone: stopping it again finds nothing to remove.
    expect(stop()).toBe(false);
  });
});

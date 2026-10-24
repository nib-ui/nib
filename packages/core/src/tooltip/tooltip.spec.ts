import { describe, expect, it } from 'vitest';
import { createTestHost } from '../testing/test-host.ts';
import { runConformance } from '../testing/conformance.ts';
import { createTooltip } from './index.ts';
import { tooltipApg } from './tooltip.apg.ts';

function setup() {
  const t = createTestHost();
  t.geometry.setViewport({ width: 400, height: 300 });
  t.geometry.setRect('tt-trigger', { x: 100, y: 100, width: 80, height: 20 });
  t.geometry.setRect('tt-tooltip', { x: 0, y: 0, width: 60, height: 24 });
  const tooltip = createTooltip({ id: 'tt' }, t.host);
  const fire = (part: 'trigger' | 'tooltip', type: string, init = {}) => t.fire(tooltip.part(part), type, init);
  return { t, tooltip, fire };
}

describe('createTooltip', () => {
  it('describes its trigger and starts hidden', () => {
    const { tooltip } = setup();
    expect(tooltip.part('trigger').attrs).toMatchObject({ 'aria-describedby': 'tt-tooltip' });
    expect(tooltip.part('tooltip').attrs).toMatchObject({ id: 'tt-tooltip', role: 'tooltip', hidden: true });
  });

  it('shows after the hover delay and is placed centred above the trigger on the next layout', () => {
    const { t, tooltip, fire } = setup();
    fire('trigger', 'pointerenter');
    t.clock.advance(499);
    expect(tooltip.state.open).toBe(false);
    t.clock.advance(1);
    expect(tooltip.state.open).toBe(true);
    t.geometry.changed();
    expect(tooltip.state.placement).toMatchObject({ side: 'top', x: 110, y: 70 });
  });

  it('stays while the pointer moves onto it, and hides after leaving both', () => {
    const { t, tooltip, fire } = setup();
    fire('trigger', 'pointerenter');
    t.clock.advance(500);
    fire('trigger', 'pointerleave');
    fire('tooltip', 'pointerenter');
    t.clock.advance(200);
    expect(tooltip.state.open).toBe(true);
    fire('tooltip', 'pointerleave');
    t.clock.advance(100);
    expect(tooltip.state.open).toBe(false);
  });

  it('never shows when the pointer leaves before the delay', () => {
    const { t, tooltip, fire } = setup();
    fire('trigger', 'pointerenter');
    t.clock.advance(300);
    fire('trigger', 'pointerleave');
    t.clock.advance(1000);
    expect(tooltip.state.open).toBe(false);
  });

  it('hides on blur, and Escape leaves the key to others when it is already hidden', () => {
    const { t, tooltip, fire } = setup();
    fire('trigger', 'focus');
    fire('trigger', 'blur');
    expect(tooltip.state.open).toBe(false);
    fire('trigger', 'keydown', { key: 'Escape' });
    expect(t.prevented).toBe(false);
    fire('trigger', 'focus');
    fire('trigger', 'keydown', { key: 'Escape' });
    expect(t.prevented).toBe(true);
    expect(tooltip.state.open).toBe(false);
  });

  it('keeps showing while focus holds it, whatever the pointer does, and the other way round', () => {
    const { t, tooltip, fire } = setup();
    fire('trigger', 'focus', { focusVisible: true });
    fire('trigger', 'pointerenter');
    fire('trigger', 'pointerleave');
    t.clock.advance(200);
    expect(tooltip.state.open).toBe(true);
    fire('trigger', 'pointerenter');
    t.clock.advance(500);
    fire('trigger', 'blur');
    expect(tooltip.state.open).toBe(true);
  });

  it('ignores touch, focus from a click, and hides when the trigger is pressed', () => {
    const { t, tooltip, fire } = setup();
    fire('trigger', 'pointerenter', { pointerType: 'touch' });
    t.clock.advance(1000);
    expect(tooltip.state.open).toBe(false);
    fire('trigger', 'focus', { focusVisible: false });
    expect(tooltip.state.open).toBe(false);
    fire('trigger', 'focus', { focusVisible: true });
    fire('trigger', 'pointerdown');
    expect(tooltip.state.open).toBe(false);
  });

  it('places itself a frame after showing even when no layout pass comes', () => {
    const { t, tooltip, fire } = setup();
    fire('trigger', 'focus');
    t.clock.advance(16);
    expect(tooltip.state.placement?.side).toBe('top');
  });

  it('stops its timers and layout watch when destroyed', () => {
    const { t, tooltip, fire } = setup();
    fire('trigger', 'focus');
    fire('trigger', 'pointerleave');
    tooltip.destroy();
    expect(() => {
      t.clock.advance(1000);
      t.geometry.changed();
    }).not.toThrow();
  });

  it('passes every row of its APG table', () => {
    expect(runConformance(tooltipApg, createTooltip as never).filter((r) => r.failures.length)).toEqual([]);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { createTestHost } from '../testing/test-host.ts';
import { runConformance } from '../testing/conformance.ts';
import { createTabs, type TabsOptions } from './index.ts';
import { tabsApg } from './tabs.apg.ts';

const ITEMS = [{ key: 'html' }, { key: 'react' }, { key: 'vue', disabled: true }];

function setup(options: Partial<TabsOptions> = {}) {
  const t = createTestHost();
  const tabs = createTabs({ id: 'tb', items: ITEMS, ...options }, t.host);
  return { t, tabs };
}

describe('createTabs', () => {
  it('renders a tablist whose tabs control their panels, the first selected and in the Tab order', () => {
    const { tabs } = setup();
    expect(tabs.part('list').attrs).toMatchObject({ role: 'tablist' });
    expect(tabs.part('list').attrs['aria-orientation']).toBeUndefined();
    expect(tabs.part('tab', 'html').attrs).toMatchObject({
      id: 'tb-tab-html',
      role: 'tab',
      'aria-selected': true,
      'aria-controls': 'tb-panel-html',
      tabindex: 0,
    });
    expect(tabs.part('tab', 'react').attrs['tabindex']).toBe(-1);
    expect(tabs.part('panel', 'html').attrs).toMatchObject({
      role: 'tabpanel',
      'aria-labelledby': 'tb-tab-html',
      tabindex: 0,
    });
    expect(tabs.part('panel', 'react').attrs['hidden']).toBe(true);
    expect(tabs.part('tab', 'vue').attrs['aria-disabled']).toBe(true);
  });

  it('selects on click; a disabled tab ignores it', () => {
    const { t, tabs } = setup();
    t.fire(tabs.part('tab', 'react'), 'click');
    expect(tabs.state.value).toBe('react');
    t.fire(tabs.part('tab', 'vue'), 'click');
    expect(tabs.state.value).toBe('react');
  });

  it('reports a controlled change and waits for the value', () => {
    const onValueChange = vi.fn();
    const { t, tabs } = setup({ value: 'html', onValueChange });
    t.fire(tabs.part('tab', 'html'), 'keydown', { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenCalledWith('react');
    expect(tabs.state.value).toBe('html');
    tabs.update({ value: 'react' });
    expect(tabs.part('panel', 'react').attrs['hidden']).toBeUndefined();
  });

  it('shows the first enabled tab when the value names a disabled or missing one', () => {
    expect(setup({ defaultValue: 'vue' }).tabs.state.value).toBe('html');
    const { tabs } = setup({ defaultValue: 'react' });
    tabs.update({ items: [{ key: 'html' }] });
    expect(tabs.state.value).toBe('html');
  });

  it('leaves modified arrows to the browser', () => {
    const { t, tabs } = setup();
    expect(t.fire(tabs.part('tab', 'html'), 'keydown', { key: 'ArrowRight', altKey: true })).toEqual([]);
    expect(t.prevented).toBe(false);
  });

  it('passes every row of its APG table', () => {
    expect(runConformance(tabsApg, createTabs as never).filter((r) => r.failures.length)).toEqual([]);
  });
});

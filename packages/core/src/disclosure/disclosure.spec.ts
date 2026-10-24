import { describe, expect, it, vi } from 'vitest';
import { createTestHost } from '../testing/test-host.ts';
import { runConformance } from '../testing/conformance.ts';
import { createAccordion, createDisclosure, type AccordionOptions } from './index.ts';
import { disclosureApg } from './disclosure.apg.ts';

describe('createDisclosure', () => {
  it('ties the button to its panel and shows the panel on click', () => {
    const t = createTestHost();
    const d = createDisclosure({ id: 'd' }, t.host);
    expect(d.part('trigger').attrs).toMatchObject({
      id: 'd-trigger',
      'aria-expanded': false,
      'aria-controls': 'd-panel',
    });
    expect(d.part('panel').attrs).toMatchObject({ id: 'd-panel', hidden: true });
    t.fire(d.part('trigger'), 'click');
    expect(d.part('trigger').attrs['aria-expanded']).toBe(true);
    expect(d.part('panel').attrs['hidden']).toBeUndefined();
  });

  it('starts from defaultExpanded; a controlled one only reports', () => {
    expect(createDisclosure({ defaultExpanded: true }).state.expanded).toBe(true);
    const onExpandedChange = vi.fn();
    const t = createTestHost();
    const d = createDisclosure({ expanded: false, onExpandedChange }, t.host);
    t.fire(d.part('trigger'), 'click');
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(d.state.expanded).toBe(false);
    d.update({ expanded: true });
    expect(d.state.expanded).toBe(true);
  });
});

function accordion(options: Partial<AccordionOptions> = {}) {
  const t = createTestHost();
  const items = [{ key: 'ship' }, { key: 'returns', disabled: true }, { key: 'care' }];
  const a = createAccordion({ id: 'ac', items, ...options }, t.host);
  const click = (key: string) => t.fire(a.part('trigger', key), 'click');
  return { t, a, click };
}

describe('createAccordion', () => {
  it('labels each section by its button and opens one at a time', () => {
    const { a, click } = accordion();
    expect(a.part('panel', 'ship').attrs).toMatchObject({
      id: 'ac-panel-ship',
      role: 'region',
      'aria-labelledby': 'ac-trigger-ship',
      hidden: true,
    });
    click('ship');
    click('care');
    expect(a.state.value).toEqual(['care']);
    expect(a.part('trigger', 'ship').attrs['aria-expanded']).toBe(false);
  });

  it('opens several with multiple; ignores disabled sections', () => {
    const { a, click } = accordion({ multiple: true });
    click('ship');
    click('care');
    click('returns');
    expect(a.state.value).toEqual(['ship', 'care']);
    expect(a.part('trigger', 'returns').attrs['aria-disabled']).toBe(true);
  });

  it('keeps the last open section open when not collapsible, and says so', () => {
    const { a, click } = accordion({ collapsible: false, defaultValue: ['ship'] });
    expect(a.part('trigger', 'ship').attrs['aria-disabled']).toBe(true);
    click('ship');
    expect(a.state.value).toEqual(['ship']);
    click('care');
    expect(a.state.value).toEqual(['care']);
    expect(a.part('trigger', 'ship').attrs['aria-disabled']).toBeUndefined();
  });

  it('reports changes when controlled and waits for the new value', () => {
    const onValueChange = vi.fn();
    const { a, click } = accordion({ value: [], onValueChange });
    click('care');
    expect(onValueChange).toHaveBeenCalledWith(['care']);
    expect(a.state.value).toEqual([]);
    a.update({ value: ['care'] });
    expect(a.part('panel', 'care').attrs['hidden']).toBeUndefined();
  });

  it('locks the last open section that still exists, whatever the value still names', () => {
    const { a, click } = accordion({ collapsible: false, defaultValue: ['ship'] });
    a.update({ items: [{ key: 'care' }, { key: 'ship' }] });
    expect(a.part('trigger', 'ship').attrs['aria-disabled']).toBe(true);
    a.update({ items: [{ key: 'care' }] });
    click('care');
    expect(a.state.value).toEqual(['care']);
    expect(a.part('trigger', 'care').attrs['aria-disabled']).toBe(true);
  });

  it('keeps one section open when multiple is switched off', () => {
    const { a, click } = accordion({ multiple: true });
    click('ship');
    click('care');
    a.update({ multiple: false });
    expect(a.state.value).toEqual(['care']);
  });

  it('leaves an arrow that moves nowhere to the browser', () => {
    const { t, a } = accordion({ items: [{ key: 'only' }] });
    t.fire(a.part('trigger', 'only'), 'keydown', { key: 'ArrowDown' });
    expect(t.prevented).toBe(false);
  });

  it('leaves modified arrows to the browser', () => {
    const { t, a } = accordion();
    expect(t.fire(a.part('trigger', 'ship'), 'keydown', { key: 'ArrowDown', altKey: true })).toEqual([]);
    expect(t.prevented).toBe(false);
  });

  it('passes every row of its APG table', () => {
    expect(runConformance(disclosureApg, createAccordion as never).filter((r) => r.failures.length)).toEqual([]);
  });
});

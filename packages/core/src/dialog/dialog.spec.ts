import { describe, expect, it, vi } from 'vitest';
import { createTestHost } from '../testing/test-host.ts';
import { createDialog } from './index.ts';

describe('createDialog', () => {
  it('ties buttons to the dialog with invoker commands, and names it by its title and description', () => {
    const d = createDialog({ id: 'dl' });
    expect(d.part('trigger').attrs).toMatchObject({
      commandfor: 'dl-dialog',
      command: 'show-modal',
      'aria-haspopup': 'dialog',
      'aria-expanded': false,
    });
    expect(d.part('close').attrs).toMatchObject({ commandfor: 'dl-dialog', command: 'close' });
    expect(d.part('dialog').attrs).toMatchObject({
      id: 'dl-dialog',
      'aria-labelledby': 'dl-title',
      'aria-describedby': 'dl-description',
    });
    expect(d.part('title').attrs['id']).toBe('dl-title');
  });

  it('opens a non-modal dialog with show', () => {
    expect(createDialog({ id: 'dl', modal: false }).part('trigger').attrs['command']).toBe('show');
  });

  it('reports opening and closing, however they happened', () => {
    const onOpenChange = vi.fn();
    const t = createTestHost();
    const d = createDialog({ id: 'dl', onOpenChange }, t.host);
    t.fire(d.part('dialog'), 'toggle', { newState: 'open' });
    expect(d.state.open).toBe(true);
    expect(d.part('trigger').attrs['aria-expanded']).toBe(true);
    t.fire(d.part('dialog'), 'toggle', { newState: 'closed' });
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });
});

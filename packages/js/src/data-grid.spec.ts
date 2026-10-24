import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { destroy, init } from './index.ts';
import './data-grid.ts';

const MARKUP = `<div data-nib="data-grid" id="dg" lang="en" data-label="Orders" data-selectable>
  <table><thead><tr>
    <th data-column="order" data-sortable>Order</th>
    <th data-column="item" data-editable>Item</th>
  </tr></thead><tbody>
    <tr data-row="1042"><td>#1042</td><td>Kenya Nyeri</td></tr>
    <tr data-row="1041"><td>#1041</td><td>Decaf</td></tr>
  </tbody></table>
</div>`;
const cell = (text: string) => [...document.querySelectorAll('td')].find((td) => td.textContent === text);

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
});

describe('data grid (vanilla)', () => {
  it('renders the body from the markup rows, with one cell in the tab order', () => {
    document.body.innerHTML = MARKUP;
    init();
    expect(document.querySelector('table')?.getAttribute('role')).toBe('grid');
    expect(document.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    expect(cell('Decaf')?.id).toBe('dg-cell-1041::item');
  });

  it('edits a cell: Enter opens the editor, Enter saves, focus returns to the cell and nib:edit fires', async () => {
    document.body.innerHTML = MARKUP;
    init();
    const edits: unknown[] = [];
    document.body.addEventListener('nib:edit', (e) => edits.push((e as CustomEvent).detail));
    await userEvent.click(cell('Decaf') as HTMLElement);
    await userEvent.keyboard('{Enter}');
    const editor = document.querySelector('input') as HTMLInputElement;
    expect(document.activeElement).toBe(editor);
    await userEvent.fill(editor, 'Decaf Colombia');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => document.activeElement?.textContent).toBe('Decaf Colombia');
    expect(edits).toEqual([{ row: '1041', column: 'item', value: 'Decaf Colombia' }]);
  });
});

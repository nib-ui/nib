import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { destroy, init } from './index.ts';
import './listbox.ts';

const list = () => document.querySelector<HTMLElement>('[data-nib="listbox"]') as HTMLElement;
const option = (key: string) => list().querySelector<HTMLElement>(`[data-nib-option="${key}"]`) as HTMLElement;
// MutationObserver callbacks run as microtasks.
const settle = () => new Promise((resolve) => setTimeout(resolve));

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
});

describe('listbox (vanilla)', () => {
  it('follows options added, removed or disabled after init', async () => {
    document.body.innerHTML = `<ul data-nib="listbox" aria-label="Fruit">
      <li data-nib-option="apple">Apple</li><li data-nib-option="pear">Pear</li></ul>`;
    init();
    list().insertAdjacentHTML('beforeend', '<li data-nib-option="plum">Plum</li>');
    option('pear').setAttribute('data-disabled', '');
    await settle();
    expect(option('plum').getAttribute('role')).toBe('option');
    expect(option('pear').getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(option('plum'));
    expect(option('plum').getAttribute('aria-selected')).toBe('true');
    option('plum').remove();
    await settle();
    list().focus();
    await userEvent.keyboard('{End}');
    expect(list().getAttribute('aria-activedescendant')).toBe(option('apple').id);
  });

  it('starts from data-checked rows and reports changes once the DOM shows them', async () => {
    document.body.innerHTML = `<ul data-nib="listbox" data-multiple aria-label="Fruit">
      <li data-nib-option="apple" data-checked>Apple</li><li data-nib-option="pear">Pear</li></ul>`;
    init();
    expect(option('apple').getAttribute('aria-checked')).toBe('true');
    const seen: unknown[] = [];
    list().addEventListener('nib:change', (e) => {
      seen.push([(e as CustomEvent).detail, option('pear').getAttribute('aria-checked')]);
    });
    await userEvent.click(option('pear'));
    await expect.poll(() => seen).toEqual([[{ checked: ['apple', 'pear'] }, 'true']]);
  });
});

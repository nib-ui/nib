import { createTestList } from '@nib-ui/core/testing';
import { mountTwice } from '@nib-ui/test-harness/browser';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { bind, define, destroy, init } from './index.ts';

// The vanilla wiring of the test list: the root is the list, children marked data-nib-item are items.
define('test-list', (root, { id, locale, host }) => {
  const items = () => [...root.querySelectorAll<HTMLElement>('[data-nib-item]')];
  const list = createTestList({ items: items().map((el) => ({ key: el.dataset['nibItem'] ?? '' })), id, locale }, host);
  const unbind = bind(list, () => [
    { el: root, part: 'list' },
    ...items().map((el) => ({ el, part: 'item' as const, key: el.dataset['nibItem'] })),
  ]);
  return () => {
    unbind();
    list.destroy();
  };
});

const MARKUP = `<ul data-nib="test-list" tabindex="0" style="height:40px;overflow:auto;margin:0">
  ${Array.from({ length: 10 }, (_, i) => `<li data-nib-item="${i}" style="height:20px">${i}</li>`).join('')}
</ul>`;

const list = () => document.querySelector<HTMLElement>('[data-nib="test-list"]') as HTMLElement;
const current = () => list().querySelector('[data-current]')?.getAttribute('data-nib-item');

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
});

describe('@nib-ui/js', () => {
  it('enhances marked markup: attributes, keyboard, and intents run after the DOM is updated', async () => {
    document.documentElement.lang = 'vi';
    document.body.innerHTML = MARKUP;
    init();
    expect(list().getAttribute('role')).toBe('listbox');
    expect(list().getAttribute('data-locale')).toBe('vi');
    list().focus();
    for (let i = 0; i < 5; i++) await userEvent.keyboard('{ArrowDown}');
    expect(current()).toBe('4');
    expect(list().getAttribute('aria-activedescendant')).toBe(list().querySelector('[data-current]')?.id);
    // Item 4 ends at 100px, so the 40px list scrolled to show it.
    expect(list().scrollTop).toBe(60);
  });

  it('is idempotent: a second init binds nothing twice', async () => {
    document.body.innerHTML = MARKUP;
    init();
    init();
    init(list());
    list().focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(current()).toBe('1');
  });

  it('picks up elements added after the first init', () => {
    init();
    document.body.innerHTML = MARKUP;
    init(document.body);
    expect(list().getAttribute('role')).toBe('listbox');
  });

  it('destroy restores the markup and stops listening', async () => {
    document.body.innerHTML = MARKUP;
    const before = document.body.innerHTML;
    init();
    list().focus();
    await userEvent.keyboard('{ArrowDown}');
    destroy();
    expect(document.body.innerHTML).toBe(before);
    await userEvent.keyboard('{ArrowDown}');
    expect(current()).toBeUndefined();
  });

  it('survives mount, unmount, mount', () => {
    mountTwice(document.body.appendChild(document.createElement('div')), (host) => {
      host.innerHTML = MARKUP.replace('<ul ', '<ul id="fruits" ');
      init(host);
      return () => {
        destroy(host);
        host.innerHTML = '';
      };
    });
  });

  it('initialises the page by itself when the auto entry is imported', async () => {
    document.body.innerHTML = MARKUP;
    await import('./auto.ts');
    await Promise.resolve();
    expect(list().getAttribute('role')).toBe('listbox');
  });

  it('sets up the other components when one setup throws, then reports the failure', () => {
    define('broken', () => {
      throw new Error('boom');
    });
    document.body.innerHTML = `<div data-nib="broken"></div>${MARKUP}`;
    expect(() => init()).toThrow(AggregateError);
    expect(list().getAttribute('role')).toBe('listbox');
  });
});

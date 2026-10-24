import { createTestList } from '@nib-ui/core/testing';
import { mountTwice } from '@nib-ui/test-harness/browser';
import { Activity, createElement, StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { useController } from './index.ts';

const ITEMS = Array.from({ length: 10 }, (_, i) => ({ key: String(i) }));

function TestList({ id, locale }: { id?: string; locale?: string }) {
  const list = useController(createTestList, { items: ITEMS, id, locale });
  return createElement(
    'ul',
    { ...list.part('list'), tabIndex: 0, style: { height: 40, overflow: 'auto', margin: 0 } },
    ITEMS.map(({ key }) => createElement('li', { key, ...list.part('item', key), style: { height: 20 } }, key)),
  );
}

const list = () => document.querySelector<HTMLElement>('[role="listbox"]') as HTMLElement;
const current = () => list().querySelector('[data-current]')?.textContent;

afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
});

function render(element = createElement(TestList)) {
  const host = document.body.appendChild(document.createElement('div'));
  const root = createRoot(host);
  flushSync(() => root.render(createElement(StrictMode, null, element)));
  return root;
}

describe('@nib-ui/react', () => {
  it('renders parts, handles keys, and runs intents after the commit', async () => {
    render();
    expect(list().getAttribute('role')).toBe('listbox');
    list().focus();
    for (let i = 0; i < 5; i++) await userEvent.keyboard('{ArrowDown}');
    expect(current()).toBe('4');
    expect(list().getAttribute('aria-activedescendant')).toBe(list().querySelector('[data-current]')?.id);
    // Item 4 ends at 100px, so the 40px list scrolled to show it.
    expect(list().scrollTop).toBe(60);
  });

  it('survives strict mode and mount, unmount, mount', async () => {
    mountTwice(document.body.appendChild(document.createElement('div')), (host) => {
      const root = createRoot(host);
      // Separate roots number useId differently, so this test fixes the id.
      flushSync(() => root.render(createElement(StrictMode, null, createElement(TestList, { id: 'fruits' }))));
      return () => flushSync(() => root.unmount());
    });
    // The instance outlived strict mode's simulated unmount and still handles keys.
    render();
    list().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(current()).toBe('0');
  });

  it('hydrates server markup without a mismatch, taking the language from <html lang>', () => {
    document.documentElement.lang = 'vi';
    // The server knows the language from the request, so it passes it explicitly.
    const html = renderToString(createElement(TestList, { locale: 'vi' }));
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = html;
    const errors: unknown[] = [];
    flushSync(() => {
      hydrateRoot(host, createElement(TestList), { onRecoverableError: (e) => errors.push(e) });
    });
    expect(errors).toEqual([]);
    expect(host.innerHTML).toBe(html);
    expect(list().getAttribute('data-locale')).toBe('vi');
  });

  it('applies new options on re-render', () => {
    const root = render(createElement(TestList, { locale: 'en-US' }));
    flushSync(() => root.render(createElement(TestList, { locale: 'fr' })));
    expect(list().getAttribute('data-locale')).toBe('fr');
  });

  it('keeps working after <Activity> hides and shows it again', async () => {
    const show = (mode: 'visible' | 'hidden') => createElement(Activity, { mode }, createElement(TestList));
    const root = render(show('visible'));
    flushSync(() => root.render(createElement(StrictMode, null, show('hidden'))));
    await Promise.resolve();
    flushSync(() => root.render(createElement(StrictMode, null, show('visible'))));
    list().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(current()).toBe('0');
  });

  it('settles when options are rebuilt on every render', () => {
    function Inline({ n }: { n: number }) {
      const list = useController(createTestList, { items: [{ key: String(n) }] });
      return createElement('ul', list.part('list'));
    }
    const root = render(createElement(Inline, { n: 1 }));
    flushSync(() => root.render(createElement(Inline, { n: 2 })));
    expect(list().getAttribute('role')).toBe('listbox');
  });
});

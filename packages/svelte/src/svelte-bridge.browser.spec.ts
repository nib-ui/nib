import { mountTwice } from '@nib-ui/test-harness/browser';
import { flushSync, hydrate, mount, unmount } from 'svelte';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SSR_HTML from './__snapshots__/test-list.ssr.html?raw';
import { createTestList } from '@nib-ui/core/testing';
import { controller } from './index.ts';
import TestList from './test-list.fixture.svelte';

const list = () => document.querySelector<HTMLElement>('[role="listbox"]') as HTMLElement;
const current = () => list().querySelector('[data-current]')?.textContent;

let mounted: Record<string, unknown>[] = [];
afterEach(() => {
  for (const component of mounted) void unmount(component);
  mounted = [];
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
});

function render(props: Record<string, unknown> = {}) {
  const component = mount(TestList, { target: document.body.appendChild(document.createElement('div')), props });
  flushSync();
  mounted.push(component);
  return component;
}

describe('@nib-ui/svelte', () => {
  it('renders parts, handles keys, and runs intents after the DOM update', async () => {
    render();
    expect(list().getAttribute('role')).toBe('listbox');
    list().focus();
    for (let i = 0; i < 5; i++) await userEvent.keyboard('{ArrowDown}');
    expect(current()).toBe('4');
    expect(list().getAttribute('aria-activedescendant')).toBe(list().querySelector('[data-current]')?.id);
    // Item 4 ends at 100px, so the 40px list scrolled to show it.
    expect(list().scrollTop).toBe(60);
  });

  it('survives mount, unmount, mount', () => {
    mountTwice(document.body.appendChild(document.createElement('div')), (host) => {
      const component = mount(TestList, { target: host, props: { id: 'fruits' } });
      flushSync();
      return () => {
        void unmount(component);
        flushSync();
      };
    });
  });

  it('hydrates the server markup without a mismatch, taking the language from <html lang>', () => {
    document.documentElement.lang = 'vi';
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = SSR_HTML;
    const before = host.innerHTML;
    const warn = vi.spyOn(console, 'warn');
    mounted.push(hydrate(TestList, { target: host }));
    flushSync();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    expect(host.innerHTML).toBe(before);
    expect(list().getAttribute('data-locale')).toBe('vi');
  });

  it('publishes new options passed to update() to subscribers', () => {
    const list = controller(createTestList, { items: [], locale: 'en-US' });
    const seen: (string | undefined)[] = [];
    const stop = list.subscribe((view) => seen.push(view.part('list')['data-locale'] as string | undefined));
    list.update({ locale: 'fr' });
    stop();
    expect(seen).toEqual(['en-US', 'fr']);
  });

  it('keeps working when a subscriber comes back after the last one left', () => {
    const list = controller(createTestList, { items: [{ key: 'a' }] });
    list.subscribe(() => undefined)();
    let attrs: Record<string, unknown> = {};
    const stop = list.subscribe((view) => (attrs = view.part('list')));
    stop();
    expect(attrs['role']).toBe('listbox');
  });
});

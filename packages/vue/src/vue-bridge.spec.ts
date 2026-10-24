import { createTestList } from '@nib-ui/core/testing';
import { mountTwice } from '@nib-ui/test-harness/browser';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { useController } from './index.ts';

const ITEMS = Array.from({ length: 10 }, (_, i) => ({ key: String(i) }));

const TestList = defineComponent({
  props: { locale: String },
  setup(props) {
    const list = useController(createTestList, () => ({ items: ITEMS, locale: props.locale }));
    return () =>
      h(
        'ul',
        { ...list.part('list'), tabindex: 0, style: { height: '40px', overflow: 'auto', margin: 0 } },
        ITEMS.map(({ key }) => h('li', { key, ...list.part('item', key), style: { height: '20px' } }, key)),
      );
  },
});

const list = () => document.querySelector<HTMLElement>('[role="listbox"]') as HTMLElement;
const current = () => list().querySelector('[data-current]')?.textContent;

let apps: App[] = [];
afterEach(() => {
  for (const app of apps) app.unmount();
  apps = [];
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
});

function render(component = TestList, props?: Record<string, unknown>) {
  const app = createApp(component, props);
  app.mount(document.body.appendChild(document.createElement('div')));
  apps.push(app);
  return app;
}

describe('@nib-ui/vue', () => {
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
      const app = createApp(TestList);
      app.mount(host);
      return () => app.unmount();
    });
  });

  it('hydrates server markup without a mismatch, taking the language from <html lang>', async () => {
    document.documentElement.lang = 'vi';
    // The server knows the language from the request, so it passes it explicitly.
    const html = await renderToString(createSSRApp(TestList, { locale: 'vi' }));
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = html;
    const warnings: string[] = [];
    const app = createSSRApp(TestList);
    app.config.warnHandler = (message) => warnings.push(message);
    app.mount(host);
    apps.push(app);
    expect(warnings).toEqual([]);
    expect(host.innerHTML).toBe(html);
    expect(list().getAttribute('data-locale')).toBe('vi');
  });

  it('applies new options when the getter changes', async () => {
    const locale = ref('en-US');
    render(defineComponent({ setup: () => () => h(TestList, { locale: locale.value }) }));
    locale.value = 'fr';
    await nextTick();
    await nextTick();
    expect(list().getAttribute('data-locale')).toBe('fr');
  });

  it('re-renders when only an option changes, even one the template never reads', async () => {
    const locale = ref('en-US');
    render(
      defineComponent({
        setup() {
          const list = useController(createTestList, () => ({ items: ITEMS, locale: locale.value }));
          return () => h('ul', list.part('list'));
        },
      }),
    );
    locale.value = 'fr';
    await nextTick();
    await nextTick();
    expect(list().getAttribute('data-locale')).toBe('fr');
  });
});

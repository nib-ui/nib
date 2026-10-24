import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TestList from './test-list.fixture.svelte';

describe('@nib-ui/svelte on the server', () => {
  it('renders the parts; the browser test hydrates this exact markup', async () => {
    // The server knows the language from the request, so it passes it explicitly.
    const { body } = render(TestList, { props: { locale: 'vi' } });
    expect(body).toContain('role="listbox"');
    expect(body).toContain('data-locale="vi"');
    await expect(body).toMatchFileSnapshot('./__snapshots__/test-list.ssr.html');
  });
});

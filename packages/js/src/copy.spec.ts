import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { destroy, init } from './index.ts';
import './copy.ts';

const button = () => document.querySelector<HTMLButtonElement>('[data-nib="copy"]') as HTMLButtonElement;
const live = () => document.querySelector('[data-nib-live="polite"]')?.textContent;

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('copy (vanilla)', () => {
  it('copies the code of its block, says COPIED ✓, announces it, then goes back', async () => {
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    document.body.innerHTML = `<figure class="nib-code">
      <button data-nib="copy" type="button">Copy</button><pre><code>pnpm add @nib-ui/css</code></pre></figure>`;
    init();
    await userEvent.click(button());
    expect(write).toHaveBeenCalledWith('pnpm add @nib-ui/css');
    await expect.poll(() => button().textContent).toBe('Copied ✓');
    expect(button().hasAttribute('data-copied')).toBe(true);
    // The tick is decoration: the name is the word.
    expect(button().querySelector('[aria-hidden="true"]')?.textContent).toBe(' ✓');
    await expect.poll(live).toBe('Copied');
    await expect.poll(() => button().textContent, { timeout: 4000 }).toBe('Copy');
    expect(button().hasAttribute('data-copied')).toBe(false);
  });

  it('copies the element named by data-copy-target, in the words the page gives', async () => {
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    document.body.innerHTML = `<p id="key">sk-test-123</p>
      <button data-nib="copy" data-copy-target="key" data-copied-label="Đã chép" type="button">Chép</button>`;
    init();
    await userEvent.click(button());
    expect(write).toHaveBeenCalledWith('sk-test-123');
    await expect.poll(() => button().textContent).toBe('Đã chép ✓');
  });

  it('announces a failure assertively when the clipboard refuses', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    document.body.innerHTML = `<figure class="nib-code"><button data-nib="copy" type="button">Copy</button><pre>x</pre></figure>`;
    init();
    await userEvent.click(button());
    await expect.poll(() => document.querySelector('[data-nib-live="assertive"]')?.textContent).toBe('Copy failed');
    expect(button().textContent).toBe('Copy');
  });

  it('restores the button and stops listening on destroy', async () => {
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    document.body.innerHTML = `<figure class="nib-code"><button data-nib="copy" type="button">Copy</button><pre>x</pre></figure>`;
    init();
    destroy();
    await userEvent.click(button());
    expect(write).not.toHaveBeenCalled();
  });
});

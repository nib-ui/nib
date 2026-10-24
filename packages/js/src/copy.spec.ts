import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { destroy, init } from './index.ts';
import './copy.ts';

const button = () => document.querySelector<HTMLButtonElement>('[data-nib="copy"]') as HTMLButtonElement;
const live = (politeness: string) => document.querySelector(`[data-nib-live="${politeness}"]`)?.textContent;
const BLOCK = `<figure class="nib-code"><button data-nib="copy" type="button">Copy</button><pre><code>pnpm add @nib-ui/css</code></pre></figure>`;

afterEach(() => {
  destroy();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('copy (vanilla)', () => {
  it('copies the code of its block, says Copied ✓, announces it, then goes back', async () => {
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    document.body.innerHTML = BLOCK;
    init();
    await userEvent.click(button());
    expect(write).toHaveBeenCalledWith('pnpm add @nib-ui/css');
    await expect.poll(() => button().textContent).toBe('Copied ✓');
    expect(button().hasAttribute('data-copied')).toBe(true);
    expect(button().querySelector('.nib-copy-tick')?.getAttribute('aria-hidden')).toBe('true');
    await expect.poll(() => live('polite')).toBe('Copied');
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

  it('a second click while copied starts over and still restores the original words', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    document.body.innerHTML = BLOCK;
    init();
    await userEvent.click(button());
    await expect.poll(() => button().textContent).toBe('Copied ✓');
    await userEvent.click(button());
    await expect.poll(() => button().textContent).toBe('Copied ✓');
    await expect.poll(() => button().textContent, { timeout: 4000 }).toBe('Copy');
  });

  it('shows and announces a failure when the clipboard refuses, replacing a shown success', async () => {
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    document.body.innerHTML = BLOCK;
    init();
    await userEvent.click(button());
    await expect.poll(() => button().textContent).toBe('Copied ✓');
    write.mockRejectedValue(new Error('denied'));
    await userEvent.click(button());
    await expect.poll(() => button().textContent).toBe('Copy failed');
    expect(button().hasAttribute('data-copied')).toBe(false);
    expect(button().hasAttribute('data-failed')).toBe(true);
    await expect.poll(() => live('assertive')).toBe('Copy failed');
  });

  it('fails without touching the clipboard when there is nothing to copy', async () => {
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    document.body.innerHTML = `<button data-nib="copy" data-copy-target="missing" type="button">Copy</button>`;
    init();
    await userEvent.click(button());
    await expect.poll(() => button().textContent).toBe('Copy failed');
    expect(write).not.toHaveBeenCalled();
  });

  it('on destroy while copied, puts the words back and stops listening', async () => {
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    document.body.innerHTML = BLOCK;
    init();
    await userEvent.click(button());
    await expect.poll(() => button().textContent).toBe('Copied ✓');
    destroy();
    expect(button().textContent).toBe('Copy');
    expect(button().hasAttribute('data-copied')).toBe(false);
    await userEvent.click(button());
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('does nothing when destroyed while the clipboard is still writing', async () => {
    let resolve = () => undefined as void;
    vi.spyOn(navigator.clipboard, 'writeText').mockReturnValue(new Promise<void>((r) => (resolve = r)));
    document.body.innerHTML = BLOCK;
    init();
    await userEvent.click(button());
    destroy();
    resolve();
    await new Promise((r) => setTimeout(r, 50));
    expect(button().textContent).toBe('Copy');
  });
});

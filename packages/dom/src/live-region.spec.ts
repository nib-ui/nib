import { fakeClock } from '@nib-ui/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { announce, runIntents } from './index.ts';

const regions = () => [...document.querySelectorAll<HTMLElement>('[data-nib-live]')];
const region = (politeness: string) => document.querySelector<HTMLElement>(`[data-nib-live="${politeness}"]`);

afterEach(() => {
  for (const r of regions()) r.remove();
});

describe('live region', () => {
  it('speaks an announce intent through a polite status region', () => {
    const clock = fakeClock();
    runIntents([{ type: 'announce', text: '3 kết quả', politeness: 'polite' }], { clock });
    clock.advance(100);
    const polite = region('polite');
    expect(polite?.textContent).toBe('3 kết quả');
    expect(polite?.getAttribute('aria-live')).toBe('polite');
    expect(polite?.getAttribute('role')).toBe('status');
    // The whole message is read, not just the part that changed.
    expect(polite?.getAttribute('aria-atomic')).toBe('true');
  });

  it('keeps one region per politeness for the whole page, assertive as an alert', () => {
    const clock = fakeClock();
    announce('a', 'polite', { clock });
    announce('b', 'assertive', { clock });
    announce('c', 'polite', { clock });
    clock.advance(100);
    expect(regions()).toHaveLength(2);
    expect(region('polite')?.textContent).toBe('c');
    expect(region('assertive')?.textContent).toBe('b');
    expect(region('assertive')?.getAttribute('role')).toBe('alert');
    expect(region('assertive')?.getAttribute('aria-live')).toBe('assertive');
  });

  it('empties the region before writing, so the same message is spoken twice', () => {
    const clock = fakeClock();
    announce('Đã lưu', 'polite', { clock });
    clock.advance(100);
    announce('Đã lưu', 'polite', { clock });
    expect(region('polite')?.textContent).toBe('');
    clock.advance(100);
    expect(region('polite')?.textContent).toBe('Đã lưu');
  });

  it('drops a pending message when a newer one arrives first', async () => {
    const clock = fakeClock();
    announce('old', 'polite', { clock });
    const polite = region('polite');
    if (!polite) throw new Error('no polite region');
    const observer = new MutationObserver(() => undefined);
    observer.observe(polite, { childList: true });
    clock.advance(50);
    announce('new', 'polite', { clock });
    clock.advance(200);
    const written = observer.takeRecords().flatMap((r) => [...r.addedNodes].map((n) => n.textContent));
    observer.disconnect();
    expect(written).toEqual(['new']);
  });

  it('hides the region from sight but not from assistive technology', () => {
    document.body.innerHTML = '<p style="margin:0">before</p>';
    const before = document.body.getBoundingClientRect().height;
    const clock = fakeClock();
    announce('a long message that would otherwise take up a whole line or more', 'polite', { clock });
    clock.advance(100);
    const polite = region('polite');
    if (!polite) throw new Error('no polite region');
    const style = getComputedStyle(polite);
    expect(style.display).not.toBe('none');
    expect(style.visibility).toBe('visible');
    expect(polite.getAttribute('aria-hidden')).toBeNull();
    expect(polite.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    expect(document.body.getBoundingClientRect().height).toBe(before);
    document.body.innerHTML = '';
  });

  it('speaks from inside an open modal dialog, which makes the rest of the page inert', () => {
    document.body.innerHTML = '<dialog id="d"><button>OK</button></dialog>';
    const dialog = document.getElementById('d') as HTMLDialogElement;
    dialog.showModal();
    const clock = fakeClock();
    announce('Đã xoá', 'assertive', { clock });
    clock.advance(100);
    expect(region('assertive')?.parentElement).toBe(dialog);
    dialog.close();
    announce('Xong', 'assertive', { clock });
    clock.advance(100);
    expect(region('assertive')?.parentElement).toBe(document.body);
    expect(regions()).toHaveLength(1);
    document.body.innerHTML = '';
  });
});

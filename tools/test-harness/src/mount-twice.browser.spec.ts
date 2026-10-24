import { describe, expect, it } from 'vitest';
import { mountTwice } from './mount-twice.ts';

// A component that cleans up after itself: one node and one listener, both removed on unmount.
const clean = (host: HTMLElement) => {
  const button = document.createElement('button');
  button.textContent = 'Run';
  const onClick = () => button.setAttribute('aria-pressed', 'true');
  button.addEventListener('click', onClick);
  host.append(button);
  return () => {
    button.removeEventListener('click', onClick);
    button.remove();
  };
};

describe('mountTwice', () => {
  it('passes a component that leaves nothing behind and renders the same twice', () => {
    const host = document.createElement('div');
    document.body.append(host);
    expect(() => mountTwice(host, clean)).not.toThrow();
    expect(host.innerHTML).toBe('');
  });

  it('fails a component that leaves DOM behind after unmount', () => {
    const host = document.createElement('div');
    const leaky = (h: HTMLElement) => {
      h.append(document.createElement('span'));
      return () => undefined;
    };
    expect(() => mountTwice(host, leaky)).toThrow('left <span></span> behind after unmount');
  });

  it('fails a component whose second mount renders differently', () => {
    const host = document.createElement('div');
    let count = 0;
    const stateful = (h: HTMLElement) => {
      const p = document.createElement('p');
      p.textContent = String(++count);
      h.append(p);
      return () => p.remove();
    };
    expect(() => mountTwice(host, stateful)).toThrow('rendered <p>2</p> on the second mount, <p>1</p> on the first');
  });
});

/** Renders into `host` and returns the function that removes it again. */
export type Mount = (host: HTMLElement) => () => void;

/**
 * Mounts, unmounts and mounts again, the sequence SPA routers and framework strict modes put
 * every component through. Throws if anything is left behind after unmount or if the second
 * render differs from the first; leaves `host` empty when it passes.
 */
export function mountTwice(host: HTMLElement, mount: Mount): void {
  const first = mount(host);
  const firstHtml = host.innerHTML;
  first();
  if (host.innerHTML !== '') throw new Error(`Component left ${host.innerHTML} behind after unmount`);
  const second = mount(host);
  const secondHtml = host.innerHTML;
  second();
  if (secondHtml !== firstHtml) {
    throw new Error(`Component rendered ${secondHtml} on the second mount, ${firstHtml} on the first`);
  }
  if (host.innerHTML !== '') throw new Error(`Component left ${host.innerHTML} behind after unmount`);
}

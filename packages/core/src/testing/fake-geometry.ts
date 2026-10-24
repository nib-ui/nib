import type { Geometry, Rect, Size } from '../host.ts';

export interface FakeGeometry extends Geometry {
  setRect(ref: string, rect: Rect): void;
  setViewport(size: Size): void;
  /** Tells every watcher that layout changed, as a resize or scroll would. */
  changed(): void;
  setDirection(dir: 'ltr' | 'rtl'): void;
}

export function fakeGeometry(viewport: Size = { width: 1280, height: 800 }): FakeGeometry {
  const rects = new Map<string, Rect>();
  const watchers = new Set<() => void>();
  let size = viewport;
  let dir: 'ltr' | 'rtl' = 'ltr';
  return {
    direction: () => dir,
    setDirection: (next) => void (dir = next),
    measure: (ref) => rects.get(ref) ?? null,
    viewport: () => size,
    watch(fn) {
      watchers.add(fn);
      return () => watchers.delete(fn);
    },
    setRect: (ref, rect) => void rects.set(ref, rect),
    setViewport: (next) => void (size = next),
    changed: () => watchers.forEach((fn) => fn()),
  };
}

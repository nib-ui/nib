import type { Geometry } from '@nib-ui/core';

/**
 * Core's layout seam backed by the real document: viewport-relative boxes, as positioning needs.
 * Known limits: `viewport()` is the visual viewport, so under pinch zoom or an on-screen keyboard
 * it is smaller than the layout viewport the boxes are measured in, and placement stays inside the
 * visible part; elements and scroll containers inside shadow roots are not seen.
 */
export function domGeometry(doc: Document = document): Geometry {
  return {
    measure(ref) {
      const el = doc.getElementById(ref);
      if (!el) return null;
      const { x, y, width, height } = el.getBoundingClientRect();
      return { x, y, width, height };
    },
    viewport() {
      const view = doc.defaultView;
      // The visual viewport shrinks when a virtual keyboard or pinch zoom covers part of the page.
      const visible = view?.visualViewport;
      if (visible) return { width: visible.width, height: visible.height };
      return { width: view?.innerWidth ?? 0, height: view?.innerHeight ?? 0 };
    },
    watch(fn) {
      const view = doc.defaultView;
      if (!view) return () => undefined;
      // Scrolling fires many events per frame; layout is read at most once per frame.
      let frame = 0;
      const schedule = () => {
        if (!frame) frame = view.requestAnimationFrame(() => {
          frame = 0;
          fn();
        });
      };
      // Scroll does not bubble; capturing on the document hears every scroll container.
      // Content that grows or shrinks moves everything below it. Its first call comes one frame in.
      const resize = view.ResizeObserver ? new view.ResizeObserver(schedule) : undefined;
      resize?.observe(doc.documentElement);
      doc.addEventListener('scroll', schedule, { capture: true, passive: true });
      view.addEventListener('resize', schedule);
      // A virtual keyboard or pinch zoom moves the visual viewport without resizing the window.
      view.visualViewport?.addEventListener('resize', schedule);
      view.visualViewport?.addEventListener('scroll', schedule);
      return () => {
        doc.removeEventListener('scroll', schedule, { capture: true });
        view.removeEventListener('resize', schedule);
        view.visualViewport?.removeEventListener('resize', schedule);
        view.visualViewport?.removeEventListener('scroll', schedule);
        resize?.disconnect();
        view.cancelAnimationFrame(frame);
      };
    },
  };
}

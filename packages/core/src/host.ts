/** Time, the first of the core's two seams. */
export interface Clock {
  now(): number;
  /** Runs `fn` after `ms`; returns a function that cancels it. */
  after(ms: number, fn: () => void): () => void;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Layout, the second seam: element boxes by id, the viewport, and a way to hear about changes. */
export interface Geometry {
  /** The box of the element with this id, or null when it is not rendered. */
  measure(ref: string): Rect | null;
  viewport(): Size;
  /** Calls `fn` when layout may have changed (resize, scroll); returns a function that stops it. */
  watch(fn: () => void): () => void;
  /** The writing direction at the element with this id; absent means left to right. */
  direction?(ref: string): 'ltr' | 'rtl';
}

/** What a controller may use from its environment. Omit it on the server. */
export interface Host {
  clock: Clock;
  geometry: Geometry;
}

const noop = () => undefined;

/** For server rendering: time stands still and no timer ever fires. */
export const nullClock: Clock = { now: () => 0, after: () => noop };

/** For server rendering: nothing is measured. */
export const nullGeometry: Geometry = {
  measure: () => null,
  viewport: () => ({ width: 0, height: 0 }),
  watch: () => noop,
};

export const nullHost: Host = { clock: nullClock, geometry: nullGeometry };

// Every JS runtime has timers, but core compiles without the DOM or Node types; declare only these.
const timers = globalThis as unknown as {
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(id: unknown): void;
};

/** The real clock. Timers only, no DOM, so it lives in core. */
export const systemClock: Clock = {
  now: () => Date.now(),
  after: (ms, fn) => {
    const id = timers.setTimeout(fn, ms);
    return () => timers.clearTimeout(id);
  },
};

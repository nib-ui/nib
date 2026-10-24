import type { Clock } from '../host.ts';

export interface FakeClock extends Clock {
  /** Moves time forward, running every timer that falls due on the way, in order. */
  advance(ms: number): void;
}

/** A clock tests drive by hand; starts at 0. */
export function fakeClock(): FakeClock {
  let time = 0;
  let seq = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  return {
    now: () => time,
    after(ms, fn) {
      const id = seq++;
      timers.set(id, { at: time + Math.max(0, ms), fn });
      return () => timers.delete(id);
    },
    advance(ms) {
      const end = time + Math.max(0, ms);
      for (;;) {
        // The earliest due timer; ties run in the order they were scheduled.
        let next: [number, { at: number; fn: () => void }] | undefined;
        for (const entry of timers) if (entry[1].at <= end && (!next || entry[1].at < next[1].at)) next = entry;
        if (!next) break;
        timers.delete(next[0]);
        time = next[1].at;
        next[1].fn();
      }
      time = end;
    },
  };
}

import { describe, expect, it } from 'vitest';
import { nullClock } from '../host.ts';
import { fakeClock } from './fake-clock.ts';

describe('fakeClock', () => {
  it('runs due timers in time order as time advances', () => {
    const clock = fakeClock();
    const log: string[] = [];
    clock.after(300, () => log.push('b'));
    clock.after(100, () => log.push('a'));
    clock.advance(299);
    expect(log).toEqual(['a']);
    expect(clock.now()).toBe(299);
    clock.advance(1);
    expect(log).toEqual(['a', 'b']);
  });

  it('runs a timer scheduled by another timer when it falls inside the same advance', () => {
    const clock = fakeClock();
    const log: number[] = [];
    clock.after(100, () => clock.after(100, () => log.push(clock.now())));
    clock.advance(500);
    expect(log).toEqual([200]);
  });

  it('never runs a cancelled timer', () => {
    const clock = fakeClock();
    let ran = false;
    const cancel = clock.after(50, () => (ran = true));
    cancel();
    clock.advance(100);
    expect(ran).toBe(false);
  });
});

describe('nullClock', () => {
  it('never fires, so server rendering starts no timers', () => {
    let ran = false;
    nullClock.after(0, () => (ran = true));
    expect(ran).toBe(false);
    expect(nullClock.now()).toBe(0);
  });
});
